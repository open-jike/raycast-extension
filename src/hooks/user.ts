import { useMemo } from 'react'
import { JikeClient } from 'jike-sdk'
import { getUserIndex } from '../utils/user'
import { useConfig } from './config'
import type { ConfigUser } from '../utils/config'

export function useUsers() {
  const { config, ready, setConfig, reload } = useConfig()
  const { users } = config
  const noUser = ready ? users.length === 0 : false

  const findUser = (userId: string) => users.find((u) => u.userId === userId)

  const setUsers = async (users: ConfigUser[]) =>
    setConfig({ ...config, users })

  return {
    ready,
    users,
    noUser,
    reload,
    findUser,
    setUsers,
  }
}

export function useClient(user: ConfigUser): JikeClient
export function useClient(user: ConfigUser | undefined): JikeClient | undefined
export function useClient(
  user: ConfigUser | undefined
): JikeClient | undefined {
  return useMemo(() => user && JikeClient.fromJSON(user), [user])
}

interface UseUser<isUser extends boolean = false> {
  user: ConfigUser | (isUser extends true ? never : undefined)
  client: JikeClient | (isUser extends true ? never : undefined)
  setUser: (newUser: ConfigUser | undefined) => Promise<void>
}
export function useUser(userId: string): UseUser<false>
export function useUser(user: ConfigUser): UseUser<true>
export function useUser(userId: string | ConfigUser): UseUser<boolean> {
  const { users, findUser, setUsers } = useUsers()
  const user =
    typeof userId === 'string'
      ? useMemo(() => findUser(userId), [users, userId])
      : userId
  const client = useClient(user)
  const index = useMemo(() => getUserIndex(users, user), [users, user])

  const setUser = (newUser: ConfigUser | undefined) => {
    if (index === -1) throw new Error('User not found')

    if (newUser) {
      users[index] = newUser
    } else {
      users.splice(index, 1)
    }
    return setUsers(users)
  }

  return {
    user,
    client,
    setUser,
  }
}
