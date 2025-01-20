import { CreateUserDTO } from "../../user"

/**
 * The data to create users.
 */
export interface CreateUsersWorkflowInputDTO {
  /**
   * The users to create.
   */
  users: CreateUserDTO[]
}
