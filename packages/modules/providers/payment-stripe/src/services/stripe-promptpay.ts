import StripeBase from "../core/stripe-base"
import { PaymentIntentOptions, PaymentProviderKeys } from "../types"

class PromptpayProviderService extends StripeBase {
  static identifier = PaymentProviderKeys.PROMPT_PAY

  constructor(_, options) {
    super(_, options)
  }

  get paymentIntentOptions(): PaymentIntentOptions {
    return {
      payment_method_types: ["promptpay"],
      capture_method: "automatic",
    }
  }
}

export default PromptpayProviderService
