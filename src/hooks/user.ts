import { useEffect, useMemo, useState } from 'react'
import { JikeClient } from 'jike-sdk'
import { getConfig } from '../utils/config'
import type { ConfigUser } from '../utils/config'

export function useUsers() {
  const [users, setUsers] = useState<ConfigUser[]>([])

  const update = () => getConfig().then((cfg) => setUsers(cfg.users))

  const findUser = (userId: string) =>
    useMemo(() => users.find((u) => u.userId === userId), [users])

  useEffect(() => {
    update()
  }, [])

  return {
    users,
    update,
    findUser,
  }
}

export function useClient(user?: ConfigUser) {
  const client = useMemo(() => user && JikeClient.fromJSON(user), [user])

  return {
    client,
  }
}
