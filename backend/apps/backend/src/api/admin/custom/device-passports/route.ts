import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { actor, commerce, endpoint } from "../../../../lib/commerce/http"
import { fail } from "../../../../lib/commerce/policy"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    actor(req)
    const ledger = commerce(req)
    const search = (req.query.search as string) || (req.query.q as string) || ""
    const status = (req.query.status as string) || "all"
    const limit = parseInt((req.query.limit as string) || "50", 10)
    const offset = parseInt((req.query.offset as string) || "0", 10)

    const { records, total } = await ledger.listDevicePassports({
      search,
      status,
      limit,
      offset,
    })

    const passports = records.map((r) => ({
      id: r.id,
      serial_number: r.data?.serial_number || r.id.replace(/^devpass_/, ""),
      batch_number: r.data?.batch_number || "RT-2609A",
      product_name: r.data?.product_name || "PEPTECH® Reusable Precision Pen 1.0",
      manufacture_date: r.data?.manufacture_date || "01/2026",
      expiry_date: r.data?.expiry_date || "01/2029",
      status: r.state || "active",
      device_type: r.data?.device_type || "Precision Pen Device",
      notes: r.data?.notes || "",
      nfc_enabled: r.data?.nfc_enabled !== false,
      qr_enabled: r.data?.qr_enabled !== false,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }))

    return { passports, count: total }
  })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const admin = actor(req)
    const ledger = commerce(req)
    const body = (req.body || {}) as any

    // 1. Bulk Generation Mode
    if (body.bulk) {
      const prefix = (body.prefix || "PT-26-").trim().toUpperCase()
      const start = Math.max(1, parseInt(body.start || "1", 10))
      const count = Math.min(500, Math.max(1, parseInt(body.count || "20", 10)))
      const padLength = parseInt(body.pad || "6", 10) // e.g. 000184 is 6 digits
      const batch_number = (body.batch_number || "RT-2609A").trim().toUpperCase()
      const product_name = (body.product_name || "PEPTECH® Reusable Precision Pen 1.0").trim()
      const manufacture_date = (body.manufacture_date || "01/2026").trim()
      const expiry_date = (body.expiry_date || "01/2029").trim()
      const status = (body.status || "active").toLowerCase()
      const notes = (body.notes || `Bulk generated series ${prefix}`).trim()

      const createdList: string[] = []
      for (let i = 0; i < count; i++) {
        const num = start + i
        const padded = String(num).padStart(padLength, "0")
        const serial_number = `${prefix}${padded}`
        const id = `devpass_${serial_number.replace(/[^A-Z0-9_-]/gi, "")}`

        await ledger.create({
          id,
          kind: "device_passport",
          profile: "device",
          owner_id: null,
          state: status,
          data: {
            serial_number,
            batch_number,
            product_name,
            manufacture_date,
            expiry_date,
            status,
            device_type: "Precision Pen Device",
            nfc_enabled: true,
            qr_enabled: true,
            security_seal: "HOLOGRAPHIC-VERIFIED",
            notes,
          },
        })
        createdList.push(serial_number)
      }

      await ledger.audit("bulk_device_passports", admin, "admin-bulk-create-passports", {
        prefix,
        start,
        count,
        sample: createdList.slice(0, 5),
      })

      return {
        success: true,
        created_count: createdList.length,
        prefix,
        sample: createdList.slice(0, 5),
      }
    }

    // 2. Single Creation Mode
    const rawSerial = (body.serial_number || "").trim()
    if (!rawSerial) {
      fail("Device serial number is required (e.g. PT-26-000184)", 400)
    }

    const serial_number = rawSerial.toUpperCase()
    const id = `devpass_${serial_number.replace(/[^A-Z0-9_-]/gi, "")}`
    const existing = await ledger.get(id)
    if (existing) {
      fail(`Device Passport with serial ${serial_number} already exists`, 409)
    }

    const batch_number = (body.batch_number || "RT-2609A").trim().toUpperCase()
    const product_name = (body.product_name || "PEPTECH® Reusable Precision Pen 1.0").trim()
    const manufacture_date = (body.manufacture_date || "01/2026").trim()
    const expiry_date = (body.expiry_date || "01/2029").trim()
    const status = (body.status || "active").toLowerCase()
    const notes = (body.notes || "").trim()

    const record = await ledger.create({
      id,
      kind: "device_passport",
      profile: "device",
      owner_id: null,
      state: status,
      data: {
        serial_number,
        batch_number,
        product_name,
        manufacture_date,
        expiry_date,
        status,
        device_type: body.device_type || "Precision Pen Device",
        nfc_enabled: true,
        qr_enabled: true,
        security_seal: "HOLOGRAPHIC-VERIFIED",
        notes,
      },
    })

    await ledger.audit(id, admin, "admin-create-device-passport", {
      serial_number,
      batch_number,
      status,
    })

    return {
      success: true,
      passport: {
        id: record.id,
        ...record.data,
        status: record.state,
      },
    }
  })
}

export async function PUT(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const admin = actor(req)
    const ledger = commerce(req)
    const body = (req.body || {}) as any

    const id = (body.id || "").trim()
    if (!id) {
      fail("Passport ID or serial is required", 400)
    }

    const passport = await ledger.get(id)
    if (!passport || passport.kind !== "device_passport") {
      fail("Device Passport record not found", 404)
    }

    const state = body.status ? body.status.toLowerCase() : passport.state
    const patchData: Record<string, any> = { ...passport.data }

    if (body.batch_number) patchData.batch_number = body.batch_number.trim().toUpperCase()
    if (body.product_name) patchData.product_name = body.product_name.trim()
    if (body.manufacture_date) patchData.manufacture_date = body.manufacture_date.trim()
    if (body.expiry_date) patchData.expiry_date = body.expiry_date.trim()
    if (body.notes !== undefined) patchData.notes = String(body.notes).trim()
    if (body.status) patchData.status = state

    const updated = await ledger.save({
      ...passport,
      state,
      data: patchData,
      updated_at: new Date(),
    })

    await ledger.audit(id, admin, "admin-update-device-passport", {
      state,
      updated_fields: Object.keys(body),
    })

    return {
      success: true,
      passport: {
        id: updated.id,
        ...updated.data,
        status: updated.state,
      },
    }
  })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const admin = actor(req)
    const ledger = commerce(req)
    const id = ((req.query.id as string) || (req.body as any)?.id || "").trim()

    if (!id) {
      fail("Passport ID is required to delete", 400)
    }

    const passport = await ledger.get(id)
    if (!passport || passport.kind !== "device_passport") {
      fail("Device Passport not found", 404)
    }

    await ledger.delete(id)
    await ledger.audit(id, admin, "admin-delete-device-passport", {
      serial_number: passport.data?.serial_number,
    })

    return { success: true, deleted_id: id }
  })
}
