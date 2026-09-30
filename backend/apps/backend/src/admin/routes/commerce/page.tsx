import { defineRouteConfig } from "@medusajs/admin-sdk"
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
  Tabs,
  Alert,
  Textarea,
} from "@medusajs/ui"
import {
  CreditCard,
  ArrowPath,
  CheckCircle,
  Clock,
  InformationCircle,
  DocumentText,
  ExclamationCircle,
} from "@medusajs/icons"
import { useEffect, useState, useMemo } from "react"

// Types
interface CommerceRecord {
  id: string
  kind: string
  profile: string
  owner_id: string | null
  state: string
  created_at?: string
  updated_at?: string
  data?: any
}

interface OrderAllocation {
  line_id: string
  name?: string
  quantity: number
  batch_id: string
  coa_reference: string
}

async function apiRequest(path: string, body?: unknown) {
  const response = await fetch(path, {
    credentials: "include",
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || "Operation failed")
  }
  return data
}

function formatGbp(minorUnits: number | string | undefined | null): string {
  if (minorUnits === undefined || minorUnits === null) return "£0.00"
  const val = typeof minorUnits === "string" ? parseFloat(minorUnits) : minorUnits
  if (isNaN(val)) return "£0.00"
  return `£${(val / 100).toFixed(2)}`
}

function formatDate(timestamp: string | number | undefined | null): string {
  if (!timestamp) return "-"
  try {
    const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp)
    if (isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "-"
  }
}

