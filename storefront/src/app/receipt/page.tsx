import { redirect } from "next/navigation"

export default function ReceiptRootPage() {
  redirect("/account?tab=orders")
}
