import { Form } from '@raycast/api'
import { useUsers } from '../hooks/user'
import type { ConfigUser } from '../utils/config'

export function UserSelect({
  onChange,
}: {
  onChange?: (user: ConfigUser | undefined) => void
}) {
  const { users, findUser } = useUsers()

  const handleChange = (userId: string) => {
    if (!onChange) return
    const user = findUser(userId)
    onChange(user)
  }

  return (
    <Form.Dropdown id="userId" title="用户" onChange={handleChange}>
      {users.map((user) => (
        <Form.Dropdown.Item
          key={user.userId}
          title={user.screenName}
          value={user.userId}
        />
      ))}
    </Form.Dropdown>
  )
}
