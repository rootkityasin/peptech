import CommerceService, { recordId } from "../../../modules/peptech-commerce/service"
import { schema } from "../../../modules/peptech-commerce/schema"
const url = process.env.COMMERCE_TEST_DATABASE_URL
const suite = url ? describe : describe.skip
suite("isolated PostgreSQL commerce ledger", () => {
  let ledger: CommerceService
  let pool: any
  beforeAll(async () => {
    const parsed = new URL(url!)
    if (!["localhost","127.0.0.1"].includes(parsed.hostname) || !parsed.pathname.endsWith("_test")) throw new Error("Isolated test DB required")
    pool = new (require("pg").Pool)({ connectionString:url })
    await pool.query(schema)
    await pool.query("TRUNCATE peptech_commerce_record,peptech_commerce_audit")
    ledger = new CommerceService({}, { databaseUrl: url! })
  })
  afterAll(async () => { await ledger?.__onApplicationShutdown(); await pool?.end() })
  it("migrates idempotently and converges concurrent creates", async () => {
    await pool.query(schema)
    const input = { id:recordId("receipt","acct_a","in_a"),kind:"receipt",profile:"acct_a:test",owner_id:"cus_a",state:"pending",data:{} }
    const records = await Promise.all(Array.from({length:12}, () => ledger.create(input)))
    expect(new Set(records.map(r=>r.id)).size).toBe(1)
    expect((await ledger.list("receipt")).length).toBe(1)
  })
  it("serializes workers and releases locks after failure", async () => {
    const otherWorker=new CommerceService({}, {databaseUrl:url!})
    try {
      await ledger.locked("same-operation", async () => {
        await expect(otherWorker.locked("same-operation", async()=>"double-charge")).rejects.toMatchObject({status:409})
        expect(await ledger.locked("same-operation",()=>ledger.locked("nested-operation",async()=>"nested"))).toBe("nested")
      })
    } finally {await otherWorker.__onApplicationShutdown()}
    await expect(ledger.locked("same-operation", async()=>{ throw new Error("crash") })).rejects.toThrow("crash")
    expect(await ledger.locked("same-operation", async()=>"recovered")).toBe("recovered")
  })
  it("separates account resources and records operator evidence", async () => {
    expect(recordId("price","acct_a","sku_a")).not.toBe(recordId("price","acct_b","sku_a"))
    await ledger.audit("record","admin","review",{evidence_ref:"case-123"})
    expect((await pool.query("SELECT action FROM peptech_commerce_audit")).rows[0].action).toBe("review")
  })
})
