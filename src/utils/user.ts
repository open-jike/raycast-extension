import type { ConfigUser } from './config'

export const isSameUser = (left: ConfigUser, right: ConfigUser) =>
  // left.endpointUrl === right.endpointUrl &&
  left.userId === right.userId
