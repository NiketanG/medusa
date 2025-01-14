export type CancelTransferOrderRequestWorkflowInput = {
  order_id: string
  logged_in_user_id: string
  actor_type: "customer" | "user"
}
