import type { ConfigUser } from './config'

export const isSameUser = (left: ConfigUser, right: ConfigUser | undefined) =>
  // left.endpointUrl === right.endpointUrl &&
  left.userId === right?.userId

export const getUserIndex = (
  users: ConfigUser[],
  user: ConfigUser | undefined
) => users.findIndex((u) => isSameUser(u, user))