const CommercePage = () => {
  const [activeTab, setActiveTab] = useState("subscriptions")
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  // Records data
  const [subscriptions, setSubscriptions] = useState<CommerceRecord[]>([])
  const [receipts, setReceipts] = useState<CommerceRecord[]>([])
  const [attempts, setAttempts] = useState<CommerceRecord[]>([])
  const [allRecords, setAllRecords] = useState<CommerceRecord[]>([])
  const [diagnosticsKind, setDiagnosticsKind] = useState("event")
  const [diagnosticsRecords, setDiagnosticsRecords] = useState<CommerceRecord[]>([])

  // Search filters
  const [subscriptionSearch, setSubscriptionSearch] = useState("")
  const [receiptSearch, setReceiptSearch] = useState("")

  // Refund Modal state
  const [activeRefund, setActiveRefund] = useState<{
    order_id: string
    receipt_id: string
    customer_email: string
    max_amount_gbp: string
    amount: string
    note: string
  } | null>(null)
  const [modalAlert, setModalAlert] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  // Batch Release state
  const [releaseOrderId, setReleaseOrderId] = useState("")
  const [releaseLines, setReleaseLines] = useState<OrderAllocation[]>([])
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)

  // Settings & Stripe config state
  const [stripeConfig, setStripeConfig] = useState<{
    mode?: string
    publishableKey?: string
    accountId?: string
    configured?: boolean
  } | null>(null)
  const [bankSettings, setBankSettings] = useState({
    account_name: "",
    sort_code: "",
    account_number: "",
  })

  // Load subscriptions
  const loadSubscriptions = async () => {
    try {
      const data = await apiRequest("/admin/commerce?kind=subscription")
      setSubscriptions(Array.isArray(data?.records) ? data.records : [])
    } catch (e: any) {
      console.error("Failed to load subscriptions:", e)
    }
  }

  // Load receipts / transactions
  const loadReceipts = async () => {
    try {
      const data = await apiRequest("/admin/commerce?kind=receipt")
      setReceipts(Array.isArray(data?.records) ? data.records : [])
    } catch (e: any) {
      console.error("Failed to load receipts:", e)
    }
  }

  // Load attempts
  const loadAttempts = async () => {
    try {
      const data = await apiRequest("/admin/commerce?kind=attempt")
      setAttempts(Array.isArray(data?.records) ? data.records : [])
    } catch (e: any) {
      console.error("Failed to load attempts:", e)
    }
  }

  // Load settings & Stripe configuration
  const loadSettings = async () => {
    try {
      const data = await apiRequest("/admin/commerce/settings")
      if (data?.stripe) {
        setStripeConfig(data.stripe)
      }
      if (data?.settings?.data?.bank_instructions) {
        setBankSettings({
          account_name: data.settings.data.bank_instructions.account_name || "",
          sort_code: data.settings.data.bank_instructions.sort_code || "",
          account_number: data.settings.data.bank_instructions.account_number || "",
        })
      }
    } catch (e: any) {
      console.error("Failed to load settings:", e)
    }
  }

  // Load diagnostics
  const loadDiagnostics = async (kind: string) => {
    try {
      const data = await apiRequest(`/admin/commerce?kind=${kind}`)
      setDiagnosticsRecords(Array.isArray(data?.records) ? data.records : [])
    } catch (e: any) {
      console.error("Failed to load diagnostics:", e)
    }
  }

  // Initial load
  useEffect(() => {
    void loadSubscriptions()
    void loadReceipts()
    void loadAttempts()
    void loadSettings()
  }, [])

  // Diagnostics kind change
  useEffect(() => {
    if (activeTab === "diagnostics") {
      void loadDiagnostics(diagnosticsKind)
    }
  }, [activeTab, diagnosticsKind])

  const showNotification = (type: "success" | "error" | "info", text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => {
      setStatusMessage(null)
    }, 5000)
  }

  // Handle subscription command (pause, resume, cancel)
  const handleSubscriptionAction = async (subscriptionId: string, action: "pause" | "resume" | "cancel") => {
    setBusy(true)
    try {
      const operationId = crypto.randomUUID()
      await apiRequest("/admin/commerce/subscriptions", {
        subscription_id: subscriptionId,
        action,
        operation_id: operationId,
      })
      showNotification("success", `Subscription has been successfully ${action === "pause" ? "paused" : action === "resume" ? "resumed" : "cancelled"}.`)
      await loadSubscriptions()
    } catch (e: any) {
      showNotification("error", e?.message || `Failed to ${action} subscription`)
    } finally {
      setBusy(false)
    }
  }

  // Handle refund submission in modal
  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRefund) return
    setBusy(true)
    setModalAlert(null)
    try {
      const amountGbp = parseFloat(activeRefund.amount)
      if (isNaN(amountGbp) || amountGbp <= 0) {
        throw new Error("Please enter a valid refund amount")
      }
      if (amountGbp > parseFloat(activeRefund.max_amount_gbp)) {
        throw new Error(`Refund amount cannot exceed max charge of £${activeRefund.max_amount_gbp}`)
      }
      await apiRequest("/admin/commerce/refunds", {
        order_id: activeRefund.order_id,
        amount: amountGbp.toFixed(2),
        note: activeRefund.note || "Customer requested refund",
        operation_id: crypto.randomUUID(),
      })
      setModalAlert({
        type: "success",
        text: `Refund of £${amountGbp.toFixed(2)} processed successfully via Stripe!`,
      })
      await loadReceipts()
      setTimeout(() => {
        setActiveRefund(null)
        setModalAlert(null)
      }, 1600)
    } catch (e: any) {
      setModalAlert({
        type: "error",
        text: e?.message || "Failed to process Stripe refund",
      })
    } finally {
      setBusy(false)
    }
  }

  // Fetch Order for Batch Release
  const handleFetchOrderForRelease = async () => {
    if (!releaseOrderId.trim()) return
    setIsLoadingOrder(true)
    try {
      const data = await apiRequest(`/admin/commerce/release?order_id=${encodeURIComponent(releaseOrderId.trim())}`)
      const order = data?.order
      if (!order || !Array.isArray(order.items) || order.items.length === 0) {
        throw new Error("Order not found or has no order lines.")
      }
      const initialLines: OrderAllocation[] = order.items.map((item: any) => ({
        line_id: item.id,
        name: item.title || item.product_title || "Peptide Item",
        quantity: item.quantity,
        batch_id: "",
        coa_reference: "",
      }))
      setReleaseLines(initialLines)
      showNotification("info", `Loaded ${initialLines.length} line item(s) for ${order.id}. Enter batch details below.`)
    } catch (e: any) {
      showNotification("error", e?.message || "Failed to load order details")
    } finally {
      setIsLoadingOrder(false)
    }
  }

  // Submit Batch Release
  const handleSubmitBatchRelease = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!releaseOrderId || releaseLines.length === 0) return
    for (const line of releaseLines) {
      if (!line.batch_id.trim() || !line.coa_reference.trim()) {
        showNotification("error", `Please provide both Batch Number and COA Reference for all lines.`)
        return
      }
    }
    setBusy(true)
    try {
      const payload = {
        order_id: releaseOrderId.trim(),
        allocations: releaseLines.map((l) => ({
          line_id: l.line_id,
          quantity: l.quantity,
          batch_id: l.batch_id.trim(),
          coa_reference: l.coa_reference.trim(),
        })),
      }
      await apiRequest("/admin/commerce/release", payload)
      showNotification("success", `Order ${releaseOrderId} successfully verified and released for packing!`)
      setReleaseOrderId("")
      setReleaseLines([])
    } catch (e: any) {
      showNotification("error", e?.message || "Failed to release order")
    } finally {
      setBusy(false)
    }
  }

  // Save bank transfer settings
  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const currentSettings = await apiRequest("/admin/commerce/settings")
      const currentData = currentSettings?.settings?.data || {}
      await apiRequest("/admin/commerce/settings", {
        ...currentData,
        enabled: true,
        region_id: currentData.region_id || "reg_01M2AQBJ9A89RTYJDP98PH1R6X",
        sales_channel_id: currentData.sales_channel_id || "sc_01M2AQBJ6MH9H44S2ZK2E68F74",
        location_id: currentData.location_id || "sloc_01M2AQBJBGCFENNWHR7VJDHPCZ",
        shipping_option_id: currentData.shipping_option_id || "so_01M2AQBJF4RGXHZWYACYK0FR42",
        destinations: currentData.destinations || ["gb"],
        tax_policy: "stripe_default",
        tax_evidence_ref: "Stripe Dashboard defaults",
        version: "v1",
        bank_instructions: bankSettings,
      })
      showNotification("success", "Bank transfer instructions updated successfully.")
    } catch (e: any) {
      showNotification("error", e?.message || "Failed to save bank settings")
    } finally {
      setBusy(false)
    }
  }

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const email = sub.data?.quote?.email || sub.owner_id || ""
      const lineName = sub.data?.quote?.lines?.[0]?.name || ""
      const q = subscriptionSearch.toLowerCase()
      return email.toLowerCase().includes(q) || lineName.toLowerCase().includes(q) || sub.id.toLowerCase().includes(q)
    })
  }, [subscriptions, subscriptionSearch])

  // Filtered Receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((rec) => {
      const orderId = rec.data?.order_id || ""
      const email = rec.data?.quote?.email || ""
      const customerName = `${rec.data?.quote?.address?.first_name || ""} ${rec.data?.quote?.address?.last_name || ""}`
      const q = receiptSearch.toLowerCase()
      return (
        orderId.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q) ||
        rec.id.toLowerCase().includes(q)
      )
    })
  }, [receipts, receiptSearch])

  return (
    <Container className="divide-y p-0 relative">
      {/* Header */}
      <div className="flex flex-col gap-2 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1" className="text-xl font-semibold text-ui-fg-base">
              Payments & Subscriptions
            </Heading>
            <Text className="text-sm text-ui-fg-subtle mt-0.5">
              Manage 28-day customer subscriptions, Stripe transactions, refunds, and RUO batch verification.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                void loadSubscriptions()
                void loadReceipts()
                void loadAttempts()
                void loadSettings()
                showNotification("info", "Dashboard data refreshed.")
              }}
            >
              <ArrowPath className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {statusMessage && (
          <div className="mt-2">
            <Alert
              variant={
                statusMessage.type === "error"
                  ? "error"
                  : statusMessage.type === "success"
                  ? "success"
                  : "info"
              }
            >
              {statusMessage.text}
            </Alert>
          </div>
        )}

        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-3.5 flex items-center justify-between">
            <div>
              <Text size="small" className="text-ui-fg-muted font-medium">
                Active 28-Day Subscriptions
              </Text>
              <Heading level="h2" className="text-lg font-bold text-ui-fg-base mt-1">
                {subscriptions.filter((s) => s.state === "active").length}
              </Heading>
            </div>
            <Badge color="green">28-Day Cycle</Badge>
          </div>

          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-3.5 flex items-center justify-between">
            <div>
              <Text size="small" className="text-ui-fg-muted font-medium">
                Settled Stripe Transactions
              </Text>
              <Heading level="h2" className="text-lg font-bold text-ui-fg-base mt-1">
                {receipts.length}
              </Heading>
            </div>
            <Badge color="blue">GBP (£)</Badge>
          </div>

          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-3.5 flex items-center justify-between">
            <div>
              <Text size="small" className="text-ui-fg-muted font-medium">
                Stripe Gateway Status
              </Text>
              <div className="flex items-center gap-1.5 mt-1">
                <StatusBadge color={stripeConfig?.mode === "live" ? "green" : "blue"}>
                  {stripeConfig?.mode === "live" ? "Live Production" : "Test Mode"}
                </StatusBadge>
              </div>
            </div>
            <CreditCard className="w-5 h-5 text-ui-fg-muted" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 pt-2 pb-6">
        <Tabs.List className="border-b border-ui-border-base pb-px">
          <Tabs.Trigger value="subscriptions" className="flex items-center gap-2">
            <span>28-Day Subscriptions</span>
            <Badge size="small">{subscriptions.length}</Badge>
          </Tabs.Trigger>
          <Tabs.Trigger value="transactions" className="flex items-center gap-2">
            <span>Transactions & Refunds</span>
            <Badge size="small">{receipts.length}</Badge>
          </Tabs.Trigger>
          <Tabs.Trigger value="release" className="flex items-center gap-2">
            <span>Batch Release & Fulfillment</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="settings" className="flex items-center gap-2">
            <span>Gateway & Bank Settings</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="diagnostics" className="flex items-center gap-2 text-ui-fg-muted">
            <span>Diagnostics</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* ========================================================================= */}
        {/* TAB 1: 28-DAY SUBSCRIPTIONS                                               */}
        {/* ========================================================================= */}
        <Tabs.Content value="subscriptions" className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search by customer email or product..."
                value={subscriptionSearch}
                onChange={(e) => setSubscriptionSearch(e.target.value)}
                size="small"
              />
            </div>
            <Text size="small" className="text-ui-fg-muted">
              Auto-renews every 28 days with a 10% discount per PEPTECH® compliance rules.
            </Text>
          </div>

          <div className="rounded-lg border border-ui-border-base overflow-hidden">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Customer / Researcher</Table.HeaderCell>
                  <Table.HeaderCell>Product & Strength</Table.HeaderCell>
                  <Table.HeaderCell>Cadence</Table.HeaderCell>
                  <Table.HeaderCell>Next Billing Date</Table.HeaderCell>
                  <Table.HeaderCell>Cycle Amount</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredSubscriptions.map((sub) => {
                  const email = sub.data?.quote?.email || sub.owner_id || "Unregistered"
                  const line = sub.data?.quote?.lines?.[0]
                  const productName = line?.name || "Refill Cartridge"
                  const nextBilling = sub.data?.next_billing_at
                  const price = sub.data?.quote?.total_minor || line?.unit_minor || 0
                  const isPaused = sub.state === "paused" || sub.data?.control === "paused"
                  const isCanceled = sub.state === "canceled" || sub.state === "ended"

                  return (
                    <Table.Row key={sub.id}>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-ui-fg-base text-sm">{email}</span>
                          <span className="text-xs text-ui-fg-muted font-mono">{sub.id}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span className="font-medium text-ui-fg-base text-sm">{productName}</span>
                          <span className="text-xs text-ui-fg-muted">Qty: {line?.quantity || 1}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge size="small">28 Days</Badge>
                      </Table.Cell>
                      <Table.Cell className="text-sm">{formatDate(nextBilling)}</Table.Cell>
                      <Table.Cell className="font-semibold text-sm">{formatGbp(price)}</Table.Cell>
                      <Table.Cell>
                        <StatusBadge color={isPaused ? "orange" : isCanceled ? "grey" : "green"}>
                          {isPaused ? "Paused" : isCanceled ? "Cancelled" : "Active"}
                        </StatusBadge>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCanceled && (
                            <>
                              {isPaused ? (
                                <Button
                                  size="small"
                                  variant="secondary"
                                  disabled={busy}
                                  onClick={() => handleSubscriptionAction(sub.id, "resume")}
                                >
                                  Resume
                                </Button>
                              ) : (
                                <Button
                                  size="small"
                                  variant="secondary"
                                  disabled={busy}
                                  onClick={() => handleSubscriptionAction(sub.id, "pause")}
                                >
                                  Pause
                                </Button>
                              )}
                              <Button
                                size="small"
                                variant="danger"
                                disabled={busy}
                                onClick={() => {
                                  if (confirm(`Are you sure you want to cancel the 28-day subscription for ${email}?`)) {
                                    void handleSubscriptionAction(sub.id, "cancel")
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {isCanceled && <span className="text-xs text-ui-fg-muted">Ended</span>}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
                {filteredSubscriptions.length === 0 && (
                  <Table.Row>
                    <Table.Cell {...({ colSpan: 7 } as any)} className="text-center py-8 text-ui-fg-muted">
                      No customer subscriptions found.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Tabs.Content>

        {/* ========================================================================= */}
        {/* TAB 2: TRANSACTIONS & REFUNDS                                             */}
        {/* ========================================================================= */}
        <Tabs.Content value="transactions" className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search by order ID, customer name, or email..."
                value={receiptSearch}
                onChange={(e) => setReceiptSearch(e.target.value)}
                size="small"
              />
            </div>
            <Text size="small" className="text-ui-fg-muted">
              Settled payments processed via Stripe with automated SCA &amp; fraud verification.
            </Text>
          </div>

          <div className="rounded-lg border border-ui-border-base overflow-hidden">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Order Reference</Table.HeaderCell>
                  <Table.HeaderCell>Customer / Researcher</Table.HeaderCell>
                  <Table.HeaderCell>Date &amp; Time</Table.HeaderCell>
                  <Table.HeaderCell>Amount Paid</Table.HeaderCell>
                  <Table.HeaderCell>Payment Method</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredReceipts.map((rec) => {
                  const orderId = rec.data?.order_id || rec.id
                  const email = rec.data?.quote?.email || "Unknown"
                  const name = `${rec.data?.quote?.address?.first_name || ""} ${rec.data?.quote?.address?.last_name || ""}`.trim() || email
                  const amount = rec.data?.amount_minor || rec.data?.quote?.total_minor || 0
                  const date = rec.created_at || rec.updated_at
                  const method = rec.data?.source === "bank_transfer" ? "Bank Transfer" : "Stripe Card / Digital Wallet"
                  const isRefunded = rec.state === "refunded" || rec.data?.refund_status === "refunded" || (rec.data?.refunded_minor && rec.data?.refunded_minor >= amount)
                  const isPartiallyRefunded = !isRefunded && (rec.state === "partially_refunded" || rec.data?.refund_status === "partially_refunded")
                  const refundedMinor = rec.data?.refunded_minor || (isRefunded ? amount : 0)
                  const remainingMinor = Math.max(0, amount - refundedMinor)

                  return (
                    <Table.Row key={rec.id}>
                      <Table.Cell>
                        <span className="font-semibold text-ui-fg-base text-sm font-mono">{orderId}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span className="font-medium text-ui-fg-base text-sm">{name}</span>
                          <span className="text-xs text-ui-fg-muted">{email}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-sm">{formatDate(date)}</Table.Cell>
                      <Table.Cell className="font-semibold text-sm">{formatGbp(amount)}</Table.Cell>
                      <Table.Cell>
                        <Badge size="small">{method}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {isRefunded ? (
                          <StatusBadge color="red">Refunded</StatusBadge>
                        ) : isPartiallyRefunded ? (
                          <StatusBadge color="orange">Partially Refunded</StatusBadge>
                        ) : (
                          <StatusBadge color="green">Confirmed</StatusBadge>
                        )}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {isRefunded ? (
                          <div className="flex items-center justify-end">
                            <Badge color="red" size="small">
                              Refunded ({formatGbp(refundedMinor)})
                            </Badge>
                          </div>
                        ) : (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => {
                              setModalAlert(null)
                              setActiveRefund({
                                order_id: orderId,
                                receipt_id: rec.id,
                                customer_email: email,
                                max_amount_gbp: (remainingMinor / 100).toFixed(2),
                                amount: (remainingMinor / 100).toFixed(2),
                                note: "Customer requested return / refund",
                              })
                            }}
                          >
                            {isPartiallyRefunded ? "Refund Balance" : "Issue Refund"}
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
                {filteredReceipts.length === 0 && (
                  <Table.Row>
                    <Table.Cell {...({ colSpan: 7 } as any)} className="text-center py-8 text-ui-fg-muted">
                      No payment transactions recorded.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Tabs.Content>

        {/* ========================================================================= */}
        {/* TAB 3: RUO BATCH RELEASE & FULFILLMENT                                    */}
        {/* ========================================================================= */}
        <Tabs.Content value="release" className="mt-6 flex flex-col gap-4">
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5">
            <Heading level="h2" className="text-base font-semibold text-ui-fg-base mb-1">
              RUO Quality &amp; Batch Allocation
            </Heading>
            <Text className="text-sm text-ui-fg-muted mb-4">
              Attach certified laboratory Batch Numbers and COA references to paid order line items before releasing to warehouse fulfillment.
            </Text>

            {/* Order lookup input */}
            <div className="flex items-end gap-3 max-w-md mb-6">
              <div className="flex-1">
                <Label>Order Reference / ID</Label>
                <Input
                  placeholder="e.g. order_ac0819b48585..."
                  value={releaseOrderId}
                  onChange={(e) => setReleaseOrderId(e.target.value)}
                />
              </div>
              <Button
                variant="secondary"
                disabled={isLoadingOrder || !releaseOrderId.trim()}
                onClick={handleFetchOrderForRelease}
              >
                {isLoadingOrder ? "Loading..." : "Fetch Order Items"}
              </Button>
            </div>

            {/* Form for line item allocations */}
            {releaseLines.length > 0 && (
              <form onSubmit={handleSubmitBatchRelease} className="flex flex-col gap-4 mt-4 pt-4 border-t border-ui-border-base">
                <Heading level="h3" className="text-sm font-semibold text-ui-fg-base">
                  Order Line Items ({releaseLines.length})
                </Heading>

                <div className="flex flex-col gap-3">
                  {releaseLines.map((line, idx) => (
                    <div
                      key={line.line_id}
                      className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
                    >
                      <div className="min-w-[200px]">
                        <Text className="font-semibold text-sm text-ui-fg-base">{line.name}</Text>
                        <Text size="small" className="text-ui-fg-muted">
                          Qty: {line.quantity} · Line ID: {line.line_id.slice(0, 12)}...
                        </Text>
                      </div>

                      <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="flex-1">
                          <Label>Batch Number</Label>
                          <Input
                            required
                            placeholder="e.g. BPC-2026-09A"
                            value={line.batch_id}
                            onChange={(e) => {
                              const updated = [...releaseLines]
                              updated[idx].batch_id = e.target.value
                              setReleaseLines(updated)
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <Label>COA Lab Reference</Label>
                          <Input
                            required
                            placeholder="e.g. COA-JAN-8849"
                            value={line.coa_reference}
                            onChange={(e) => {
                              const updated = [...releaseLines]
                              updated[idx].coa_reference = e.target.value
                              setReleaseLines(updated)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button disabled={busy} variant="primary">
                    {busy ? "Releasing..." : "Verify & Release for Packing"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setReleaseOrderId("")
                      setReleaseLines([])
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Tabs.Content>

        {/* ========================================================================= */}
        {/* TAB 4: GATEWAY & BANK SETTINGS                                            */}
        {/* ========================================================================= */}
        <Tabs.Content value="settings" className="mt-6 flex flex-col gap-6">
          {/* Stripe Status Card */}
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5">
            <div className="flex items-center justify-between pb-3 border-b border-ui-border-base mb-4">
              <div>
                <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                  Stripe Gateway Status
                </Heading>
                <Text className="text-sm text-ui-fg-muted">
                  Primary payment processor for tokenized 28-day subscriptions and card payments.
                </Text>
              </div>
              <StatusBadge color={stripeConfig?.mode === "live" ? "green" : "blue"}>
                {stripeConfig?.mode === "live" ? "Live Connected" : "Test Environment"}
              </StatusBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Environment Mode</Label>
                <Text className="font-semibold text-ui-fg-base capitalize">
                  {stripeConfig?.mode || "Test (Sandbox)"}
                </Text>
              </div>
              <div>
                <Label>Publishable Key</Label>
                <Text className="font-mono text-xs text-ui-fg-base truncate">
                  {stripeConfig?.publishableKey || "pk_test_..."}
                </Text>
              </div>
              <div>
                <Label>Tax Calculation Policy</Label>
                <Text className="font-semibold text-ui-fg-base">Stripe Automatic Tax</Text>
              </div>
              <div>
                <Label>Recurring Interval</Label>
                <Text className="font-semibold text-ui-fg-base">28 Days (Refill &amp; Vial subscriptions)</Text>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ui-border-base">
              <a
                href="https://dashboard.stripe.com/settings/tax"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-ui-fg-interactive hover:underline inline-flex items-center gap-1"
              >
                <span>Open Stripe Dashboard Tax Settings</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* Bank Instructions Card */}
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5">
            <div className="pb-3 border-b border-ui-border-base mb-4">
              <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                UK Bank Transfer Instructions
              </Heading>
              <Text className="text-sm text-ui-fg-muted">
                These banking credentials are displayed to verified institutional customers paying via UK Faster Payments.
              </Text>
            </div>

            <form onSubmit={handleSaveBankSettings} className="flex flex-col gap-4 max-w-md">
              <div>
                <Label>Beneficiary Account Name</Label>
                <Input
                  required
                  value={bankSettings.account_name}
                  onChange={(e) => setBankSettings({ ...bankSettings, account_name: e.target.value })}
                  placeholder="PEPTECH BIO LTD"
                />
              </div>

              <div>
                <Label>Sort Code</Label>
                <Input
                  required
                  value={bankSettings.sort_code}
                  onChange={(e) => setBankSettings({ ...bankSettings, sort_code: e.target.value })}
                  placeholder="20-00-00"
                />
              </div>

              <div>
                <Label>Account Number</Label>
                <Input
                  required
                  value={bankSettings.account_number}
                  onChange={(e) => setBankSettings({ ...bankSettings, account_number: e.target.value })}
                  placeholder="12345678"
                />
              </div>

              <div className="pt-2">
                <Button disabled={busy} variant="primary">
                  {busy ? "Saving..." : "Save Bank Transfer Details"}
                </Button>
              </div>
            </form>
          </div>
        </Tabs.Content>

        {/* ========================================================================= */}
        {/* TAB 5: DIAGNOSTICS (ADVANCED / TECHNICAL)                                  */}
        {/* ========================================================================= */}
        <Tabs.Content value="diagnostics" className="mt-6 flex flex-col gap-4">
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <Heading level="h2" className="text-sm font-semibold text-ui-fg-base">
                  Audit Ledger &amp; Developer Diagnostics
                </Heading>
                <Text size="small" className="text-ui-fg-muted">
                  Low-level immutable ledger records and asynchronous webhook event queue inspector.
                </Text>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["event", "operation", "attempt", "shipment", "reconciliation"].map((k) => (
                  <Button
                    key={k}
                    size="small"
                    variant={diagnosticsKind === k ? "primary" : "secondary"}
                    onClick={() => setDiagnosticsKind(k)}
                  >
                    {k}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-ui-border-base bg-ui-bg-base overflow-hidden">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Record ID</Table.HeaderCell>
                    <Table.HeaderCell>State</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Action / Details</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {diagnosticsRecords.map((row) => (
                    <Table.Row key={row.id}>
                      <Table.Cell className="font-mono text-xs">{row.id}</Table.Cell>
                      <Table.Cell>
                        <Badge size="small">{row.state || "done"}</Badge>
                      </Table.Cell>
                      <Table.Cell className="text-xs text-ui-fg-muted">{formatDate(row.created_at)}</Table.Cell>
                      <Table.Cell>
                        <details>
                          <summary className="cursor-pointer text-xs text-ui-fg-interactive font-medium">
                            Inspect JSON
                          </summary>
                          <pre className="max-w-xl overflow-auto text-xs mt-1 p-2 bg-ui-bg-subtle rounded border border-ui-border-base">
                            {JSON.stringify(row.data, null, 2)}
                          </pre>
                        </details>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {diagnosticsRecords.length === 0 && (
                    <Table.Row>
                      <Table.Cell {...({ colSpan: 4 } as any)} className="text-center py-6 text-ui-fg-muted text-sm">
                        No {diagnosticsKind} records found.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>
        </Tabs.Content>
      </Tabs>

      {/* ========================================================================= */}
      {/* ISSUE REFUND MODAL OVERLAY (Centered dialog with in-modal alert)           */}
      {/* ========================================================================= */}
      {activeRefund && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => {
            if (!busy) {
              setActiveRefund(null)
              setModalAlert(null)
            }
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-ui-bg-base border border-ui-border-base shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base bg-ui-bg-subtle">
              <div className="flex flex-col">
                <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                  Issue Stripe Refund
                </Heading>
                <Text size="small" className="text-ui-fg-muted font-mono text-xs mt-0.5">
                  Order: {activeRefund.order_id}
                </Text>
              </div>
              <Button
                size="small"
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setActiveRefund(null)
                  setModalAlert(null)
                }}
              >
                Close
              </Button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleRefundSubmit}>
              <div className="p-6 flex flex-col gap-4">
                {/* Modal Alert (shown directly inside the modal!) */}
                {modalAlert && (
                  <Alert
                    variant={
                      modalAlert.type === "error"
                        ? "error"
                        : modalAlert.type === "success"
                        ? "success"
                        : "info"
                    }
                  >
                    {modalAlert.text}
                  </Alert>
                )}

                {/* Customer summary */}
                <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ui-fg-muted">Customer Email:</span>
                    <span className="font-semibold text-ui-fg-base">{activeRefund.customer_email}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ui-fg-muted">Original Charged Amount:</span>
                    <span className="font-semibold text-ui-fg-base">£{activeRefund.max_amount_gbp}</span>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="refund-amount">Refund Amount (GBP £)</Label>
                  <Input
                    id="refund-amount"
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={activeRefund.max_amount_gbp}
                    value={activeRefund.amount}
                    onChange={(e) => setActiveRefund({ ...activeRefund, amount: e.target.value })}
                    disabled={busy || modalAlert?.type === "success"}
                  />
                  <Text size="small" className="text-ui-fg-muted text-xs">
                    Maximum refundable: £{activeRefund.max_amount_gbp}. Partial refunds are supported.
                  </Text>
                </div>

                {/* Reason Textarea */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="refund-note">Refund Reason / Audit Note</Label>
                  <Textarea
                    id="refund-note"
                    required
                    rows={3}
                    value={activeRefund.note}
                    onChange={(e) => setActiveRefund({ ...activeRefund, note: e.target.value })}
                    placeholder="e.g. Customer requested return, damaged item, test refund..."
                    disabled={busy || modalAlert?.type === "success"}
                  />
                  <Text size="small" className="text-ui-fg-muted text-xs">
                    This note will be permanently recorded in the Stripe ledger audit trail.
                  </Text>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-ui-bg-subtle border-t border-ui-border-base flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    setActiveRefund(null)
                    setModalAlert(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={busy || modalAlert?.type === "success"}
                >
                  {busy ? "Processing..." : "Process Stripe Refund"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Payments and billing",
  icon: CreditCard,
})

export default CommercePage
