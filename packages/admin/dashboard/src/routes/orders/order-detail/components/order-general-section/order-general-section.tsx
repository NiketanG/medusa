import { XCircle } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import {
  Container,
  Copy,
  Heading,
  StatusBadge,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import { isPresent } from "../../../../../../../../core/utils/src/common/is-present"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { useCancelOrder } from "../../../../../hooks/api/orders"
import {
  getCanceledOrderStatus,
  getOrderFulfillmentStatus,
  getOrderPaymentStatus,
} from "../../../../../lib/order-helpers"

type OrderGeneralSectionProps = {
  order: HttpTypes.AdminOrder
}

export const OrderGeneralSection = ({ order }: OrderGeneralSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()

  const { mutateAsync: cancelOrder } = useCancelOrder(order.id)

  const handleCancel = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("orders.cancelWarning", {
        id: `#${order.display_id}`,
      }),
      confirmText: t("actions.continue"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await cancelOrder(undefined, {
      onSuccess: () => {
        toast.success(t("orders.orderCanceled"))
      },
      onError: (e) => {
        toast.error(e.message)
      },
    })
  }

  return (
    <Container className="flex items-center justify-between px-6 py-4">
      <div>
        <div className="flex items-center gap-x-1">
          <Heading>#{order.display_id}</Heading>
          <Copy content={`#${order.display_id}`} className="text-ui-fg-muted" />
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          {t("orders.onDateFromSalesChannel", {
            date: format(new Date(order.created_at), "dd MMM, yyyy, HH:mm:ss"),
            salesChannel: order.sales_channel?.name,
          })}
        </Text>
      </div>
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-1.5">
          <OrderBadge order={order} />
          <PaymentBadge order={order} />
          <FulfillmentBadge order={order} />
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.cancel"),
                  onClick: handleCancel,
                  disabled: !!order.canceled_at,
                  icon: <XCircle />,
                },
              ],
            },
          ]}
        />
      </div>
    </Container>
  )
}

const FulfillmentBadge = ({ order }: { order: HttpTypes.AdminOrder }) => {
  const { t } = useTranslation()

  const { label, color } = getOrderFulfillmentStatus(
    t,
    order.fulfillment_status
  )

  return (
    <StatusBadge color={color} className="text-nowrap">
      {label}
    </StatusBadge>
  )
}

const PaymentBadge = ({ order }: { order: HttpTypes.AdminOrder }) => {
  const { t } = useTranslation()

  const { label, color } = getOrderPaymentStatus(t, order.payment_status)

  return (
    <StatusBadge color={color} className="text-nowrap">
      {label}
    </StatusBadge>
  )
}

const OrderBadge = ({ order }: { order: HttpTypes.AdminOrder }) => {
  const { t } = useTranslation()
  const orderStatus = getCanceledOrderStatus(t, order.status)

  if (!isPresent(orderStatus)) {
    return
  }

  return (
    <StatusBadge color={orderStatus.color} className="text-nowrap">
      {orderStatus.label}
    </StatusBadge>
  )
}
