import { useEffect, useMemo } from 'react'
import { JikeClient } from 'jike-sdk/index'
import { getUserIndex, toJSON } from '../utils/user'
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

function useClient(user: ConfigUser): JikeClient
function useClient(user: ConfigUser | undefined): JikeClient | undefined
function useClient(user: ConfigUser | undefined): JikeClient | undefined {
  return useMemo(() => user && JikeClient.fromJSON(user), [user])
}

interface UseUser<NeverEmpty extends boolean = false> {
  users: ConfigUser[]
  user: ConfigUser | (NeverEmpty extends true ? never : undefined)
  client: JikeClient | (NeverEmpty extends true ? never : undefined)
  setUser: (newUser: ConfigUser | undefined) => Promise<void>
  update: () => Promise<void>
}
export function useUser(user: ConfigUser): UseUser<true>
export function useUser(userId: string | undefined): UseUser<false>
export function useUser(user: ConfigUser | undefined): UseUser<false>
export function useUser(
  userId: string | ConfigUser | undefined
): UseUser<boolean> {
  const { users, findUser, setUsers } = useUsers()
  const user =
    typeof userId === 'string'
      ? useMemo(() => findUser(userId), [users, userId])
      : userId
  const client = useClient(user)
  const index = useMemo(() => getUserIndex(users, user), [users, user])

  useEffect(() => {
    if (!client) return

    const onRenewToken = () => update()
    client.on('renewToken', onRenewToken)
    return () => {
      client.off('renewToken', onRenewToken)
    }
  }, [client])

  const update = async () => {
    setUser(await toJSON(client!))
  }

  const setUser = (newUser: ConfigUser | undefined) => {
    if (index === -1) {
      throw new Error('User not found')
    }

    if (newUser) {
      users[index] = newUser
    } else {
      users.splice(index, 1)
    }
    return setUsers(users)
  }

  return {
    users,
    user,
    client,
    setUser,
    update,
  }
}
