import {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ConfigModule, IAuthModuleService } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { decode, JwtPayload, verify } from "jsonwebtoken"

// Middleware to validate that a token is valid
export const validateToken = () => {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    const { actor_type, auth_provider } = req.params
    const { token } = req.query

    const req_ = req as AuthenticatedMedusaRequest

    const errorObject = new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      `Invalid token`
    )

    if (!token) {
      return next(errorObject)
    }

    // @ts-ignore
    const { http } = req_.scope.resolve<ConfigModule>(
      ContainerRegistrationKeys.CONFIG_MODULE
    ).projectConfig

    const authModule = req.scope.resolve<IAuthModuleService>(Modules.AUTH)

    const decoded = decode(token as string) as JwtPayload

    if (!decoded?.entity_id) {
      return next(errorObject)
    }

    // E.g. token was requested for a customer, but attempted used for a user
    if (decoded?.actor_type !== actor_type) {
      return next(errorObject)
    }

    const [providerIdentity] = await authModule.listProviderIdentities(
      {
        entity_id: decoded.entity_id,
        provider: auth_provider,
      },
      {
        select: ["provider_metadata", "auth_identity_id", "entity_id"],
      }
    )

    if (!providerIdentity) {
      return next(errorObject)
    }

    try {
      verify(token as string, http.jwtSecret as string) as JwtPayload
    } catch (error) {
      return next(errorObject)
    }

    req_.auth_context = {
      actor_type,
      auth_identity_id: providerIdentity.auth_identity_id!,
      actor_id: providerIdentity.entity_id,
      app_metadata: {},
    }

    return next()
  }
}
