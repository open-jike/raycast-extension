import { ActionPanel, Detail } from '@raycast/api'
import { LoginNewUser } from '../components/actions/user'

export function NoUser() {
  const contents = `
# 请先登录账号

**您需要登录账号后，才可以进行本操作**
`
  return (
    <Detail
      markdown={contents}
      navigationTitle="未登录账号"
      actions={
        <ActionPanel>
          <LoginNewUser />
        </ActionPanel>
      }
    />
  )
}
