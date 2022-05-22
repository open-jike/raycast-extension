import { useEffect, useMemo, useState } from 'react'
import {
  Action,
  ActionPanel,
  Icon,
  List,
  Toast,
  confirmAlert,
  showHUD,
  showToast,
} from '@raycast/api'
import { JikeClient } from 'jike-sdk'
import { handleError } from '../utils/errors'
import { updateConfig } from '../utils/config'
import { findUser } from '../utils/user'
import type { ConfigUser } from '../utils/config'
import type { ReactNode } from 'react'
import type { Entity } from 'jike-sdk'

export interface UserDetailProps {
  user: ConfigUser
  actions: ReactNode[]
  onRefresh: () => void
}

export function UserDetail({ user, actions, onRefresh }: UserDetailProps) {
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<Entity.Profile>()
  const client = useMemo(() => JikeClient.fromJSON(user), [user])

  const refreshUser = async (user: ConfigUser) => {
    await showToast({
      title: '正在更新用户信息...',
      style: Toast.Style.Animated,
    })
    try {
      await client.renewToken()
      await updateConfig((cfg) => {
        const [newUser] = findUser(cfg.users, user)
        newUser.accessToken = client.accessToken
        newUser.refreshToken = client.refreshToken
      })
    } catch (err) {
      handleError(err)
      return
    }

    await showToast({
      title: '更新成功',
      style: Toast.Style.Success,
    })
    onRefresh()
  }

  const logout = async (user: ConfigUser) => {
    if (
      !(await confirmAlert({
        title: '您确定要注销此用户吗？',
        icon: Icon.QuestionMark,
      }))
    )
      return

    await updateConfig((cfg) => {
      const [, index] = findUser(cfg.users, user)
      cfg.users.splice(index, 1)
    })
    onRefresh()
  }

  const itemActions = (user: ConfigUser) => [
    <Action.OpenInBrowser
      key="open"
      title="打开用户页 (macOS App)"
      icon="📲"
      url={`jike://page.jk/user/${user.username}`}
      onOpen={() => showHUD('已打开')}
    />,

    <ActionPanel.Submenu
      key="openWith"
      title="打开用户页 (通过其他客户端)"
      icon={Icon.Window}
    >
      <Action.OpenInBrowser
        title="PC Web 端"
        url={`https://web.okjike.com/u/${user.username}`}
        onOpen={() => showHUD('已打开')}
      />
      <Action.OpenInBrowser
        title="手机 Web 端"
        url={`https://m.okjike.com/users/${user.username}`}
        onOpen={() => showHUD('已打开')}
      />
    </ActionPanel.Submenu>,

    <Action
      key="refresh"
      title="刷新认证信息"
      icon={Icon.ArrowClockwise}
      onAction={() => refreshUser(user)}
      shortcut={{ modifiers: ['cmd'], key: 'r' }}
    />,

    <Action
      key="logout"
      title="注销用户"
      icon={Icon.XmarkCircle}
      onAction={() => logout(user)}
      shortcut={{ modifiers: ['cmd'], key: 'backspace' }}
    />,

    <ActionPanel.Section key="copy" title="复制">
      <Action.CopyToClipboard title="昵称" content={user.screenName} />
      <Action.CopyToClipboard
        title="Access Token"
        content={user.accessToken}
        shortcut={{ modifiers: ['cmd', 'ctrl'], key: 'c' }}
      />
      <Action.CopyToClipboard
        title="Refresh Token"
        content={user.refreshToken}
      />
      <Action.CopyToClipboard
        title="详细数据 (JSON)"
        content={JSON.stringify(user, undefined, 2)}
        shortcut={{ modifiers: ['opt', 'cmd'], key: 'c' }}
      />
    </ActionPanel.Section>,
  ]

  useEffect(() => {
    setLoading(true)
    client
      .getSelf()
      .queryProfile()
      .then((profile) => setUserProfile(profile.user))
      .catch((err) => handleError(err))
      .finally(() => setLoading(false))
  }, [client])

  const markdown = userProfile
    ? `
<img width="128" src="${userProfile.avatarImage.picUrl}"/>

个性签名

\`\`\`
${userProfile.bio}
\`\`\`
`
    : undefined
  const gender = useMemo(
    () =>
      ({ undefined, MALE: '男', FEMALE: '女' }[String(userProfile?.gender)]),
    [userProfile?.gender]
  )
  return (
    <List.Item
      key={user.userId}
      icon={userProfile?.avatarImage.thumbnailUrl || Icon.Person}
      title={user.screenName}
      actions={
        <ActionPanel>
          {...itemActions(user)}
          {...actions}
        </ActionPanel>
      }
      detail={
        <List.Item.Detail
          isLoading={loading}
          markdown={markdown}
          metadata={
            userProfile ? (
              <List.Item.Detail.Metadata>
                <List.Item.Detail.Metadata.Label
                  title="用户 ID"
                  text={userProfile.id}
                  icon="🆔"
                />
                <List.Item.Detail.Metadata.Label
                  title="用户名"
                  text={userProfile.username}
                />
                <List.Item.Detail.Metadata.Label
                  title="昵称"
                  text={userProfile.screenName}
                />
                {gender && (
                  <List.Item.Detail.Metadata.Label title="性别" text={gender} />
                )}
                {userProfile.birthday && (
                  <List.Item.Detail.Metadata.Label
                    title="生日"
                    text={userProfile.birthday}
                    icon="🎂"
                  />
                )}
                <List.Item.Detail.Metadata.Label
                  title="动态信息"
                  text={`动态获得 ${userProfile.statsCount.liked} 次赞，获得 ${userProfile.statsCount.highlightedPersonalUpdates} 次精选`}
                  icon="✨"
                />
                {userProfile.profileVisitInfo && (
                  <>
                    <List.Item.Detail.Metadata.Label
                      title="今日访客"
                      text={`${userProfile.profileVisitInfo.todayCount} 个`}
                      icon={Icon.Person}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="最后访客"
                      text={
                        userProfile.profileVisitInfo.latestVisitor.screenName
                      }
                      icon={
                        userProfile.profileVisitInfo.latestVisitor.avatarImage
                          .thumbnailUrl
                      }
                    />
                  </>
                )}

                <List.Item.Detail.Metadata.Separator />

                <List.Item.Detail.Metadata.Label
                  title="关注"
                  text={String(userProfile.statsCount.followingCount)}
                />
                <List.Item.Detail.Metadata.Label
                  title="被关注"
                  text={String(userProfile.statsCount.followedCount)}
                />
                <List.Item.Detail.Metadata.Label
                  title="夸夸"
                  text={String(userProfile.statsCount.respectedCount)}
                  icon="👍"
                />

                <List.Item.Detail.Metadata.Separator />

                <List.Item.Detail.Metadata.Label title="标签" icon="🏷️" />
                {userProfile.profileTags.map((tag, idx) => (
                  <List.Item.Detail.Metadata.Label
                    key={idx}
                    title=""
                    text={tag.text}
                    icon={tag.picUrl}
                  />
                ))}

                <List.Item.Detail.Metadata.Separator />

                <List.Item.Detail.Metadata.Label title="Token" />
                <List.Item.Detail.Metadata.Label
                  title="Access Token"
                  text={user.accessToken}
                />
                <List.Item.Detail.Metadata.Label
                  title="Refresh Token"
                  text={user.refreshToken}
                />
                <List.Item.Detail.Metadata.Label
                  title="idfv"
                  text={user.idfv}
                />
                <List.Item.Detail.Metadata.Label
                  title="Device ID"
                  text={user.deviceId}
                />
              </List.Item.Detail.Metadata>
            ) : undefined
          }
        />
      }
    />
  )
}
