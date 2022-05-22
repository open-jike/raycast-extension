import type { ConfigUser } from './config'

export const isSameUser = (left: ConfigUser, right: ConfigUser) =>
  // left.endpointUrl === right.endpointUrl &&
  left.userId === right.userId

export const findUser = (users: ConfigUser[], user: ConfigUser) => {
  const index = users.findIndex((u) => isSameUser(user, u))
  return [users[index], index] as const
}
