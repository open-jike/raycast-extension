import { Action, ActionPanel, Icon, List, Toast, showToast } from '@raycast/api'
import { ApiOptions, JikePostWithDetail, limit } from 'jike-sdk'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useUser } from '../hooks/user'
import { handleError } from '../utils/errors'
import { OpenProfile } from '../components/actions/user'
import { pictureWithCircle } from '../utils/icon'
import { LikePost, OpenPost, UnlikePost } from '../components/actions/post'
import type { FollowingUpdatesMoreKey } from 'jike-sdk/dist/client/types'
import type { Entity, JikeClient } from 'jike-sdk'

interface FeedsCtx {
  lastPage: () => void
  nextPage: () => void
  toLatest: () => void
}

const FeedsContext = createContext<FeedsCtx | undefined>(undefined)

export function Feeds() {
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const { users, client } = useUser(userId)
  const [updates, setUpdates] = useState<
    Awaited<ReturnType<JikeClient['queryFollowingUpdates']>>
  >([])
  const [lastKeys, setLastKeys] = useState<FollowingUpdatesMoreKey[]>([])
  const [lastKey, setLastKey] = useState<FollowingUpdatesMoreKey>(undefined)

  const fetchFeeds = async () => {
    if (!client) return

    setUpdates([])
    setLoading(true)
    try {
      const updates = await client.queryFollowingUpdates({
        lastKey,
        limit: limit.limitMaxCount(40),
        onDone(_, key) {
          setLastKeys([...lastKeys, key])
        },
      })
      setUpdates(updates)
    } catch (err) {
      handleError(err)
      return
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeeds()
  }, [client, lastKey])

  const context: FeedsCtx = {
    lastPage: () => {
      if (lastKeys.length <= 1) {
        showToast({
          title: '已经是第一页了',
          style: Toast.Style.Failure,
        })
        return
      }

      setLastKey(lastKeys.at(-3))
      setLastKeys(lastKeys.slice(0, -2))
    },

    nextPage: () => {
      setLastKey(lastKeys.at(-1))
    },

    toLatest: () => {
      setLastKeys([])
      setLastKey(undefined)
    },
  }

  const onSetUser = (userId: string) => {
    setLastKeys([])
    setUserId(userId)
  }

  const userList = (
    <List.Dropdown tooltip="请选择用户" storeValue={true} onChange={onSetUser}>
      {users.map((user) => (
        <List.Dropdown.Item
          key={user.userId}
          icon={pictureWithCircle(user.avatarImage || Icon.Person)}
          title={user.screenName}
          value={user.userId}
        />
      ))}
    </List.Dropdown>
  )

  return (
    <FeedsContext.Provider value={context}>
      <List
        isLoading={loading}
        navigationTitle="动态"
        isShowingDetail={updates.length > 0}
        searchBarAccessory={userList}
      >
        {updates.map((update) => {
          if (update instanceof JikePostWithDetail) {
            return <OriginalPost key={update.id} post={update} />
          } else
            switch (update.type) {
              case 'PERSONAL_UPDATE':
                return <PersonalUpdate key={update.id} update={update} />
              default:
                return (
                  <NotSupported
                    key={(update as any).id}
                    type={(update as any).type}
                    object={update}
                  />
                )
            }
        })}
      </List>
    </FeedsContext.Provider>
  )
}

const NotSupported = ({ type, object }: { type: string; object: unknown }) => (
  <List.Item
    title={`暂不支持 ${type}`}
    actions={
      <ActionPanel>
        <Pager />
        <CopyUpdate object={object} />
      </ActionPanel>
    }
  />
)

const PersonalUpdate = ({ update }: { update: Entity.PersonalUpdate }) => {
  switch (update.action) {
    case 'USER_FOLLOW':
      return <UserInteract update={update} title="关注了即友" />
    case 'USER_RESPECT':
      return <UserInteract update={update} title="夸了夸即友🎉" />
    default:
      return <NotSupported type={update.action} object={update} />
  }
}

