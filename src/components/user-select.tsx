import { Form, Icon, Image } from '@raycast/api'
import { useUsers } from '../hooks/user'
import type { ConfigUser } from '../utils/config'

export function UserSelect({
  onChange,
  ...props
}: {
  onChange?: (user: ConfigUser | undefined) => void
} & Omit<Partial<Form.Dropdown.Props>, 'onChange'>) {
  const { users, findUser } = useUsers()

  const handleChange = (userId: string) => {
    if (!onChange) return
    const user = findUser(userId)
    onChange(user)
  }

  return (
    <Form.Dropdown id="userId" title="用户" onChange={handleChange} {...props}>
      {users.map((user) => (
        <Form.Dropdown.Item
          icon={{
            source: user.avatarImage || Icon.Person,
            mask: Image.Mask.Circle,
          }}
          key={user.userId}
          title={user.screenName}
          value={user.userId}
        />
      ))}
    </Form.Dropdown>
  )
}
