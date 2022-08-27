import React, { useState } from 'react'
import {
  Action,
  ActionPanel,
  Form,
  Icon,
  Toast,
  showToast,
  useNavigation,
} from '@raycast/api'
import { ApiOptions } from 'jike-sdk/index'
import { handleError } from '../utils/errors'
import { UserSelect } from '../components/user-select'
import { useUser, useUsers } from '../hooks/user'
import { NoUser } from './no-user'
import { ChooseTopic } from './choose-topic'
import type { Entity } from 'jike-sdk'
import type { ConfigUser } from '../utils/config'

export const Post: React.FC = () => {
  const { pop } = useNavigation()
  const { noUser } = useUsers()
  const [user, setUser] = useState<ConfigUser>()
  const [topic, setTopic] = useState<Entity.Topic>()
  const { client } = useUser(user)
  const [loading, setLoading] = useState(false)

  const submit = async ({ content }: { content: string }) => {
    if (!user) {
      await showToast({
        title: '请选择用户',
        style: Toast.Style.Failure,
      })
      return
    } else if (content.trim().length === 0) {
      await showToast({
        title: '内容不能为空',
        style: Toast.Style.Failure,
      })
      return
    }

    setLoading(true)
    try {
      await client!.createPost(ApiOptions.PostType.ORIGINAL, content, {
        topicId: topic?.id,
      })
    } catch (err) {
      handleError(err)
      return
    } finally {
      setLoading(false)
    }

    await showToast({
      title: '发送成功',
      style: Toast.Style.Success,
    })
    pop()
  }

  return !noUser ? (
    <Form
      isLoading={loading}
      navigationTitle="发布动态"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Submit"
            onSubmit={submit}
            icon={Icon.Upload}
          />
          {user && (
            <Action.Push
              title="Choose Topic"
              target={
                <ChooseTopic
                  user={user}
                  onSelect={(topic) => setTopic(topic)}
                />
              }
              icon={Icon.Bubble}
              shortcut={{ modifiers: ['cmd'], key: 't' }}
            />
          )}
          {topic && (
            <Action
              title="Clear Topic"
              icon={Icon.Trash}
              onAction={() => setTopic(undefined)}
              shortcut={{ modifiers: ['cmd', 'opt'], key: 't' }}
            />
          )}
        </ActionPanel>
      }
    >
      <UserSelect onChange={setUser} />

      <Form.TextArea
        id="content"
        title="内容"
        placeholder="请输入要发送的内容"
      />

      {
        <Form.Description
          title="圈子"
          text={
            topic
              ? topic.content
              : `⛔️ 未选择圈子（需通过右下角的命令面板选择 ⌘T）`
          }
        />
      }
    </Form>
  ) : (
    <NoUser />
  )
}
