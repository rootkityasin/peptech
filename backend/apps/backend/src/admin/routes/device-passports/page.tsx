import { defineRouteConfig } from "@medusajs/admin-sdk"
import { adminFetch } from "../../lib/sdk"
import "../../styles/custom.css"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Table,
  Badge,
  StatusBadge,
} from "@medusajs/ui"
import {
  ShieldCheck,
  Plus,
  Trash,
  ArrowPath,
  PencilSquare,
  CheckCircle,
  ExclamationCircle,
} from "@medusajs/icons"
import { useEffect, useState } from "react"

interface DevicePassport {
  id: string
  serial_number: string
  batch_number: string
  product_name: string
  manufacture_date: string
  expiry_date: string
  status: "active" | "revoked" | "decommissioned" | string
  device_type?: string
  notes?: string
  nfc_enabled?: boolean
  qr_enabled?: boolean
  created_at?: string
  updated_at?: string
}

const DevicePassportsPage = () => {
  const [passports, setPassports] = useState<DevicePassport[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPassport, setSelectedPassport] = useState<DevicePassport | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Single form state
  const [singleForm, setSingleForm] = useState({
    serial_number: "",
    product_name: "PEPTECH® Reusable Precision Pen 1.0",
    batch_number: "RT-2609A",
    manufacture_date: "01/2026",
    expiry_date: "01/2029",
    status: "active",
    notes: "",
  })

  // Bulk form state
  const [bulkForm, setBulkForm] = useState({
    prefix: "PT-26-",
    start: 185,
    count: 20,
    pad: 6,
    product_name: "PEPTECH® Reusable Precision Pen 1.0",
    batch_number: "RT-2609A",
    manufacture_date: "01/2026",
    expiry_date: "01/2029",
    status: "active",
    notes: "Bulk registered manufacturing series",
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    id: "",
    serial_number: "",
    product_name: "",
    batch_number: "",
    manufacture_date: "",
    expiry_date: "",
    status: "active",
    notes: "",
  })

  const loadPassports = async () => {
    try {
      setLoading(true)
      const res = await adminFetch("/admin/custom/device-passports")
      if (res.ok) {
        const data = await res.json()
        setPassports(data.passports || [])
      } else {
        setFeedback({ type: "error", message: "Failed to load device passports" })
      }
    } catch (err: any) {
      console.error(err)
      setFeedback({ type: "error", message: err?.message || "Failed to connect to backend" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPassports()
  }, [])

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!singleForm.serial_number.trim()) {
      setFeedback({ type: "error", message: "Please enter a serial number (e.g. PT-26-000184)" })
      return
    }

    try {
      setIsSubmitting(true)
      const res = await adminFetch("/admin/custom/device-passports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleForm),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setFeedback({ type: "success", message: `Device Passport ${singleForm.serial_number.toUpperCase()} created successfully` })
        setIsSingleModalOpen(false)
        setSingleForm({
          serial_number: "",
          product_name: "PEPTECH® Reusable Precision Pen 1.0",
          batch_number: "RT-2609A",
          manufacture_date: "01/2026",
          expiry_date: "01/2029",
          status: "active",
          notes: "",
        })
        loadPassports()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to create device passport" })
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to create device passport" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateBulk = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const res = await adminFetch("/admin/custom/device-passports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk: true,
          ...bulkForm,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          message: `Successfully generated ${data.created_count} device passports (Series ${data.prefix})`,
        })
        setIsBulkModalOpen(false)
        loadPassports()
      } else {
        setFeedback({ type: "error", message: data.message || "Bulk generation failed" })
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Bulk generation failed" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const res = await adminFetch("/admin/custom/device-passports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setFeedback({ type: "success", message: `Device Passport ${editForm.serial_number} updated` })
        setIsEditModalOpen(false)
        loadPassports()
      } else {
        setFeedback({ type: "error", message: data.message || "Update failed" })
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Update failed" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (passport: DevicePassport) => {
    const nextStatus = passport.status === "active" ? "revoked" : "active"
    try {
      const res = await adminFetch("/admin/custom/device-passports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: passport.id,
          status: nextStatus,
        }),
      })
      if (res.ok) {
        setFeedback({
          type: "success",
          message: `Device ${passport.serial_number} status changed to ${nextStatus}`,
        })
        loadPassports()
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to update status" })
    }
  }

  const handleDelete = async (passport: DevicePassport) => {
    if (!window.confirm(`Delete Device Passport ${passport.serial_number}? This cannot be undone.`)) {
      return
    }

    try {
      const res = await adminFetch(`/admin/custom/device-passports?id=${encodeURIComponent(passport.id)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setFeedback({ type: "success", message: `Device Passport ${passport.serial_number} deleted` })
        loadPassports()
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to delete passport" })
    }
  }

  const openEditModal = (p: DevicePassport) => {
    setSelectedPassport(p)
    setEditForm({
      id: p.id,
      serial_number: p.serial_number,
      product_name: p.product_name,
      batch_number: p.batch_number,
      manufacture_date: p.manufacture_date,
      expiry_date: p.expiry_date,
      status: p.status,
      notes: p.notes || "",
    })
    setIsEditModalOpen(true)
  }

  // Filtered list
  const filtered = passports.filter((p) => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const s = p.serial_number.toLowerCase()
      const b = (p.batch_number || "").toLowerCase()
      const n = (p.product_name || "").toLowerCase()
      return s.includes(q) || b.includes(q) || n.includes(q)
    }
    return true
  })

  // Stats
  const totalCount = passports.length
  const activeCount = passports.filter((p) => p.status === "active").length
  const revokedCount = passports.filter((p) => p.status === "revoked").length

  return (
    <div className="p-6 space-y-6 min-h-screen bg-[#f6f6f7]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heading level="h1" className="text-xl font-bold text-[#202223]">
              Device Passports &amp; Product Verification
            </Heading>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Authentication
            </span>
          </div>
          <Text size="small" className="text-[#5c5f62] mt-1">
            Dynamic serial registry for PEPTECH® Reusable Precision Pens, NFC cards, and Packaging QR codes.
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={loadPassports}
            disabled={loading}
          >
            <ArrowPath className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="small"
            variant="secondary"
            onClick={() => setIsBulkModalOpen(true)}
          >
            ⚡ Bulk Generate Range
          </Button>

          <Button
            size="small"
            variant="primary"
            onClick={() => setIsSingleModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Device Passport
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg text-sm flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <ExclamationCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Container className="p-4 bg-white rounded-lg border border-[#e1e3e5]">
          <Text size="small" className="text-[#5c5f62] font-medium">
            Total Passports Registered
          </Text>
          <Heading level="h2" className="text-2xl font-bold text-[#202223] mt-1">
            {totalCount}
          </Heading>
          <Text size="xsmall" className="text-[#8c9196] mt-1">
            Unique physical serial identifiers
          </Text>
        </Container>

        <Container className="p-4 bg-white rounded-lg border border-[#e1e3e5]">
          <Text size="small" className="text-emerald-700 font-medium">
            Active &amp; Authenticated
          </Text>
          <Heading level="h2" className="text-2xl font-bold text-emerald-600 mt-1">
            {activeCount}
          </Heading>
          <Text size="xsmall" className="text-[#8c9196] mt-1">
            Passports valid for instant QR/NFC verification
          </Text>
        </Container>

        <Container className="p-4 bg-white rounded-lg border border-[#e1e3e5]">
          <Text size="small" className="text-rose-700 font-medium">
            Revoked / Flagged
          </Text>
          <Heading level="h2" className="text-2xl font-bold text-rose-600 mt-1">
            {revokedCount}
          </Heading>
          <Text size="xsmall" className="text-[#8c9196] mt-1">
            Flagged for inspection or counterfeit alert
          </Text>
        </Container>
      </div>

      {/* Filter and Search Bar */}
      <Container className="p-4 bg-white rounded-lg border border-[#e1e3e5] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by serial number (e.g. PT-26-000184) or batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {["all", "active", "revoked", "decommissioned"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-md capitalize font-medium transition-colors ${
                  filterStatus === tab
                    ? "bg-[#0b1f3a] text-white"
                    : "bg-[#f1f2f4] text-[#5c5f62] hover:bg-[#e4e5e7] hover:text-[#202223]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Passports Table */}
        <div className="overflow-x-auto border border-[#e1e3e5] rounded-md">
          <table className="w-full text-left text-xs text-[#202223]">
            <thead className="bg-[#f6f6f7] text-[#5c5f62] font-semibold uppercase tracking-wider border-b border-[#e1e3e5]">
              <tr>
                <th className="p-3">Device Serial No.</th>
                <th className="p-3">Product / Model</th>
                <th className="p-3">Batch Lot #</th>
                <th className="p-3">Mfg / Exp Date</th>
                <th className="p-3">Security Features</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e3e5]">
              {loading && passports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-[#5c5f62]">
                    <ArrowPath className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading device passports...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-[#5c5f62]">
                    No device passports found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((passport) => (
                  <tr key={passport.id} className="hover:bg-[#fafbfb] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0b1f3a] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {passport.serial_number}
                        </span>
                        <a
                          href={`http://localhost:3000/verify?serial=${encodeURIComponent(passport.serial_number)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Test verification on storefront"
                          className="text-[10px] text-teal-600 hover:text-teal-800 underline font-medium"
                        >
                          Verify ↗
                        </a>
                      </div>
                      {passport.notes && (
                        <div className="text-[10px] text-[#8c9196] mt-0.5 truncate max-w-[200px]">
                          {passport.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-[#202223]">{passport.product_name}</div>
                      <div className="text-[10px] text-[#8c9196]">{passport.device_type || "Precision Pen"}</div>
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-700">
                      {passport.batch_number}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>Mfg: {passport.manufacture_date || "—"}</div>
                      <div>Exp: {passport.expiry_date || "—"}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          NFC
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          QR
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Hologram
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {passport.status === "active" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ● Active &amp; Valid
                        </span>
                      ) : passport.status === "revoked" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                          ▲ Revoked / Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                          Decommissioned
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(passport)}
                        className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                          passport.status === "active"
                            ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        {passport.status === "active" ? "Revoke" : "Activate"}
                      </button>

                      <button
                        onClick={() => openEditModal(passport)}
                        className="px-2 py-1 text-[11px] font-medium rounded border border-[#c9cccf] bg-white text-[#202223] hover:bg-[#f6f6f7]"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(passport)}
                        className="px-2 py-1 text-[11px] font-medium rounded border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Container>

      {/* SINGLE PASSPORT MODAL */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <Heading level="h2" className="text-base font-bold text-[#202223]">
                Register New Device Passport
              </Heading>
              <button
                onClick={() => setIsSingleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Serial Number * (Exact Match, e.g. PT-26-000184)
                </Label>
                <Input
                  type="text"
                  placeholder="PT-26-000184"
                  value={singleForm.serial_number}
                  onChange={(e) => setSingleForm({ ...singleForm, serial_number: e.target.value })}
                  className="w-full text-xs font-mono uppercase"
                  required
                />
                <Text size="xsmall" className="text-slate-500 mt-1">
                  Printed on the physical PEPTECH Device Passport card and packaging QR code.
                </Text>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Product / Device Model
                </Label>
                <Input
                  type="text"
                  value={singleForm.product_name}
                  onChange={(e) => setSingleForm({ ...singleForm, product_name: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Batch Lot #
                  </Label>
                  <Input
                    type="text"
                    value={singleForm.batch_number}
                    onChange={(e) => setSingleForm({ ...singleForm, batch_number: e.target.value })}
                    className="w-full text-xs uppercase"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mfg Date
                  </Label>
                  <Input
                    type="text"
                    placeholder="01/2026"
                    value={singleForm.manufacture_date}
                    onChange={(e) => setSingleForm({ ...singleForm, manufacture_date: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Expiry Date
                  </Label>
                  <Input
                    type="text"
                    placeholder="01/2029"
                    value={singleForm.expiry_date}
                    onChange={(e) => setSingleForm({ ...singleForm, expiry_date: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Initial Status
                </Label>
                <select
                  value={singleForm.status}
                  onChange={(e) => setSingleForm({ ...singleForm, status: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c9cccf] bg-white text-[#202223]"
                >
                  <option value="active">Active &amp; Authenticated</option>
                  <option value="revoked">Revoked / Flagged</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Notes / Order Allocation
                </Label>
                <Input
                  type="text"
                  placeholder="Optional internal notes..."
                  value={singleForm.notes}
                  onChange={(e) => setSingleForm({ ...singleForm, notes: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => setIsSingleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="small"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Save Device Passport"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK GENERATION MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <Heading level="h2" className="text-base font-bold text-[#202223]">
                ⚡ Bulk Generate Device Passports
              </Heading>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBulk} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Serial Prefix
                  </Label>
                  <Input
                    type="text"
                    value={bulkForm.prefix}
                    onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })}
                    className="w-full text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Start Number
                  </Label>
                  <Input
                    type="number"
                    value={bulkForm.start}
                    onChange={(e) => setBulkForm({ ...bulkForm, start: parseInt(e.target.value || "1", 10) })}
                    className="w-full text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Count (max 500)
                  </Label>
                  <Input
                    type="number"
                    value={bulkForm.count}
                    onChange={(e) => setBulkForm({ ...bulkForm, count: parseInt(e.target.value || "1", 10) })}
                    className="w-full text-xs font-mono"
                    max={500}
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">Preview Range: </span>
                <span className="font-mono text-teal-700 font-bold">
                  {bulkForm.prefix}{String(bulkForm.start).padStart(bulkForm.pad, "0")}
                </span>
                {" → "}
                <span className="font-mono text-teal-700 font-bold">
                  {bulkForm.prefix}{String(bulkForm.start + bulkForm.count - 1).padStart(bulkForm.pad, "0")}
                </span>
                <span className="text-slate-500 ml-1">({bulkForm.count} total records)</span>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Product / Model Name
                </Label>
                <Input
                  type="text"
                  value={bulkForm.product_name}
                  onChange={(e) => setBulkForm({ ...bulkForm, product_name: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Batch Lot #
                  </Label>
                  <Input
                    type="text"
                    value={bulkForm.batch_number}
                    onChange={(e) => setBulkForm({ ...bulkForm, batch_number: e.target.value })}
                    className="w-full text-xs uppercase"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mfg Date
                  </Label>
                  <Input
                    type="text"
                    value={bulkForm.manufacture_date}
                    onChange={(e) => setBulkForm({ ...bulkForm, manufacture_date: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Expiry Date
                  </Label>
                  <Input
                    type="text"
                    value={bulkForm.expiry_date}
                    onChange={(e) => setBulkForm({ ...bulkForm, expiry_date: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => setIsBulkModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="small"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Generating..." : `Generate ${bulkForm.count} Passports`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <Heading level="h2" className="text-base font-bold text-[#202223]">
                Edit Device Passport ({editForm.serial_number})
              </Heading>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Product / Device Model
                </Label>
                <Input
                  type="text"
                  value={editForm.product_name}
                  onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Batch Lot #
                  </Label>
                  <Input
                    type="text"
                    value={editForm.batch_number}
                    onChange={(e) => setEditForm({ ...editForm, batch_number: e.target.value })}
                    className="w-full text-xs uppercase"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mfg Date
                  </Label>
                  <Input
                    type="text"
                    value={editForm.manufacture_date}
                    onChange={(e) => setEditForm({ ...editForm, manufacture_date: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 block mb-1">
                    Expiry Date
                  </Label>
                  <Input
                    type="text"
                    value={editForm.expiry_date}
                    onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Status
                </Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#c9cccf] bg-white text-[#202223]"
                >
                  <option value="active">Active &amp; Authenticated</option>
                  <option value="revoked">Revoked / Flagged</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Notes
                </Label>
                <Input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="small"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DevicePassportsPage

export const config = defineRouteConfig({
  label: "Device Passports",
  icon: ShieldCheck,
})
