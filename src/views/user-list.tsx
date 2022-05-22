import { useEffect, useMemo, useState } from 'react'
import { Action, ActionPanel, Icon, List } from '@raycast/api'
import { getConfig } from '../utils/config'
import { UserDetail } from './user-detail'
import { Login } from './login'
import type { ConfigUser } from '../utils/config'

export function UserList() {
  const [users, setUsers] = useState<ConfigUser[]>([])
  const [loading, setLoading] = useState(false)

  const refreshList = async () => {
    setLoading(true)
    await getConfig()
      .then((config) => setUsers(config.users))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshList()
  }, [])

  const actions = [
    <Action.Push
      key="userUser"
      title="登录新用户"
      target={<Login />}
      icon={Icon.Plus}
      shortcut={{ modifiers: ['cmd'], key: 'n' }}
    />,
  ]

  const isEmpty = useMemo(() => users.length === 0, [users])
  return (
    <List
      isLoading={loading}
      isShowingDetail={!isEmpty}
      navigationTitle="用户列表"
      actions={<ActionPanel>{...actions}</ActionPanel>}
    >
      {users.map((user) => (
        <UserDetail
          key={user.userId}
          user={user}
          actions={actions}
          onRefresh={refreshList}
        />
      ))}
    </List>
  )
}
