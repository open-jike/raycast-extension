import { Form } from '@raycast/api'
import { useUsers } from '../hooks/user'

export function UserSelect() {
  const { users } = useUsers()

  return (
    <Form.Dropdown id="userId" title="用户">
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
