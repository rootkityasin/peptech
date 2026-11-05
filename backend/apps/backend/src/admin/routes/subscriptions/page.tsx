import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowPath } from "@medusajs/icons";
import {
  Container,
  Heading,
  Text,
  Table,
  Input,
  Button,
  Badge,
  StatusBadge,
} from "@medusajs/ui";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminFetch } from "../../lib/sdk";

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const res = await adminFetch("/admin/custom/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (e) {
      console.error("Failed to load subscriptions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAction = async (sub: any, action: string) => {
    try {
      await adminFetch("/admin/custom/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: sub.customer_id,
          subscription_id: sub.id,
          action,
        }),
      });
      fetchSubscriptions();
    } catch (err) {
      console.error("Failed to execute subscription action:", err);
    }
  };

  const filtered = (subscriptions || []).filter((s) => {
    if (filterState !== "all" && s.status !== filterState) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const idStr = String(s.id || "").toLowerCase();
      const emailStr = String(s.email || "").toLowerCase();
      const nameStr = String(s.customer_name || "").toLowerCase();
      return idStr.includes(q) || emailStr.includes(q) || nameStr.includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-y-3 p-6">
      <Container className="divide-y p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-2">
              <Heading level="h1">28-Day Subscriptions</Heading>
              <Badge color="green" size="small">
                10% Subscribe &amp; Save
              </Badge>
            </div>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Manage recurring peptide refill subscriptions, pause/resume, and schedule renewal cycles.
            </Text>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={fetchSubscriptions}
            disabled={isLoading}
          >
            <ArrowPath className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex items-center justify-between px-6 py-4 bg-ui-bg-subtle gap-4">
          <div className="w-80">
            <Input
              size="small"
              type="search"
              placeholder="Search by customer, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-x-1">
            {(["all", "active", "paused", "canceled"] as const).map((tab) => (
              <Button
                key={tab}
                size="small"
                variant={filterState === tab ? "primary" : "secondary"}
                onClick={() => setFilterState(tab)}
                className="capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Subscriptions Table */}
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Subscription</Table.HeaderCell>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Frequency</Table.HeaderCell>
              <Table.HeaderCell>Discount</Table.HeaderCell>
              <Table.HeaderCell>Next Renewal</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell {...({ colSpan: 7 } as any)} className="text-center py-8 text-ui-fg-muted">
                  Loading subscriptions...
                </Table.Cell>
              </Table.Row>
            ) : filtered.length === 0 ? (
              <Table.Row>
                <Table.Cell {...({ colSpan: 7 } as any)} className="text-center py-8 text-ui-fg-muted">
                  No subscriptions found.
                </Table.Cell>
              </Table.Row>
            ) : (
              filtered.map((sub) => {
                const statusColor =
                  sub.status === "active"
                    ? "green"
                    : sub.status === "paused"
                    ? "orange"
                    : "red";

                return (
                  <Table.Row key={sub.id}>
                    <Table.Cell>
                      <Link
                        to={`/subscriptions/${sub.id}`}
                        className="font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover font-mono text-xs"
                      >
                        {sub.sub_display_id || sub.id}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <Text size="small" leading="compact" weight="plus">
                          {sub.customer_name || sub.email || "Customer unavailable"}
                        </Text>
                        {sub.email && (
                          <Text size="small" leading="compact" className="text-ui-fg-subtle text-xs">
                            {sub.email}
                          </Text>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small" leading="compact">
                        {sub.frequency || `Every ${sub.cadence_days || 28} Days`}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="green" size="small">
                        10% OFF
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small" leading="compact" className="text-ui-fg-subtle">
                        {sub.next_renewal_date || sub.nextBillingDate || "—"}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge color={statusColor} className="capitalize">
                        {sub.status || "active"}
                      </StatusBadge>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-x-2">
                        {sub.status === "paused" ? (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => handleAction(sub, "resume")}
                          >
                            Resume
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => handleAction(sub, "pause")}
                          >
                            Pause
                          </Button>
                        )}
                        <Button size="small" variant="secondary" asChild>
                          <Link to={`/subscriptions/${sub.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>
      </Container>
    </div>
  );
};

export default SubscriptionsPage;

export const config = defineRouteConfig({
  label: "Subscriptions",
  icon: ArrowPath,
});
