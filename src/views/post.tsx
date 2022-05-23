import {
  Action,
  ActionPanel,
  Form,
  Toast,
  showToast,
  useNavigation,
} from '@raycast/api'
import { ApiOptions, JikeClient } from 'jike-sdk'
import { handleError } from '../utils/errors'
import { useUsers } from '../hooks/user'
import { UserSelect } from '../components/user-select'

export function Post() {
  const { pop } = useNavigation()
  const { findUser } = useUsers()

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

    const user = findUser(userId)!
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
      <UserSelect />

      <Form.TextArea
        id="content"
        title="内容"
        placeholder="请输入要发送的内容"
        autoFocus
      />
    </Form>
  )
}
