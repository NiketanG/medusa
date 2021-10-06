import { MedusaError, Validator } from "medusa-core-utils"
import jwt from "jsonwebtoken"

export default async (req, res) => {
  const schema = Validator.object().keys({
    email: Validator.string()
      .email()
      .optional(),
    token: Validator.string().required(),
    password: Validator.string().required(),
  })

  const { value, error } = schema.validate(req.body)
  if (error) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, error.details)
  }

  try {
    const decoded = await jwt.decode(value.token)

    const userService = req.scope.resolve("userService")
    let user = await userService.retrieveByEmail(value.email || decoded.email, {
      select: ["id", "password_hash"],
    })

    const decodedToken = await jwt.verify(value.token, user.password_hash)
    if (!decodedToken || decodedToken.user_id !== user.id) {
      res.status(401).send("Invalid or expired password reset token")
      return
    }

    const { password_hash, ...data } = await userService.setPassword_(
      user.id,
      value.password
    )

    res.status(200).json({ user: data })
  } catch (error) {
    if (error.message === "invalid token") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, error.message)
    }
    throw error
  }
}
