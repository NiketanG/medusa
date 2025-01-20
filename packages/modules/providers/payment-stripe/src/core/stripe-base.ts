import Stripe from "stripe"

import {
  CreatePaymentProviderSession,
  PaymentMethodResponse,
  PaymentProviderContext,
  PaymentProviderError,
  PaymentProviderSessionResponse,
  ProviderWebhookPayload,
  UpdatePaymentProviderSession,
  WebhookActionResult,
} from "@medusajs/framework/types"
import {
  AbstractPaymentProvider,
  isDefined,
  isPresent,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import {
  ErrorCodes,
  ErrorIntentStatus,
  PaymentIntentOptions,
  StripeOptions,
} from "../types"
import {
  getAmountFromSmallestUnit,
  getSmallestUnit,
} from "../utils/get-smallest-unit"

abstract class StripeBase extends AbstractPaymentProvider<StripeOptions> {
  protected readonly options_: StripeOptions
  protected stripe_: Stripe
  protected container_: Record<string, unknown>

  static validateOptions(options: StripeOptions): void {
    if (!isDefined(options.apiKey)) {
      throw new Error("Required option `apiKey` is missing in Stripe plugin")
    }
  }

  protected constructor(
    cradle: Record<string, unknown>,
    options: StripeOptions
  ) {
    // @ts-ignore
    super(...arguments)

    this.container_ = cradle
    this.options_ = options

    this.stripe_ = new Stripe(options.apiKey)
  }

  abstract get paymentIntentOptions(): PaymentIntentOptions

  get options(): StripeOptions {
    return this.options_
  }

  normalizePaymentIntentParameters(
    extra?: Record<string, unknown>
  ): Partial<Stripe.PaymentIntentCreateParams> {
    const res = {} as Partial<Stripe.PaymentIntentCreateParams>

    res.description = (extra?.payment_description ??
      this.options_?.paymentDescription) as string

    res.capture_method =
      (extra?.capture_method as "automatic" | "manual") ??
      this.paymentIntentOptions.capture_method ??
      (this.options_.capture ? "automatic" : "manual")

    res.setup_future_usage =
      (extra?.setup_future_usage as "off_session" | "on_session" | undefined) ??
      this.paymentIntentOptions.setup_future_usage

    res.payment_method_types = this.paymentIntentOptions
      .payment_method_types as string[]

    res.automatic_payment_methods =
      (extra?.automatic_payment_methods as { enabled: true } | undefined) ??
      (this.options_?.automaticPaymentMethods ? { enabled: true } : undefined)

    res.off_session = extra?.off_session as boolean | undefined

    res.confirm = extra?.confirm as boolean | undefined

    res.payment_method = extra?.payment_method as string | undefined

    res.return_url = extra?.return_url as string | undefined

    return res
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    const id = paymentSessionData.id as string
    const paymentIntent = await this.stripe_.paymentIntents.retrieve(id)

    switch (paymentIntent.status) {
      case "requires_payment_method":
      case "requires_confirmation":
      case "processing":
        return PaymentSessionStatus.PENDING
      case "requires_action":
        return PaymentSessionStatus.REQUIRES_MORE
      case "canceled":
        return PaymentSessionStatus.CANCELED
      case "requires_capture":
        return PaymentSessionStatus.AUTHORIZED
      case "succeeded":
        return PaymentSessionStatus.CAPTURED
      default:
        return PaymentSessionStatus.PENDING
    }
  }

  async initiatePayment(
    input: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const { email, extra, session_id, customer } = input.context
    const { currency_code, amount } = input

    const additionalParameters = this.normalizePaymentIntentParameters(extra)

    const intentRequest: Stripe.PaymentIntentCreateParams = {
      amount: getSmallestUnit(amount, currency_code),
      currency: currency_code,
      metadata: { session_id: session_id! },
      ...additionalParameters,
    }

    if (customer?.metadata?.stripe_id) {
      intentRequest.customer = customer.metadata.stripe_id as string
    } else {
      let stripeCustomer
      try {
        stripeCustomer = await this.stripe_.customers.create({
          email,
        })
      } catch (e) {
        return this.buildError(
          "An error occurred in initiatePayment when creating a Stripe customer",
          e
        )
      }

      intentRequest.customer = stripeCustomer.id
    }

    let sessionData
    try {
      sessionData = (await this.stripe_.paymentIntents.create(
        intentRequest
      )) as unknown as Record<string, unknown>
    } catch (e) {
      return this.buildError(
        "An error occurred in InitiatePayment during the creation of the stripe payment intent",
        e
      )
    }

    return {
      data: sessionData,
      // TODO: REVISIT
      // update_requests: customer?.metadata?.stripe_id
      //   ? undefined
      //   : {
      //       customer_metadata: {
      //         stripe_id: intentRequest.customer,
      //       },
      //     },
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    | PaymentProviderError
    | {
        status: PaymentSessionStatus
        data: PaymentProviderSessionResponse["data"]
      }
  > {
    const status = await this.getPaymentStatus(paymentSessionData)
    return { data: paymentSessionData, status }
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    try {
      const id = paymentSessionData.id as string

      if (!id) {
        return paymentSessionData
      }

      return (await this.stripe_.paymentIntents.cancel(
        id
      )) as unknown as PaymentProviderSessionResponse["data"]
    } catch (error) {
      if (error.payment_intent?.status === ErrorIntentStatus.CANCELED) {
        return error.payment_intent
      }

      return this.buildError("An error occurred in cancelPayment", error)
    }
  }

  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    const id = paymentSessionData.id as string
    try {
      const intent = await this.stripe_.paymentIntents.capture(id)
      return intent as unknown as PaymentProviderSessionResponse["data"]
    } catch (error) {
      if (error.code === ErrorCodes.PAYMENT_INTENT_UNEXPECTED_STATE) {
        if (error.payment_intent?.status === ErrorIntentStatus.SUCCEEDED) {
          return error.payment_intent
        }
      }

      return this.buildError("An error occurred in capturePayment", error)
    }
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    return await this.cancelPayment(paymentSessionData)
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown>,
    refundAmount: number
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    const id = paymentSessionData.id as string

    try {
      const { currency } = paymentSessionData
      await this.stripe_.refunds.create({
        amount: getSmallestUnit(refundAmount, currency as string),
        payment_intent: id as string,
      })
    } catch (e) {
      return this.buildError("An error occurred in refundPayment", e)
    }

    return paymentSessionData
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    try {
      const id = paymentSessionData.id as string
      const intent = await this.stripe_.paymentIntents.retrieve(id)

      intent.amount = getAmountFromSmallestUnit(intent.amount, intent.currency)

      return intent as unknown as PaymentProviderSessionResponse["data"]
    } catch (e) {
      return this.buildError("An error occurred in retrievePayment", e)
    }
  }

  async updatePayment(
    input: UpdatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const { context, data, currency_code, amount } = input

    const amountNumeric = getSmallestUnit(amount, currency_code)

    const stripeId = context.customer?.metadata?.stripe_id

    if (stripeId !== data.customer) {
      return await this.initiatePayment(input)
    } else {
      if (isPresent(amount) && data.amount === amountNumeric) {
        return { data }
      }

      try {
        const id = data.id as string
        const sessionData = (await this.stripe_.paymentIntents.update(id, {
          amount: amountNumeric,
        })) as unknown as PaymentProviderSessionResponse["data"]

        return { data: sessionData }
      } catch (e) {
        return this.buildError("An error occurred in updatePayment", e)
      }
    }
  }

  async listPaymentMethods(
    context: PaymentProviderContext
  ): Promise<PaymentMethodResponse[]> {
    const customerId = context.customer?.metadata?.stripe_id
    if (!customerId) {
      return []
    }

    const paymentMethods = await this.stripe_.customers.listPaymentMethods(
      customerId as string,
      // In order to keep the interface simple, we just list the maximum payment methods, which should be enough in almost all cases.
      // We can always extend the interface to allow additional filtering, if necessary.
      { limit: 100 }
    )

    return paymentMethods.data.map((method) => ({
      id: method.id,
      data: method as unknown as Record<string, unknown>,
    }))
  }

  async getWebhookActionAndData(
    webhookData: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const event = this.constructWebhookEvent(webhookData)
    const intent = event.data.object as Stripe.PaymentIntent

    const { currency } = intent
    switch (event.type) {
      case "payment_intent.amount_capturable_updated":
        return {
          action: PaymentActions.AUTHORIZED,
          data: {
            session_id: intent.metadata.session_id,
            amount: getAmountFromSmallestUnit(
              intent.amount_capturable,
              currency
            ), // NOTE: revisit when implementing multicapture
          },
        }
      case "payment_intent.succeeded":
        return {
          action: PaymentActions.SUCCESSFUL,
          data: {
            session_id: intent.metadata.session_id,
            amount: getAmountFromSmallestUnit(intent.amount_received, currency),
          },
        }
      case "payment_intent.payment_failed":
        return {
          action: PaymentActions.FAILED,
          data: {
            session_id: intent.metadata.session_id,
            amount: getAmountFromSmallestUnit(intent.amount, currency),
          },
        }
      default:
        return { action: PaymentActions.NOT_SUPPORTED }
    }
  }

  /**
   * Constructs Stripe Webhook event
   * @param {object} data - the data of the webhook request: req.body
   *    ensures integrity of the webhook event
   * @return {object} Stripe Webhook event
   */
  constructWebhookEvent(data: ProviderWebhookPayload["payload"]): Stripe.Event {
    const signature = data.headers["stripe-signature"] as string

    return this.stripe_.webhooks.constructEvent(
      data.rawData as string | Buffer,
      signature,
      this.options_.webhookSecret
    )
  }
  protected buildError(message: string, error: Error): PaymentProviderError {
    const errorDetails =
      "raw" in error ? (error.raw as Stripe.StripeRawError) : error

    return {
      error: `${message}: ${error.message}`,
      code: "code" in errorDetails ? errorDetails.code : "unknown",
      detail:
        "detail" in errorDetails
          ? `${error.message}: ${errorDetails.detail}`
          : error.message,
    }
  }
}

export default StripeBase
