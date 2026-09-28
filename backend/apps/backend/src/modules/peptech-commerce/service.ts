import { createHash } from "node:crypto"
import { AsyncLocalStorage } from "node:async_hooks"
const { Pool } = require("pg")
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
    this.pool = new Pool({ connectionString: options.databaseUrl, max: 6,
      connectionTimeoutMillis: 5000, application_name: "peptech-commerce" })
    this.lockPool = new Pool({ connectionString: options.databaseUrl, max: 2, connectionTimeoutMillis: 5000, application_name: "peptech-commerce-locks" })
  }
  async __onApplicationShutdown() { await Promise.all([this.pool.end(), this.lockPool.end()]) }
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
  // Session advisory locks use a dedicated connection, never a pooled query pair.
  // Disconnect releases the lock. Durable operations + provider idempotency recover
  // a process crash; application memory is never the concurrency authority.
  async locked<T>(key: string, work: () => Promise<T>): Promise<T> {
    const parent = this.lockContext.getStore()
    const connection = parent || await this.lockPool.connect()
    let acquired = false
    try {
      const result = await connection.query("SELECT pg_try_advisory_lock(hashtextextended($1,0)) AS acquired", [key])
      acquired = result.rows[0].acquired
      if (!acquired) { const error: any = new Error("This operation is already processing. Retry the same request."); error.status = 409; throw error }
      return await this.lockContext.run(connection, work)
    } finally {
      if (acquired) {
        try { await connection.query("SELECT pg_advisory_unlock(hashtextextended($1,0))", [key]) }
        catch { if(!parent)connection.release(true); throw new Error("Commerce lock connection lost; reconcile operation before retry") }
      }
      if (!parent) connection.release()
    }
  }
}
