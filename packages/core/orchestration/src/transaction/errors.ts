class BaseStepErrror extends Error {
  #stepResponse: unknown

  constructor(name, message?: string, stepResponse?: unknown) {
    super(message)
    this.name = name
    this.#stepResponse = stepResponse
  }

  getStepResponse(): unknown {
    return this.#stepResponse
  }
}

export class PermanentStepFailureError extends BaseStepErrror {
  static isPermanentStepFailureError(
    error: Error
  ): error is PermanentStepFailureError {
    return (
      error instanceof PermanentStepFailureError ||
      error?.name === "PermanentStepFailure"
    )
  }

  constructor(message?: string, stepResponse?: unknown) {
    super("PermanentStepFailure", message, stepResponse)
  }
}

export class SkipStepResponse extends BaseStepErrror {
  static isSkipStepResponse(error: Error): error is SkipStepResponse {
    return (
      error instanceof SkipStepResponse || error?.name === "SkipStepResponse"
    )
  }

  constructor(message?: string, stepResponse?: unknown) {
    super("SkipStepResponse", message, stepResponse)
  }
}

export class TransactionStepTimeoutError extends BaseStepErrror {
  static isTransactionStepTimeoutError(
    error: Error
  ): error is TransactionStepTimeoutError {
    return (
      error instanceof TransactionStepTimeoutError ||
      error?.name === "TransactionStepTimeoutError"
    )
  }

  constructor(message?: string, stepResponse?: unknown) {
    super("TransactionStepTimeoutError", message, stepResponse)
  }
}

export class TransactionTimeoutError extends BaseStepErrror {
  static isTransactionTimeoutError(
    error: Error
  ): error is TransactionTimeoutError {
    return (
      error instanceof TransactionTimeoutError ||
      error?.name === "TransactionTimeoutError"
    )
  }

  constructor(message?: string, stepResponse?: unknown) {
    super("TransactionTimeoutError", message, stepResponse)
  }
}

export class NonSerializableCheckPointError extends Error {
  static isNonSerializableCheckPointError(
    error: Error
  ): error is NonSerializableCheckPointError {
    return (
      error instanceof NonSerializableCheckPointError ||
      error?.name === "NonSerializableCheckPointError"
    )
  }

  constructor(message?: string) {
    super(message)
    this.name = "NonSerializableCheckPointError"
  }
}
