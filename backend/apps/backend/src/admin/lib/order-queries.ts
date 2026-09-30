import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sdk } from "./sdk"
import { orderFields } from "./order-data"

export function useOrders() {
  const query = useQuery({
    queryKey: ["peptech-orders"],
    queryFn: async () => {
      const orders: any[] = []
      let count = 0
      do {
        const page = await sdk.admin.order.list({ limit: 100, offset: orders.length, order: "-created_at", fields: orderFields })
        orders.push(...page.orders)
        count = page.count
        if (!page.orders.length) break
      } while (orders.length < count)
      return { orders, count }
    },
    retry: false,
  })
  return { ...query, orders: query.data?.orders || [], count: query.data?.count || 0 }
}

export function useOrder(id: string) {
  const query = useQuery({
    queryKey: ["peptech-order", id],
    queryFn: () => sdk.admin.order.retrieve(id, { fields: orderFields }),
    retry: false,
  })
  return { ...query, order: query.data?.order || null }
}

export function useUpdateOrder(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (updates: Parameters<typeof sdk.admin.order.update>[1]) => sdk.admin.order.update(id, updates),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["peptech-order", id] }),
        client.invalidateQueries({ queryKey: ["peptech-orders"] }),
        client.invalidateQueries({ queryKey: ["orders"] }),
      ])
    },
  })
}
