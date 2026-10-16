import { createHash } from "node:crypto"
import { AsyncLocalStorage } from "node:async_hooks"
const { Pool } = require("pg")

let sharedCommercePool: any = null
let sharedCommerceLockPool: any = null

function getSharedPool(databaseUrl: string) {
  if (!sharedCommercePool) {
    sharedCommercePool = new Pool({
      connectionString: databaseUrl,
      max: 4,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      application_name: "peptech-commerce",
    })
    sharedCommercePool.on("error", (err: any) => {
      console.warn("[CommerceService Pool Error]:", err?.message || err)
    })
  }
  return sharedCommercePool
}

function getSharedLockPool(databaseUrl: string) {
  if (!sharedCommerceLockPool) {
    sharedCommerceLockPool = new Pool({
      connectionString: databaseUrl,
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      application_name: "peptech-commerce-locks",
    })
    sharedCommerceLockPool.on("error", (err: any) => {
      console.warn("[CommerceService LockPool Error]:", err?.message || err)
    })
  }
  return sharedCommerceLockPool
}

export type LedgerRecord<T = Record<string, any>> = {
  id: string; kind: string; profile: string; owner_id: string | null; state: string;
  data: T; created_at: Date; updated_at: Date
}
export function recordId(kind: string, ...parts: string[]) {
  return `${kind}_${createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 40)}`
}
export default class CommerceService {
  private pool: any
  private lockPool: any
  private lockContext = new AsyncLocalStorage<any>()
  constructor(_container: unknown, options: { databaseUrl: string }) {
    if (!options.databaseUrl) throw new Error("Commerce database URL is required")
    this.pool = getSharedPool(options.databaseUrl)
    this.lockPool = getSharedLockPool(options.databaseUrl)
  }
  async __onApplicationShutdown() { /* shared pools stay alive across transient lifecycles */ }
  async get<T = Record<string, any>>(id: string): Promise<LedgerRecord<T> | null> {
    return (await this.pool.query("SELECT * FROM peptech_commerce_record WHERE id=$1", [id])).rows[0] || null
  }
  async create(record: Pick<LedgerRecord, "id" | "kind" | "profile" | "owner_id" | "state" | "data">): Promise<LedgerRecord> {
    const result = await this.pool.query(`INSERT INTO peptech_commerce_record(id,kind,profile,owner_id,state,data)
      VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING RETURNING *`,
      [record.id,record.kind,record.profile,record.owner_id,record.state,JSON.stringify(record.data)])
    return result.rows[0] || await this.get(record.id) as LedgerRecord
  }
  async save(record: LedgerRecord) {
    await this.pool.query("UPDATE peptech_commerce_record SET state=$2,data=$3,updated_at=now() WHERE id=$1",
      [record.id,record.state,JSON.stringify(record.data)])
    return record
  }
  async patch(id:string,data:Record<string,unknown>,state?:string) {
    await this.pool.query("UPDATE peptech_commerce_record SET data=data || $2::jsonb,state=COALESCE($3,state),updated_at=now() WHERE id=$1",[id,JSON.stringify(data),state||null])
  }
  async list(kind: string, options: { profile?: string; owner?: string; state?: string; excludeStates?:string[]; data?:Record<string,unknown>; limit?: number; offset?: number; oldestFirst?: boolean } = {}) {
    const values: any[] = [kind]; const where = ["kind=$1"]
    for (const [column,value] of [["profile",options.profile],["owner_id",options.owner],["state",options.state]]) {
      if (value !== undefined) { values.push(value); where.push(`${column}=$${values.length}`) }
    }
    if(options.excludeStates?.length){values.push(options.excludeStates);where.push(`NOT(state=ANY($${values.length}::text[]))`)}
    if(options.data){values.push(JSON.stringify(options.data));where.push(`data @> $${values.length}::jsonb`)}
    values.push(Math.min(options.limit || 100, 500), Math.max(options.offset || 0, 0))
    return (await this.pool.query(`SELECT * FROM peptech_commerce_record WHERE ${where.join(" AND ")}
      ORDER BY updated_at ${options.oldestFirst ? "ASC" : "DESC"},id LIMIT $${values.length-1} OFFSET $${values.length}`, values)).rows as LedgerRecord[]
  }
  async audit(id: string, actor: string, action: string, details: Record<string, unknown> = {}) {
    await this.pool.query("INSERT INTO peptech_commerce_audit(record_id,actor_id,action,details) VALUES($1,$2,$3,$4)",
      [id,actor,action,JSON.stringify(details)])
  }
  // Transaction-level advisory locks are bound to the transaction scope and auto-released
  // on COMMIT/ROLLBACK, preventing advisory lock leaks across PgBouncer pooled connections.
  async locked<T>(key: string, work: () => Promise<T>): Promise<T> {
    const parent = this.lockContext.getStore()
    if (parent) return work()
    const connection = await this.lockPool.connect()
    let inTransaction = false
    try {
      await connection.query("BEGIN")
      inTransaction = true
      let acquired = false
      for (let attempt = 0; attempt < 5; attempt++) {
        const result = await connection.query("SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) AS acquired", [key])
        acquired = result.rows[0]?.acquired === true
        if (acquired) break
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
      if (!acquired) {
        const error: any = new Error("This operation is already processing. Retry the same request.")
        error.status = 409
        throw error
      }
      const output = await this.lockContext.run(connection, work)
      await connection.query("COMMIT")
      inTransaction = false
      return output
    } catch (err) {
      if (inTransaction) {
        try { await connection.query("ROLLBACK") } catch {}
      }
      throw err
    } finally {
      connection.release()
    }
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query("DELETE FROM peptech_commerce_record WHERE id=$1", [id])
    return (res.rowCount || 0) > 0
  }

  async findDevicePassport(query: string): Promise<LedgerRecord | null> {
    await this.seedInitialPassports()
    const clean = query.trim()
    const upper = clean.toUpperCase()
    const res = await this.pool.query(
      `SELECT * FROM peptech_commerce_record
       WHERE kind = 'device_passport'
         AND (
           UPPER(id) = $1
           OR UPPER(id) = UPPER($2)
           OR UPPER(data->>'serial_number') = $1
           OR UPPER(data->>'batch_number') = $1
           OR UPPER(data->>'serial_number') = $3
         )
       LIMIT 1`,
      [upper, `devpass_${upper}`, clean]
    )
    return res.rows[0] || null
  }

  async listDevicePassports(options: { search?: string; status?: string; limit?: number; offset?: number } = {}) {
    await this.seedInitialPassports()
    const values: any[] = ["device_passport"]
    const where: string[] = ["kind = $1"]

    if (options.status && options.status !== "all") {
      values.push(options.status)
      where.push(`state = $${values.length}`)
    }

    if (options.search && options.search.trim()) {
      values.push(`%${options.search.trim()}%`)
      where.push(`(
        data->>'serial_number' ILIKE $${values.length}
        OR data->>'batch_number' ILIKE $${values.length}
        OR data->>'product_name' ILIKE $${values.length}
        OR id ILIKE $${values.length}
      )`)
    }

    const countRes = await this.pool.query(
      `SELECT count(*) as total FROM peptech_commerce_record WHERE ${where.join(" AND ")}`,
      values
    )
    const total = parseInt(countRes.rows[0]?.total || "0", 10)

    values.push(Math.min(options.limit || 50, 200))
    values.push(Math.max(options.offset || 0, 0))

    const query = `SELECT * FROM peptech_commerce_record WHERE ${where.join(" AND ")}
      ORDER BY updated_at DESC, id LIMIT $${values.length - 1} OFFSET $${values.length}`

    const rowsRes = await this.pool.query(query, values)
    return { records: rowsRes.rows as LedgerRecord[], total }
  }

  private hasSeededPassports = false
  async seedInitialPassports(): Promise<void> {
    if (this.hasSeededPassports) return
    this.hasSeededPassports = true
    try {
      const initialDevices = [
        {
          serial_number: "PT-26-000184",
          product_name: "PEPTECH® Reusable Precision Pen 1.0",
          batch_number: "RT-2609A",
          manufacture_date: "01/2026",
          expiry_date: "01/2029",
          device_type: "Precision Pen Device",
          notes: "Card Authenticated - Photo verified physical device passport",
        },
        {
          serial_number: "PT-26-000185",
          product_name: "PEPTECH® Reusable Precision Pen 1.0",
          batch_number: "RT-2609A",
          manufacture_date: "01/2026",
          expiry_date: "01/2029",
          device_type: "Precision Pen Device",
          notes: "Standard production run",
        },
        {
          serial_number: "PT-984128",
          product_name: "PEPTECH® Reusable Precision Pen 1.0",
          batch_number: "RT-2609A",
          manufacture_date: "09/2025",
          expiry_date: "09/2028",
          device_type: "Precision Pen Device",
          notes: "Launch batch device passport",
        },
      ]

      for (const dev of initialDevices) {
        const id = `devpass_${dev.serial_number.toUpperCase().replace(/[^A-Z0-9_-]/g, "")}`
        await this.create({
          id,
          kind: "device_passport",
          profile: "device",
          owner_id: null,
          state: "active",
          data: {
            ...dev,
            nfc_enabled: true,
            qr_enabled: true,
            security_seal: "HOLOGRAPHIC-VERIFIED",
          },
        })
      }
    } catch (e) {
      console.warn("[seedInitialPassports] Notice:", (e as any)?.message || e)
    }
  }
}

