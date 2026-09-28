import { Migration } from "@medusajs/framework/mikro-orm/migrations"
import { schema } from "../schema"
export class Migration20260927000100 extends Migration {
  async up(): Promise<void> { this.addSql(schema) }
  async down(): Promise<void> {
    // Financial history must survive application rollback. Explicitly archive/export
    // and remove the module with a separately reviewed retention procedure.
    throw new Error("Commerce ledger rollback is non-destructive: disable new checkout; retain history")
  }
}
