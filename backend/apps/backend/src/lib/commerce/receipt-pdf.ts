/**
 * Generates an official, standard-compliant A4 PDF receipt (595pt x 842pt)
 * conforming to PDF-1.4 specifications without external dependencies.
 */

export interface ReceiptPdfItem {
  title: string
  quantity: number | string
  unit_price: number | string
  total: number | string
}

export interface ReceiptPdfData {
  orderId: string
  date?: string
  customerName?: string
  customerEmail?: string
  shippingAddress?: any
  items?: ReceiptPdfItem[]
  subtotal?: number | string
  shipping?: number | string
  shippingName?: string
  total?: number | string
  currency?: string
}

function escapePdf(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return ""
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "") // Keep standard printable ASCII for PDF Type1 fonts
}

export function generateReceiptPdfBuffer(data: ReceiptPdfData): Buffer {
  const safeOrderId = escapePdf(data.orderId || "PEPTECH-ORDER")
  const dateStr = escapePdf(
    data.date
      ? new Date(data.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleDateString("en-GB")
  )
  const safeCustName = escapePdf(data.customerName || "Verified Laboratory Researcher")
  const safeEmail = escapePdf(data.customerEmail || "")
  
  let addrLine1 = ""
  let addrLine2 = ""
  if (typeof data.shippingAddress === "object" && data.shippingAddress) {
    const a = data.shippingAddress
    addrLine1 = [a.address_1, a.address_2].filter(Boolean).join(", ")
    addrLine2 = [a.city, a.province, a.postal_code, a.country_code ? String(a.country_code).toUpperCase() : "UK"]
      .filter(Boolean)
      .join(", ")
  } else if (typeof data.shippingAddress === "string" && data.shippingAddress.trim()) {
    addrLine1 = data.shippingAddress.trim()
  } else {
    addrLine1 = "Laboratory Delivery Address on File"
  }
  addrLine1 = escapePdf(addrLine1)
  addrLine2 = escapePdf(addrLine2)

  const items = Array.isArray(data.items) && data.items.length > 0 ? data.items : []
  const subtotalVal = data.subtotal !== undefined ? Number(data.subtotal) : 0
  const shippingVal = data.shipping !== undefined ? Number(data.shipping) : 0
  const totalVal = data.total !== undefined ? Number(data.total) : (subtotalVal + shippingVal)
  const safeShippingName = escapePdf(data.shippingName || "Royal Mail Tracked 24")

  // Stream drawing commands
  let content = ""

  // Header background banner (Navy #0B1F3A)
  content += `0.043 0.122 0.228 rg\n`
  content += `0 752 595 90 re f\n`

  // White text in header
  content += `1 1 1 rg\n`
  content += `BT\n/F2 20 Tf 40 802 Td (PEPTECH) Tj\nET\n`
  content += `BT\n/F1 9 Tf 40 788 Td (Quality. Safety. Precision.  |  peptech.bio) Tj\nET\n`
  content += `BT\n/F2 12 Tf 360 804 Td (OFFICIAL ORDER RECEIPT) Tj\nET\n`
  content += `BT\n/F1 9 Tf 360 790 Td (Reference: ${safeOrderId}) Tj\nET\n`
  content += `BT\n/F1 9 Tf 360 776 Td (Date: ${dateStr}) Tj\nET\n`

  // Logistics & Recipient Details section
  content += `0.96 0.97 0.99 rg\n`
  content += `40 660 515 72 re f\n`
  content += `0.85 0.88 0.92 RG\n0.75 w\n`
  content += `40 660 515 72 re S\n`

  // Destination labels
  content += `0.043 0.122 0.228 rg\n`
  content += `BT\n/F2 9 Tf 55 715 Td (RECIPIENT & DESTINATION) Tj\nET\n`
  content += `0.2 0.25 0.3 rg\n`
  content += `BT\n/F2 10 Tf 55 700 Td (${safeCustName}) Tj\nET\n`
  content += `BT\n/F1 9 Tf 55 687 Td (${addrLine1}) Tj\nET\n`
  if (addrLine2) {
    content += `BT\n/F1 9 Tf 55 674 Td (${addrLine2}) Tj\nET\n`
  } else if (safeEmail) {
    content += `BT\n/F1 9 Tf 55 674 Td (${safeEmail}) Tj\nET\n`
  }

  // Logistics labels
  content += `0.043 0.122 0.228 rg\n`
  content += `BT\n/F2 9 Tf 320 715 Td (LOGISTICS & DISPATCH) Tj\nET\n`
  content += `0.2 0.25 0.3 rg\n`
  content += `BT\n/F1 9 Tf 320 700 Td (Carrier: ${safeShippingName} - Cold-Chain) Tj\nET\n`
  content += `BT\n/F1 9 Tf 320 687 Td (Status: Payment Confirmed / Scheduled for Dispatch) Tj\nET\n`
  content += `BT\n/F1 9 Tf 320 674 Td (Packaging: Thermal Insulated Foil + Ice Pack) Tj\nET\n`

  // Table header
  let curY = 625
  content += `0.043 0.122 0.228 rg\n`
  content += `40 ${curY} 515 22 re f\n`
  content += `1 1 1 rg\n`
  content += `BT\n/F2 9 Tf 50 ${curY + 7} Td (DESCRIPTION & SPECIFICATION) Tj\nET\n`
  content += `BT\n/F2 9 Tf 360 ${curY + 7} Td (QTY) Tj\nET\n`
  content += `BT\n/F2 9 Tf 420 ${curY + 7} Td (UNIT PRICE) Tj\nET\n`
  content += `BT\n/F2 9 Tf 490 ${curY + 7} Td (AMOUNT) Tj\nET\n`

  curY -= 24

  // Table rows
  if (items.length === 0) {
    content += `0.2 0.25 0.3 rg\n`
    content += `BT\n/F1 9 Tf 50 ${curY + 5} Td (PEPTECH Research Peptide Order) Tj\nET\n`
    content += `BT\n/F1 9 Tf 365 ${curY + 5} Td (1) Tj\nET\n`
    content += `BT\n/F1 9 Tf 420 ${curY + 5} Td (GBP ${subtotalVal.toFixed(2)}) Tj\nET\n`
    content += `BT\n/F2 9 Tf 490 ${curY + 5} Td (GBP ${subtotalVal.toFixed(2)}) Tj\nET\n`
    content += `0.9 0.92 0.94 RG\n0.5 w\n40 ${curY} 515 0 re S\n`
    curY -= 22
  } else {
    for (const item of items) {
      const title = escapePdf(item.title).slice(0, 48)
      const qty = escapePdf(item.quantity)
      const unitP = typeof item.unit_price === "number" ? item.unit_price.toFixed(2) : escapePdf(item.unit_price)
      const totalP = typeof item.total === "number" ? item.total.toFixed(2) : escapePdf(item.total)

      content += `0.1 0.15 0.2 rg\n`
      content += `BT\n/F2 9 Tf 50 ${curY + 5} Td (${title}) Tj\nET\n`
      content += `BT\n/F1 9 Tf 368 ${curY + 5} Td (${qty}) Tj\nET\n`
      content += `BT\n/F1 9 Tf 420 ${curY + 5} Td (GBP ${unitP}) Tj\nET\n`
      content += `BT\n/F2 9 Tf 490 ${curY + 5} Td (GBP ${totalP}) Tj\nET\n`

      // Row underline
      content += `0.88 0.91 0.94 RG\n0.5 w\n`
      content += `40 ${curY} 515 0.5 re S\n`
      curY -= 22
      if (curY < 200) break // Guard single page fit
    }
  }

  // Financial totals section (Right aligned)
  curY -= 10
  content += `0.4 0.45 0.5 rg\n`
  content += `BT\n/F1 9 Tf 340 ${curY} Td (Subtotal:) Tj\nET\n`
  content += `0.1 0.15 0.2 rg\n`
  content += `BT\n/F1 9 Tf 490 ${curY} Td (GBP ${subtotalVal.toFixed(2)}) Tj\nET\n`

  curY -= 16
  content += `0.4 0.45 0.5 rg\n`
  content += `BT\n/F1 9 Tf 340 ${curY} Td (${safeShippingName}:) Tj\nET\n`
  content += `0.1 0.15 0.2 rg\n`
  const shipText = shippingVal === 0 ? "FREE" : `GBP ${shippingVal.toFixed(2)}`
  content += `BT\n/F1 9 Tf 490 ${curY} Td (${shipText}) Tj\nET\n`

  curY -= 18
  content += `0.043 0.122 0.228 RG\n1.5 w\n`
  content += `340 ${curY + 12} 215 0.5 re S\n`

  content += `0.043 0.122 0.228 rg\n`
  content += `BT\n/F2 11 Tf 340 ${curY} Td (Total Paid in Full:) Tj\nET\n`
  content += `BT\n/F2 12 Tf 485 ${curY} Td (GBP ${totalVal.toFixed(2)}) Tj\nET\n`

  // Compliance notice box
  content += `0.97 0.98 0.99 rg\n`
  content += `40 85 515 50 re f\n`
  content += `0.88 0.91 0.94 RG\n0.5 w\n`
  content += `40 85 515 50 re S\n`

  content += `0.086 0.651 0.639 rg\n` // Teal accent
  content += `BT\n/F2 8 Tf 50 120 Td (IN-VITRO LABORATORY RESEARCH USE ONLY) Tj\nET\n`
  content += `0.4 0.45 0.5 rg\n`
  content += `BT\n/F1 7.5 Tf 50 108 Td (All peptides and pen devices supplied by PEPTECH are strictly for scientific, analytical, and in-vitro laboratory research.) Tj\nET\n`
  content += `BT\n/F1 7.5 Tf 50 96 Td (Not for human consumption, clinical application, or therapeutic use. 18+ verification acknowledged at checkout.) Tj\nET\n`

  // Footer bar
  content += `0.5 0.55 0.6 rg\n`
  content += `BT\n/F1 8 Tf 40 45 Td (PEPTECH Scientific Logistics - Royal Mail 24 Cold-Chain Fulfillment) Tj\nET\n`
  content += `BT\n/F1 8 Tf 420 45 Td (Support: support@peptech.bio) Tj\nET\n`

  const streamLength = Buffer.byteLength(content)

  let out = "%PDF-1.4\n"
  const offsets: number[] = []

  offsets.push(Buffer.byteLength(out))
  out += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"

  offsets.push(Buffer.byteLength(out))
  out += "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"

  offsets.push(Buffer.byteLength(out))
  out +=
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n"

  offsets.push(Buffer.byteLength(out))
  out += `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${content}endstream\nendobj\n`

  offsets.push(Buffer.byteLength(out))
  out += "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"

  offsets.push(Buffer.byteLength(out))
  out += "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n"

  const xrefOffset = Buffer.byteLength(out)
  out += `xref\n0 7\n0000000000 65535 f \n`
  for (const off of offsets) {
    out += off.toString().padStart(10, "0") + " 00000 n \n"
  }
  out += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  return Buffer.from(out, "utf-8")
}
