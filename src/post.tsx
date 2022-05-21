import {
  Action,
  ActionPanel,
  Form,
  Toast,
  showToast,
  useNavigation,
} from '@raycast/api'
import { ApiOptions, JikeClient } from 'jike-sdk'
import { useState } from 'react'
import { getConfig } from './utils/config'
import { handleError } from './utils/errors'

export default function Command() {
  const { pop } = useNavigation()
  const [content, setContent] = useState('')

  const submit = async () => {
    if (content.trim().length === 0) {
      await showToast({
        title: '内容不能为空',
        style: Toast.Style.Failure,
      })
      return
    }

    const client = JikeClient.fromJSON((await getConfig()).users[0])
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
      <Form.TextArea
        id="content"
        title="内容"
        placeholder="请输入要发送的内容"
        autoFocus
        value={content}
        onChange={setContent}
      />
    </Form>
  )
}