const UserInteract = ({
  update,
  title,
}: {
  update: Entity.PersonalUpdate
  title: string
}) => (
  <List.Item
    icon={pictureWithCircle(update.users[0].avatarImage.thumbnailUrl)}
    title={update.users[0].screenName}
    subtitle={title}
    actions={
      <ActionPanel>
        {update.targetUsers.map((user) => (
          <ActionPanel.Submenu
            key={user.id}
            icon={pictureWithCircle(user.avatarImage.thumbnailUrl)}
            title={`打开 ${user.screenName} 用户页`}
          >
            <OpenProfile username={user.username} split={false} />
          </ActionPanel.Submenu>
        ))}
        <Pager />
        <CopyUpdate object={update} />
      </ActionPanel>
    }
    detail={
      <List.Item.Detail
        metadata={
          <List.Item.Detail.Metadata>
            <List.Item.Detail.Metadata.Label title={title} />
            {update.targetUsers.map((user) => (
              <List.Item.Detail.Metadata.Label
                key={user.id}
                icon={pictureWithCircle(user.avatarImage.thumbnailUrl)}
                title=""
                text={user.screenName}
              />
            ))}
          </List.Item.Detail.Metadata>
        }
      />
    }
  />
)

const OriginalPost = ({ post }: { post: JikePostWithDetail }) => {
  const [liked, setLiked] = useState(post.detail.liked)
  const markdown = useMemo(
    () => `${post.detail.content
      .replaceAll('\n', '\n\n')
      .replaceAll(/([!#()*+.[\\\]_`{}-])/g, `\\$1`)}

${post.detail.pictures
  ?.map((picture: Entity.Picture) => `![图片](${picture.middlePicUrl})`)
  .join('\n\n')}`,
    [post.detail.content, post.detail.pictures]
  )

  const onLike = async () => {
    try {
      await post.like()
      refreshLiked()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const onUnlike = async () => {
    try {
      await post.unlike()
      refreshLiked()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  const refreshLiked = () => setLiked(post.detail.liked)

  return (
    <List.Item
      icon={pictureWithCircle(post.detail.user.avatarImage.thumbnailUrl)}
      title={post.detail.user.screenName}
      subtitle={post.detail.content}
      actions={
        <ActionPanel>
          {liked ? (
            <UnlikePost onAction={onUnlike} />
          ) : (
            <LikePost onAction={onLike} />
          )}
          <OpenPost type={ApiOptions.PostType.ORIGINAL} id={post.id} />
          <Pager />
          <CopyUpdate object={post.detail} />
        </ActionPanel>
      }
      detail={
        <List.Item.Detail
          markdown={markdown}
          metadata={
            <List.Item.Detail.Metadata>
              {post.detail.topic && (
                <List.Item.Detail.Metadata.Label
                  title="圈子"
                  icon={pictureWithCircle(
                    post.detail.topic.squarePicture.thumbnailUrl
                  )}
                  text={post.detail.topic.content}
                />
              )}
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  )
}

function Pager() {
  const { lastPage, nextPage, toLatest } = useContext(FeedsContext)!
  return (
    <ActionPanel.Section>
      <Action
        icon="⬅️"
        title="上一页"
        shortcut={{ modifiers: ['opt'], key: 'arrowLeft' }}
        onAction={lastPage}
      />
      <Action
        icon="➡️"
        title="下一页"
        shortcut={{ modifiers: ['opt'], key: 'arrowRight' }}
        onAction={nextPage}
      />
      <Action
        icon="🎬"
        title="查看最新"
        shortcut={{ modifiers: ['opt', 'shift'], key: 'arrowLeft' }}
        onAction={toLatest}
      />
    </ActionPanel.Section>
  )
}

function CopyUpdate({ object }: { object: unknown }) {
  return (
    <Action.CopyToClipboard
      title="复制动态 (JSON)"
      shortcut={{ modifiers: ['opt', 'cmd'], key: 'c' }}
      content={JSON.stringify(object, undefined, 2)}
    />
  )
}
