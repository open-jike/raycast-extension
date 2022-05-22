import {
  Action,
  ActionPanel,
  Form,
  Toast,
  showToast,
  useNavigation,
} from '@raycast/api'
import { ApiOptions, JikeClient } from 'jike-sdk'
import { useEffect, useState } from 'react'
import { getConfig } from '../utils/config'
import { handleError } from '../utils/errors'
import type { ConfigUser } from '../utils/config'

export function Post() {
  const { pop } = useNavigation()
  const [users, setUsers] = useState<ConfigUser[]>([])

  useEffect(() => {
    getConfig().then((cfg) => setUsers(cfg.users))
  }, [])

  const submit = async ({
    userId,
    content,
  }: {
    userId: string
    content: string
  }) => {
    if (content.trim().length === 0) {
      await showToast({
        title: '内容不能为空',
        style: Toast.Style.Failure,
      })
      return
    }

    const user = users.find((u) => u.userId === userId)!
    const client = JikeClient.fromJSON(user)
    try {
      await client.createPost(ApiOptions.PostType.ORIGINAL, content)
    } catch (err) {
      handleError(err)
      return
    }

    await showToast({
      title: '发送成功',
      style: Toast.Style.Success,
    })
    pop()
  }

  return (
    <Form
      navigationTitle="发布动态"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={submit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="userId" title="用户">
        {users.map((user) => (
          <Form.Dropdown.Item
            key={user.userId}
            title={user.screenName}
            value={user.userId}
          />
        ))}
      </Form.Dropdown>

      <Form.TextArea
        id="content"
        title="内容"
        placeholder="请输入要发送的内容"
        autoFocus
      />
    </Form>
  )
}
