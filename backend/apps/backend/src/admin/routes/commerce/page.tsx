import { defineRouteConfig } from "@medusajs/admin-sdk"
import { adminFetch as fetch } from "../../lib/sdk"
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
  Select,
  Tabs,
  Alert,
  Textarea,
} from "@medusajs/ui"
import {
  CreditCard,
  ArrowPath,
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
  const [diagnosticsKind, setDiagnosticsKind] = useState("event")
  const [diagnosticsRecords, setDiagnosticsRecords] = useState<CommerceRecord[]>([])

  // Search filters
  const [subscriptionSearch, setSubscriptionSearch] = useState("")
  const [receiptSearch, setReceiptSearch] = useState("")

  // Refund & Bank Transfer Modal state
  const [activeRefund, setActiveRefund] = useState<{
    order_id: string
    receipt_id: string
    customer_email: string
    max_amount_gbp: string
    amount: string
    note: string
  } | null>(null)
  const [activeBankConfirm, setActiveBankConfirm] = useState<{
    attempt_id: string
    transfer_reference: string
    customer_email: string
    customer_name: string
    amount: string
    bank_transaction_id: string
    statement_reference: string
  } | null>(null)
  const [modalAlert, setModalAlert] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  // Settings & Gateway config state
  const [cardGatewayActive, setCardGatewayActive] = useState(false)
  const [gatewayConfig, setGatewayConfig] = useState<{
    mode?: string
    publishableKey?: string
    accountId?: string
    configured?: boolean
  } | null>(null)
  const [bankInstructions, setBankInstructions] = useState({
    account_name: "",
    sort_code: "",
    account_number: "",
  })
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [shippingDefaults, setShippingDefaults] = useState({
    shipping_option_id: "",
    location_id: "",
    region_id: "",
    sales_channel_id: "",
    destinations: "",
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

  // Load settings & gateway configuration
  const loadSettings = async () => {
    try {
      const data = await apiRequest("/admin/commerce/settings")
      setCardGatewayActive(Boolean(data?.card_gateway_active))
      if (data?.stripe) {
        setGatewayConfig(data.stripe)
      }
      const bank = data?.settings?.data?.bank_instructions
      if (bank) {
        setBankInstructions({
          account_name: bank.account_name || "",
          sort_code: bank.sort_code || "",
          account_number: bank.account_number || "",
        })
      }
    } catch (e: any) {
      console.error("Failed to load settings:", e)
    }
  }

  // Load the shipping options Medusa serves from the configured location
  const loadShippingOptions = async () => {
    try {
      const data = await apiRequest("/admin/commerce/shipping-options")
      const options = Array.isArray(data?.options) ? data.options : []
      setShippingOptions(options)
      setShippingDefaults({
        shipping_option_id: data?.shipping_option_id || options[0]?.id || "",
        location_id: data?.location_id || "",
        region_id: data?.region_id || "",
        sales_channel_id: data?.sales_channel_id || "",
        destinations: Array.isArray(data?.destinations) && data.destinations.length
          ? data.destinations.join(", ")
          : "gb",
      })
    } catch (e: any) {
      console.error("Failed to load shipping options:", e)
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
    void loadShippingOptions()
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
        text: `Refund of £${amountGbp.toFixed(2)} processed successfully!`,
      })
      await loadReceipts()
      setTimeout(() => {
        setActiveRefund(null)
        setModalAlert(null)
      }, 1600)
    } catch (e: any) {
      setModalAlert({
        type: "error",
        text: e?.message || "Failed to process refund",
      })
    } finally {
      setBusy(false)
    }
  }

  // Handle manual UK Faster Payments confirmation in modal
  const handleBankConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeBankConfirm) return
    setBusy(true)
    setModalAlert(null)
    try {
      const bankTx = activeBankConfirm.bank_transaction_id.trim()
      const stmtRef = activeBankConfirm.statement_reference.trim()
      if (!bankTx || !stmtRef) {
        throw new Error("Bank statement transaction ID and reference are required.")
      }
      await apiRequest("/admin/commerce/bank-transfer", {
        attempt_id: activeBankConfirm.attempt_id,
        bank_transaction_id: bankTx,
        statement_reference: stmtRef,
        amount: activeBankConfirm.amount,
      })
      setModalAlert({
        type: "success",
        text: `Transfer verified (${activeBankConfirm.transfer_reference}). Order created and marked paid.`,
      })
      await Promise.all([loadAttempts(), loadReceipts()])
      setTimeout(() => {
        setActiveBankConfirm(null)
        setModalAlert(null)
      }, 1400)
    } catch (e: any) {
      setModalAlert({
        type: "error",
        text: e?.message || "Failed to confirm bank transfer settlement",
      })
    } finally {
      setBusy(false)
    }
  }

  // Save UK Faster Payments destination bank instructions to commerce_settings
  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const accountName = bankInstructions.account_name.trim()
      const sortCode = bankInstructions.sort_code.trim()
      const accountNumber = bankInstructions.account_number.trim()
      if (!accountName) throw new Error("Account holder name is required.")
      if (!/^\d{2}-?\d{2}-?\d{2}$/.test(sortCode)) {
        throw new Error("Sort code must be 6 digits (e.g. 00-00-00).")
      }
      if (!/^\d{8}$/.test(accountNumber)) {
        throw new Error("Account number must be exactly 8 digits.")
      }
      await saveSettings({
        bank_instructions: {
          account_name: accountName,
          sort_code: sortCode,
          account_number: accountNumber,
        },
      })
      showNotification("success", "UK Faster Payments bank details updated.")
      await loadSettings()
    } catch (e: any) {
      showNotification("error", e?.message || "Failed to save bank instructions")
    } finally {
      setBusy(false)
    }
  }

  // Persist commerce settings. The shipping option and destination list come
  // from Medusa, so they are never guessed from hardcoded identifiers.
  const saveSettings = async (overrides: Record<string, unknown> = {}) => {
    const currentSettings = await apiRequest("/admin/commerce/settings")
    const currentData = currentSettings?.settings?.data || {}
    const payload: any = {
      ...currentData,
      enabled: true,
      region_id: currentData.region_id || "reg_01M2AQBJ9A89RTYJDP98PH1R6X",
      sales_channel_id: currentData.sales_channel_id || "sc_01M2AQBJ6MH9H44S2ZK2E68F74",
      location_id: currentData.location_id || "sloc_01M2AQBJBGCFENNWHR7VJDHPCZ",
      tax_policy: currentData.tax_policy || "not_registered",
      tax_evidence_ref: currentData.tax_evidence_ref || "Not VAT registered",
      version: currentData.version || "v1",
      destinations: currentData.destinations?.length ? currentData.destinations : ["gb"],
      ...overrides,
    }
    if (!payload.shipping_option_id) {
      payload.shipping_option_id = shippingDefaults.shipping_option_id || shippingOptions[0]?.id || ""
    }
    if (!String(payload.shipping_option_id).trim()) {
      throw new Error("No shipping option is available for the delivery location. Create one under Settings > Shipping, then refresh.")
    }
    const destinations = payload.destinations
    if (!Array.isArray(destinations) || !destinations.length) {
      throw new Error("Enter at least one destination country code, for example gb.")
    }
    return apiRequest("/admin/commerce/settings", payload)
  }


  // Save the default shipping option used when a customer makes no selection
  const handleSaveShippingSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const optionId = shippingDefaults.shipping_option_id.trim()
      if (!optionId || !shippingOptions.some((option) => option.id === optionId)) {
        throw new Error("Select a shipping option returned by Medusa.")
      }
      const destinations = shippingDefaults.destinations
        .split(",")
        .map((code) => code.trim().toLowerCase())
        .filter((code) => /^[a-z]{2}$/.test(code))
      if (!destinations.length) {
        throw new Error("Enter at least one destination country code, for example gb.")
      }
      await saveSettings({ shipping_option_id: optionId, destinations })
      showNotification("success", "Shipping configuration updated successfully.")
      await loadShippingOptions()
    } catch (e: any) {
      showNotification("error", e?.message || "Failed to save shipping settings")
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

  // Pending Bank Transfer attempts awaiting confirmation
  const pendingBankTransfers = useMemo(() => {
    return attempts.filter((a) => a.state === "awaiting_transfer" && !a.data?.order_id)
  }, [attempts])

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
              Manage 28-day customer subscriptions, UK bank transfer settlements, refunds, and gateway settings.
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
                void loadShippingOptions()
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
                Settled Orders
              </Text>
              <Heading level="h2" className="text-lg font-bold text-ui-fg-base mt-1">
                {receipts.length}
              </Heading>
              {pendingBankTransfers.length > 0 && (
                <Text size="small" className="text-xs text-ui-fg-muted mt-0.5">
                  {pendingBankTransfers.length} awaiting bank transfer
                </Text>
              )}
            </div>
            <Badge color={pendingBankTransfers.length > 0 ? "orange" : "blue"}>GBP (£)</Badge>
          </div>

          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-3.5 flex items-center justify-between">
            <div>
              <Text size="small" className="text-ui-fg-muted font-medium">
                Payment Gateway Status
              </Text>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <StatusBadge color="green">UK Bank Transfer Active</StatusBadge>
                <StatusBadge color={cardGatewayActive ? (gatewayConfig?.mode === "live" ? "green" : "blue") : "grey"}>
                  {cardGatewayActive
                    ? gatewayConfig?.mode === "live"
                      ? "Card: Live"
                      : "Card: Test"
                    : "Card: Standby"}
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
            <Badge size="small">{receipts.length + pendingBankTransfers.length}</Badge>
          </Tabs.Trigger>
          <Tabs.Trigger value="settings" className="flex items-center gap-2">
            <span>Gateway & Shipping Settings</span>
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
        <Tabs.Content value="transactions" className="mt-6 flex flex-col gap-6">
          {/* Pending UK Faster Payments Bank Transfers */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                  Pending UK Faster Payments Transfers
                </Heading>
                <Text size="small" className="text-ui-fg-muted">
                  Verify cleared incoming bank transfers against your bank statement to issue official orders.
                </Text>
              </div>
              <Badge size="small" color={pendingBankTransfers.length > 0 ? "orange" : "grey"}>
                {pendingBankTransfers.length} Pending
              </Badge>
            </div>

            <div className="rounded-lg border border-ui-border-base overflow-hidden">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Transfer Reference</Table.HeaderCell>
                    <Table.HeaderCell>Customer / Researcher</Table.HeaderCell>
                    <Table.HeaderCell>Submitted Date</Table.HeaderCell>
                    <Table.HeaderCell>Amount Due</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Action</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {pendingBankTransfers.map((att) => {
                    const transferRef = att.data?.transfer_reference || att.data?.order_number || att.id
                    const q = att.data?.quote || {}
                    const email = q.email || "Unknown"
                    const name = `${q.address?.first_name || ""} ${q.address?.last_name || ""}`.trim() || email
                    const totalMinor = q.total_minor || 0

                    return (
                      <Table.Row key={att.id}>
                        <Table.Cell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-ui-fg-base text-sm font-mono">{transferRef}</span>
                            <span className="text-xs text-ui-fg-muted font-mono">{att.id}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col">
                            <span className="font-medium text-ui-fg-base text-sm">{name}</span>
                            <span className="text-xs text-ui-fg-muted">{email}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-sm">{formatDate(att.created_at)}</Table.Cell>
                        <Table.Cell className="font-semibold text-sm">{formatGbp(totalMinor)}</Table.Cell>
                        <Table.Cell>
                          <StatusBadge color="orange">Awaiting Transfer</StatusBadge>
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <Button
                            size="small"
                            variant="primary"
                            disabled={busy}
                            onClick={() => {
                              setModalAlert(null)
                              setActiveBankConfirm({
                                attempt_id: att.id,
                                transfer_reference: transferRef,
                                customer_email: email,
                                customer_name: name,
                                amount: (totalMinor / 100).toFixed(2),
                                bank_transaction_id: "",
                                statement_reference: transferRef,
                              })
                            }}
                          >
                            Confirm Transfer Received
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                  {pendingBankTransfers.length === 0 && (
                    <Table.Row>
                      <Table.Cell {...({ colSpan: 6 } as any)} className="text-center py-6 text-ui-fg-muted text-sm">
                        No pending UK bank transfers awaiting reconciliation.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-ui-border-base">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search settled orders by ID, customer name, or email..."
                value={receiptSearch}
                onChange={(e) => setReceiptSearch(e.target.value)}
                size="small"
              />
            </div>
            <Text size="small" className="text-ui-fg-muted">
              Confirmed payments settled via UK Faster Payments and verified card gateways.
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
                  const displayOrder = rec.data?.order_number || orderId
                  const email = rec.data?.quote?.email || "Unknown"
                  const name = `${rec.data?.quote?.address?.first_name || ""} ${rec.data?.quote?.address?.last_name || ""}`.trim() || email
                  const amount = rec.data?.amount || rec.data?.amount_minor || rec.data?.quote?.total_minor || 0
                  const date = rec.created_at || rec.updated_at
                  const isBank = rec.data?.source === "bank_transfer" || rec.profile === "bank_transfer:v1"
                  const method = isBank ? "UK Bank Transfer" : "Card / Digital Wallet"
                  const isRefunded = rec.state === "refunded" || rec.data?.refund_status === "refunded" || (rec.data?.refunded_minor && rec.data?.refunded_minor >= amount)
                  const isPartiallyRefunded = !isRefunded && (rec.state === "partially_refunded" || rec.data?.refund_status === "partially_refunded")
                  const refundedMinor = rec.data?.refunded_minor || (isRefunded ? amount : 0)
                  const remainingMinor = Math.max(0, amount - refundedMinor)

                  return (
                    <Table.Row key={rec.id}>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-ui-fg-base text-sm font-mono">{displayOrder}</span>
                          {displayOrder !== orderId && (
                            <span className="text-xs text-ui-fg-muted font-mono">{orderId}</span>
                          )}
                        </div>
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
                        ) : isBank ? (
                          <Badge size="small">Manual BACS Refund</Badge>
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
        {/* TAB 3: GATEWAY & BANK SETTINGS                                            */}
        {/* ========================================================================= */}
        <Tabs.Content value="settings" className="mt-6 flex flex-col gap-6">
          {/* UK Faster Payments Bank Transfer Configuration */}
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5">
            <div className="flex items-center justify-between pb-3 border-b border-ui-border-base mb-4">
              <div>
                <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                  UK Faster Payments (Bank Transfer)
                </Heading>
                <Text className="text-sm text-ui-fg-muted">
                  Destination GBP sort code and account number shown to customers on UK Bank Transfer confirmation pages.
                </Text>
              </div>
              <StatusBadge color={bankInstructions.sort_code && bankInstructions.account_number ? "green" : "orange"}>
                {bankInstructions.sort_code && bankInstructions.account_number ? "Configured" : "Details Needed"}
              </StatusBadge>
            </div>

            <form onSubmit={handleSaveBankSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bank-account-name">Account Name</Label>
                <Input
                  id="bank-account-name"
                  value={bankInstructions.account_name}
                  onChange={(e) => setBankInstructions({ ...bankInstructions, account_name: e.target.value })}
                  placeholder="Account holder name"
                  disabled={busy}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bank-sort-code">UK Sort Code</Label>
                <Input
                  id="bank-sort-code"
                  value={bankInstructions.sort_code}
                  onChange={(e) => setBankInstructions({ ...bankInstructions, sort_code: e.target.value })}
                  placeholder="00-00-00"
                  disabled={busy}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bank-account-number">Account Number</Label>
                <Input
                  id="bank-account-number"
                  value={bankInstructions.account_number}
                  onChange={(e) => setBankInstructions({ ...bankInstructions, account_number: e.target.value })}
                  placeholder="8-digit account number"
                  disabled={busy}
                />
              </div>
              <div className="sm:col-span-3 pt-1">
                <Button disabled={busy} variant="primary">
                  {busy ? "Saving..." : "Save Bank Transfer Instructions"}
                </Button>
              </div>
            </form>
          </div>

          {/* Card Gateway Status Card */}
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5">
            <div className="flex items-center justify-between pb-3 border-b border-ui-border-base mb-4">
              <div>
                <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                  Card Payment Gateway
                </Heading>
                <Text className="text-sm text-ui-fg-muted">
                  Modular card and 28-day recurring billing adapter for approved high-risk acquirers.
                </Text>
              </div>
              <StatusBadge color={cardGatewayActive ? (gatewayConfig?.mode === "live" ? "green" : "blue") : "orange"}>
                {cardGatewayActive ? (gatewayConfig?.mode === "live" ? "Live Connected" : "Test Mode Active") : "Standby (Inactive)"}
              </StatusBadge>
            </div>

            {!cardGatewayActive ? (
              <Text size="small" className="text-ui-fg-muted">
                Storefront card checkout is currently hidden (on standby) while underwriting completes. All live orders settle via UK Faster Payments (Bank Transfer).
              </Text>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Environment Mode</Label>
                  <Text className="font-semibold text-ui-fg-base capitalize">
                    {gatewayConfig?.mode || "Test (Sandbox)"}
                  </Text>
                </div>
                <div>
                  <Label>Recurring Interval</Label>
                  <Text className="font-semibold text-ui-fg-base">28 Days (Refill &amp; Vial subscriptions)</Text>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Options Card */}
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5">
            <div className="flex items-start justify-between pb-3 border-b border-ui-border-base mb-4 gap-4">
              <div>
                <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                  Shipping Options
                </Heading>
                <Text className="text-sm text-ui-fg-muted">
                  Checkout prices, labels and order shipping methods are read live from these Medusa shipping options
                  for the customer&rsquo;s delivery destination.
                </Text>
              </div>
              <StatusBadge color={shippingOptions.length ? "green" : "red"}>
                {shippingOptions.length ? `${shippingOptions.length} available` : "No options"}
              </StatusBadge>
            </div>

            {shippingOptions.length === 0 ? (
              <Alert variant="warning" title="No shipping options are served from the configured location">
                Customers cannot complete checkout until a shipping option exists for this location under
                Settings &rsaquo; Shipping.
              </Alert>
            ) : (
              <div className="rounded-lg border border-ui-border-base overflow-hidden">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Option</Table.HeaderCell>
                      <Table.HeaderCell>Type</Table.HeaderCell>
                      <Table.HeaderCell>Price</Table.HeaderCell>
                      <Table.HeaderCell>Coverage</Table.HeaderCell>
                      <Table.HeaderCell>ID</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {shippingOptions.map((option) => (
                      <Table.Row key={option.id}>
                        <Table.Cell className="font-semibold text-sm">{option.name}</Table.Cell>
                        <Table.Cell className="text-sm">
                          {option.code || option.description || option.price_type}
                        </Table.Cell>
                        <Table.Cell className="font-semibold text-sm">{formatGbp(option.amount_minor)}</Table.Cell>
                        <Table.Cell className="text-sm">
                          {option.countries?.length
                            ? option.countries.join(", ").toUpperCase()
                            : "All destinations"}
                        </Table.Cell>
                        <Table.Cell className="font-mono text-xs text-ui-fg-muted">{option.id}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}

            <form
              onSubmit={handleSaveShippingSettings}
              className="mt-4 pt-4 border-t border-ui-border-base flex flex-col gap-4 max-w-md"
            >
              <div>
                <Label>Default Shipping Option</Label>
                <Select
                  value={shippingDefaults.shipping_option_id || undefined}
                  onValueChange={(value) => setShippingDefaults({ ...shippingDefaults, shipping_option_id: value })}
                  disabled={busy || !shippingOptions.length}
                >
                  <Select.Trigger className="mt-1.5 w-full">
                    <Select.Value placeholder="Select a shipping option" />
                  </Select.Trigger>
                  <Select.Content>
                    {shippingOptions.map((option) => (
                      <Select.Item key={option.id} value={option.id}>
                        {option.name} &middot; {formatGbp(option.amount_minor)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Text className="text-xs text-ui-fg-muted mt-1">
                  Applied when a customer makes no explicit selection; a customer choice always wins.
                </Text>
              </div>

              <div>
                <Label>Reference Destinations</Label>
                <Input
                  value={shippingDefaults.destinations}
                  onChange={(e) => setShippingDefaults({ ...shippingDefaults, destinations: e.target.value })}
                  placeholder="gb, de, fr"
                  disabled={busy}
                />
                <Text className="text-xs text-ui-fg-muted mt-1">
                  Comma-separated country codes kept for catalogue reference. Live availability comes from the Medusa
                  service zones attached to each option.
                </Text>
              </div>

              <div className="pt-1">
                <Button disabled={busy} variant="primary">
                  {busy ? "Saving..." : "Save Shipping Configuration"}
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
      {/* CONFIRM BANK TRANSFER MODAL OVERLAY                                       */}
      {/* ========================================================================= */}
      {activeBankConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => {
            if (!busy) {
              setActiveBankConfirm(null)
              setModalAlert(null)
            }
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-ui-bg-base border border-ui-border-base shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base bg-ui-bg-subtle">
              <div className="flex flex-col">
                <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                  Confirm UK Bank Transfer
                </Heading>
                <Text size="small" className="text-ui-fg-muted font-mono text-xs mt-0.5">
                  Ref: {activeBankConfirm.transfer_reference}
                </Text>
              </div>
              <Button
                size="small"
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setActiveBankConfirm(null)
                  setModalAlert(null)
                }}
              >
                Close
              </Button>
            </div>

            <form onSubmit={handleBankConfirmSubmit}>
              <div className="p-6 flex flex-col gap-4">
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

                <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ui-fg-muted">Customer:</span>
                    <span className="font-semibold text-ui-fg-base">{activeBankConfirm.customer_name} ({activeBankConfirm.customer_email})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ui-fg-muted">Expected Amount:</span>
                    <span className="font-semibold text-ui-fg-base">£{activeBankConfirm.amount}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bank-tx-id">Bank Statement Transaction ID</Label>
                  <Input
                    id="bank-tx-id"
                    required
                    value={activeBankConfirm.bank_transaction_id}
                    onChange={(e) => setActiveBankConfirm({ ...activeBankConfirm, bank_transaction_id: e.target.value })}
                    placeholder="e.g. FPS-20261109-88412"
                    disabled={busy || modalAlert?.type === "success"}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bank-stmt-ref">Statement Payment Reference</Label>
                  <Input
                    id="bank-stmt-ref"
                    required
                    value={activeBankConfirm.statement_reference}
                    onChange={(e) => setActiveBankConfirm({ ...activeBankConfirm, statement_reference: e.target.value })}
                    disabled={busy || modalAlert?.type === "success"}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bank-amount">Cleared Amount (GBP £)</Label>
                  <Input
                    id="bank-amount"
                    required
                    value={activeBankConfirm.amount}
                    onChange={(e) => setActiveBankConfirm({ ...activeBankConfirm, amount: e.target.value })}
                    disabled={busy || modalAlert?.type === "success"}
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-ui-bg-subtle border-t border-ui-border-base flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    setActiveBankConfirm(null)
                    setModalAlert(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={busy || modalAlert?.type === "success"}
                >
                  {busy ? "Settling..." : "Verify & Create Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  Issue Refund
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
                    This note will be permanently recorded in the payment ledger audit trail.
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
                  {busy ? "Processing..." : "Process Refund"}
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
