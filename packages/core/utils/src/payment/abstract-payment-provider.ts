import {
  CreatePaymentProviderSession,
  IPaymentProvider,
  PaymentProviderError,
  PaymentProviderSessionResponse,
  PaymentSessionStatus,
  ProviderWebhookPayload,
  UpdatePaymentProviderSession,
  WebhookActionResult,
} from "@medusajs/types"

export abstract class AbstractPaymentProvider<TConfig = Record<string, unknown>>
  implements IPaymentProvider
{
  /**
   * @ignore
   */
  protected readonly container: Record<string, unknown>
  /**
   * This method validates the options of the provider set in `medusa-config.ts`.
   * Implementing this method is optional. It's useful if your provider requires custom validation.
   *
   * If the options aren't valid, throw an error.
   *
   * @param options - The provider's options.
   *
   * @example
   * class MyPaymentProviderService extends AbstractPaymentProvider<Options> {
   *   static validateOptions(options: Record<any, any>) {
   *     if (!options.apiKey) {
   *       throw new MedusaError(
   *         MedusaError.Types.INVALID_DATA,
   *         "API key is required in the provider's options."
   *       )
   *     }
   *   }
   * }
   */
  static validateOptions(options: Record<any, any>): void | never {}

  /**
   * The constructor allows you to access resources from the [module's container](https://docs.medusajs.com/learn/fundamentals/modules/container) 
   * using the first parameter, and the module's options using the second parameter.
   * 
   * :::note
   * 
   * A module's options are passed when you register it in the Medusa application.
   * 
   * :::
   *
   * @param {Record<string, unknown>} cradle - The module's container cradle used to resolve resources.
   * @param {Record<string, unknown>} config - The options passed to the Payment Module provider.
   * @typeParam TConfig - The type of the provider's options passed as a second parameter.
   *
   * @example
   * import { AbstractPaymentProvider } from "@medusajs/framework/utils"
   * import { Logger } from "@medusajs/framework/types"
   * 
   * type Options = {
   *   apiKey: string
   * }
   * 
   * type InjectedDependencies = {
   *   logger: Logger
   * }
   * 
   * class MyPaymentProviderService extends AbstractPaymentProvider<Options> {
   *   protected logger_: Logger
   *   protected options_: Options
   *   // assuming you're initializing a client
   *   protected client
   * 
   *   constructor(
   *     container: InjectedDependencies,
   *     options: Options
   *   ) {
   *     super(container, options)
   * 
   *     this.logger_ = container.logger
   *     this.options_ = options
   * 
   *     // TODO initialize your client
   *   }
   *   // ...
   * }
   * 
   * export default MyPaymentProviderService
   */
  protected constructor(
    cradle: Record<string, unknown>,
    /**
     * @ignore
     */
    protected readonly config: TConfig = {} as TConfig // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    this.container = cradle
  }

  /**
   * @ignore
   */
  static _isPaymentProvider = true

  /**
   * @ignore
   */
  static isPaymentProvider(object): boolean {
    return object?.constructor?._isPaymentProvider
  }

  /**
   * Each payment provider has a unique identifier defined in its class. The provider's ID
   * will be stored as `pp_{identifier}_{id}`, where `{id}` is the provider's `id`
   * property in the `medusa-config.ts`.
   *
   * @example
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   static identifier = "my-payment"
   *   // ...
   * }
   */
  public static identifier: string

  /**
   * @ignore
   *
   * Return a unique identifier to retrieve the payment plugin provider
   */
  public getIdentifier(): string {
    const ctr = this.constructor as typeof AbstractPaymentProvider

    if (!ctr.identifier) {
      throw new Error(`Missing static property "identifier".`)
    }

    return ctr.identifier
  }

  /**
   * This method is used to capture a payment. The payment is captured in one of the following scenarios:
   *
   * - The {@link authorizePayment} method returns the status `captured`, which automatically executed this method after authorization.
   * - The merchant requests to capture the payment after its associated payment session was authorized.
   * - A webhook event occurred that instructs the payment provider to capture the payment session. Learn more about handing webhook events in [this guide](https://docs.medusajs.com/resources/commerce-modules/payment/webhook-events).
   *
   * In this method, use the third-party provider to capture the payment.
   *
   * @param paymentData - The `data` property of the payment. Make sure to store in it
   * any helpful identification for your third-party integration.
   * @returns The new data to store in the payment's `data` property, or an error object.
   *
   * @example
   * // other imports...
   * import {
   *   PaymentProviderError,
   *   PaymentProviderSessionResponse,
   * } from "@medusajs/framework/types"
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async capturePayment(
   *     paymentData: Record<string, unknown>
   *   ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
   *     const externalId = paymentData.id
   *
   *     try {
   *       // assuming you have a client that captures the payment
   *       const newData = await this.client.capturePayment(externalId)
   *
   *       return {
   *         ...newData,
   *         id: externalId
   *       }
   *     } catch (e) {
   *       return {
   *         error: e,
   *         code: "unknown",
   *         detail: e
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract capturePayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]>

  /**
   * This method authorizes a payment session. When authorized successfully, a payment is created by the Payment
   * Module which can be later captured using the {@link capturePayment} method.
   *
   * Refer to [this guide](https://docs.medusajs.com/resources/commerce-modules/payment/payment-flow#3-authorize-payment-session)
   * to learn more about how this fits into the payment flow and how to handle required actions.
   *
   * To automatically capture the payment after authorization, return the status `captured`.
   *
   * @param paymentSessionData - The `data` property of the payment session. Make sure to store in it
   * any helpful identification for your third-party integration.
   * @param context - The context in which the payment is being authorized. For example, in checkout,
   * the context has a `cart_id` property indicating the ID of the associated cart.
   * @returns Either an object of the new data to store in the created payment's `data` property and the
   * payment's status, or an error object. Make sure to set in `data` anything useful to later retrieve the session.
   *
   * @example
   * // other imports...
   * import {
   *   PaymentProviderError,
   *   PaymentProviderSessionResponse,
   *   PaymentSessionStatus
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async authorizePayment(
   *     paymentSessionData: Record<string, unknown>,
   *     context: Record<string, unknown>
   *   ): Promise<
   *     PaymentProviderError | {
   *       status: PaymentSessionStatus
   *       data: PaymentProviderSessionResponse["data"]
   *     }
   *   > {
   *     const externalId = paymentSessionData.id
   *
   *     try {
   *       // assuming you have a client that authorizes the payment
   *       const paymentData = await this.client.authorizePayment(externalId)
   *
   *       return {
   *         data: {
   *           ...paymentData,
   *           id: externalId
   *         },
   *         status: "authorized"
   *       }
   *     } catch (e) {
   *       return {
   *         error: e,
   *         code: "unknown",
   *         detail: e
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    | PaymentProviderError
    | {
        /**
         * The new status of the payment.
         */
        status: PaymentSessionStatus
        /**
         * The data to store in the created payment's `data` property.
         */
        data: PaymentProviderSessionResponse["data"]
      }
  >

  /**
   * This method cancels a payment.
   *
   * @param paymentData - The `data` property of the payment. Make sure to store in it
   * any helpful identification for your third-party integration.
   * @returns An error object if an error occurs, or the data received from the integration.
   *
   * @example
   * // other imports...
   * import {
   *   PaymentProviderError,
   *   PaymentProviderSessionResponse,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async cancelPayment(
   *     paymentData: Record<string, unknown>
   *   ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
   *     const externalId = paymentData.id
   *
   *     try {
   *       // assuming you have a client that cancels the payment
   *       const paymentData = await this.client.cancelPayment(externalId)
   *     } catch (e) {
   *       return {
   *         error: e,
   *         code: "unknown",
   *         detail: e
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract cancelPayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]>

  /**
   * This method is used when a payment session is created. It can be used to initiate the payment
   * in the third-party session, before authorizing or capturing the payment later.
   *
   * @param context - The details of the payment session and its context.
   * @returns An object whose `data` property is set in the created payment session, or an error
   * object. Make sure to set in `data` anything useful to later retrieve the session.
   *
   * @example
   * // other imports...
   * import {
   *   PaymentProviderError,
   *   PaymentProviderSessionResponse,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async initiatePayment(
   *     context: CreatePaymentProviderSession
   *   ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
   *     const {
   *       amount,
   *       currency_code,
   *       context: customerDetails
   *     } = context
   *
   *     try {
   *       // assuming you have a client that initializes the payment
   *       const response = await this.client.init(
   *         amount, currency_code, customerDetails
   *       )
   *
   *       return {
   *         ...response,
   *         data: {
   *           id: response.id
   *         }
   *       }
   *     } catch (e) {
   *       return {
   *         error: e,
   *         code: "unknown",
   *         detail: e
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract initiatePayment(
    context: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse>

  /**
   * This method is used when a payment session is deleted, which can only happen if it isn't authorized, yet.
   *
   * Use this to delete or cancel the payment in the third-party service.
   *
   * @param paymentSessionData - The `data` property of the payment session. Make sure to store in it
   * any helpful identification for your third-party integration.
   * @returns An error object or the response from the third-party service.
   *
   * @example
   * // other imports...
   * import {
   *   PaymentProviderError,
   *   PaymentProviderSessionResponse,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async deletePayment(
   *     paymentSessionData: Record<string, unknown>
   *   ): Promise<
   *     PaymentProviderError | PaymentProviderSessionResponse["data"]
   *   > {
   *     const externalId = paymentSessionData.id
   *
   *     try {
   *       // assuming you have a client that cancels the payment
   *       await this.client.cancelPayment(externalId)
   *     } catch (e) {
   *       return {
   *         error: e,
   *         code: "unknown",
   *         detail: e
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]>

  /**
   * This method gets the status of a payment session based on the status in the third-party integration.
   *
   * @param paymentSessionData - The `data` property of the payment session. Make sure to store in it
   * any helpful identification for your third-party integration.
   * @returns The payment session's status.
   *
   * @example
   * // other imports...
   * import {
   *   PaymentSessionStatus
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async getPaymentStatus(
   *     paymentSessionData: Record<string, unknown>
   *   ): Promise<PaymentSessionStatus> {
   *     const externalId = paymentSessionData.id
   *
   *     try {
   *       // assuming you have a client that retrieves the payment status
   *       const status = await this.client.getStatus(externalId)
   *
   *       switch (status) {
   *         case "requires_capture":
   *           return "authorized"
   *         case "success":
   *           return "captured"
   *         case "canceled":
   *           return "canceled"
   *         default:
   *           return "pending"
   *       }
   *     } catch (e) {
   *       return "error"
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus>

  /**
   * This method refunds an amount of a payment previously captured.
   *
   * @param paymentData - The `data` property of the payment. Make sure to store in it
   * any helpful identification for your third-party integration.
   * @param refundAmount The amount to refund.
   * @returns The new data to store in the payment's `data` property, or an error object.
   *
   * @example
   * // other imports...
   * import {
   *   PaymentProviderError,
   *   PaymentProviderSessionResponse,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async refundPayment(
   *     paymentData: Record<string, unknown>,
   *     refundAmount: number
   *   ): Promise<
   *     PaymentProviderError | PaymentProviderSessionResponse["data"]
   *   > {
   *     const externalId = paymentData.id
   *
   *     try {
   *       // assuming you have a client that refunds the payment
   *       const newData = await this.client.refund(
   *         externalId,
   *         refundAmount
   *       )
   *
   *       return {
   *         ...newData,
   *         id: externalId
   *       }
   *     } catch (e) {
   *       return {
   *         error: e,
   *         code: "unknown",
   *         detail: e
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract refundPayment(
    paymentData: Record<string, unknown>,
    refundAmount: number
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]>

  /**
   * Retrieves the payment's data from the third-party service.
   *
   * @param paymentSessionData - The `data` property of the payment. Make sure to store in it
   * any helpful identification for your third-party integration.
   * @returns An object to be stored in the payment's `data` property, or an error object.
   *
   * @example
   * // other imports...
   * import {
   *   PaymentProviderError,
   *   PaymentProviderSessionResponse,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async retrievePayment(
   *     paymentSessionData: Record<string, unknown>
   *   ): Promise<
   *     PaymentProviderError | PaymentProviderSessionResponse["data"]
   *   > {
   *     const externalId = paymentSessionData.id
   *
   *     try {
   *       // assuming you have a client that retrieves the payment
   *       return await this.client.retrieve(externalId)
   *     } catch (e) {
   *       return {
   *         error: e,
   *         code: "unknown",
   *         detail: e
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]>

  /**
   * Update a payment in the third-party service that was previously initiated with the {@link initiatePayment} method.
   *
   * @param context - The details of the payment session and its context.
   * @returns An object whose `data` property is set in the updated payment session, or an error
   * object. Make sure to set in `data` anything useful to later retrieve the session.
   *
   * @example
   * // other imports...
   * import {
   *   UpdatePaymentProviderSession,
   *   PaymentProviderError,
   *   PaymentProviderSessionResponse,
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async updatePayment(
   *     context: UpdatePaymentProviderSession
   *   ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
   *     const {
   *       amount,
   *       currency_code,
   *       context: customerDetails,
   *       data
   *     } = context
   *     const externalId = data.id
   *
   *     try {
   *       // assuming you have a client that updates the payment
   *       const response = await this.client.update(
   *         externalId,
   *         {
   *           amount,
   *           currency_code,
   *           customerDetails
   *         }
   *       )
   *
   *       return {
   *         ...response,
   *         data: {
   *           id: response.id
   *         }
   *       }
   *     } catch (e) {
   *       return {
   *         error: e,
   *         code: "unknown",
   *         detail: e
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract updatePayment(
    context: UpdatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse>

  /**
   * This method is executed when a webhook event is received from the third-party payment provider. Use it
   * to process the action of the payment provider.
   *
   * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/payment/webhook-events)
   *
   * @param data - The webhook event's data
   * @returns The webhook result. If the `action`'s value is `captured`, the payment is captured within Medusa as well.
   * If the `action`'s value is `authorized`, the associated payment session is authorized within Medusa.
   *
   * @example
   * // other imports...
   * import {
   *   BigNumber
   * } from "@medusajs/framework/utils"
   * import {
   *   ProviderWebhookPayload,
   *   WebhookActionResult
   * } from "@medusajs/framework/types"
   *
   *
   * class MyPaymentProviderService extends AbstractPaymentProvider<
   *   Options
   * > {
   *   async getWebhookActionAndData(
   *     payload: ProviderWebhookPayload["payload"]
   *   ): Promise<WebhookActionResult> {
   *     const {
   *       data,
   *       rawData,
   *       headers
   *     } = payload
   *
   *     try {
   *       switch(data.event_type) {
   *         case "authorized_amount":
   *           return {
   *             action: "authorized",
   *             data: {
   *               session_id: (data.metadata as Record<string, any>).session_id,
   *               amount: new BigNumber(data.amount as number)
   *             }
   *           }
   *         case "success":
   *           return {
   *             action: "captured",
   *             data: {
   *               session_id: (data.metadata as Record<string, any>).session_id,
   *               amount: new BigNumber(data.amount as number)
   *             }
   *           }
   *         default:
   *           return {
   *             action: "not_supported"
   *           }
   *       }
   *     } catch (e) {
   *       return {
   *         action: "failed",
   *         data: {
   *           session_id: (data.metadata as Record<string, any>).session_id,
   *           amount: new BigNumber(data.amount as number)
   *         }
   *       }
   *     }
   *   }
   *
   *   // ...
   * }
   */
  abstract getWebhookActionAndData(
    data: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult>
}

/**
 * @ignore
 */
export function isPaymentProviderError(obj: any): obj is PaymentProviderError {
  return (
    obj &&
    typeof obj === "object" &&
    "error" in obj &&
    "code" in obj &&
    "detail" in obj
  )
}
