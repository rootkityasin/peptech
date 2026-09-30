import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowPath } from "@medusajs/icons";
import "../../styles/custom.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Heading, Text, Button, Badge } from "@medusajs/ui";

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/admin/custom/subscriptions", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAction = async (sub, action) => {
    try {
      await fetch("/admin/custom/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customer_id: sub.customer_id,
          subscription_id: sub.id,
          action,
        }),
      });
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
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
    <div className="p-6 space-y-6 orders-theme-root min-h-screen bg-[#f6f6f7]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#202223]">28-Day Subscriptions</h1>
          <p className="text-xs text-[#5c5f62] mt-0.5">
            Manage recurring peptide refill subscriptions, pause/resume, and schedule renewal cycles.
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          10% Subscribe & Save Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, email, or subscription ID..."
          className="w-80 px-3 py-1.5 text-xs rounded-md border border-[#c9cccf] bg-white text-[#202223]"
        />
        <div className="flex gap-1 text-xs">
          {["all", "active", "paused", "canceled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterState(tab)}
              className={"px-3 py-1 rounded capitalize font-medium " + (
                filterState === tab
                  ? "bg-[#00C5A0] text-white"
                  : "bg-white border border-[#c9cccf] text-[#5c5f62] hover:text-[#202223]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[#e1e3e5] bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#e1e3e5] bg-[#fafbfb] text-[#5c5f62] uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="p-3">Subscription</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Frequency</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Next Renewal</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e1e3e5] text-[#202223]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-[#8c9196]">
                  Loading subscriptions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-[#8c9196]">
                  No subscriptions found.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#f6f6f7]">
                  <td className="p-3 font-semibold text-[#00C5A0]">
                    <Link to={"/subscriptions/" + sub.id} className="hover:underline">
                      {sub.id}
                    </Link>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{sub.customer_name || sub.email || "Elena Rostova"}</div>
                    <div className="text-[11px] text-[#5c5f62]">{sub.email || "customer@peptech.bio"}</div>
                  </td>
                  <td className="p-3 font-medium">Every 28 Days</td>
                  <td className="p-3 font-semibold text-emerald-600">10% OFF</td>
                  <td className="p-3 text-[#5c5f62]">{sub.next_renewal_date || "In 28 days"}</td>
                  <td className="p-3">
                    <span
                      className={"px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase " + (
                        sub.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : sub.status === "paused"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      {sub.status || "active"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {sub.status === "paused" ? (
                      <button
                        onClick={() => handleAction(sub, "resume")}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Resume
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(sub, "pause")}
                        className="px-2.5 py-1 text-[11px] font-medium rounded border border-[#c9cccf] bg-white hover:bg-[#f6f6f7]"
                      >
                        Pause
                      </button>
                    )}
                    <Link
                      to={"/subscriptions/" + sub.id}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#00C5A0] text-white hover:bg-[#16A6A3]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubscriptionsPage

export const config = defineRouteConfig({
  label: "Subscriptions",
  icon: ArrowPath,
});
