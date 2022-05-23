import {
  Action,
  ActionPanel,
  Form,
  List,
  Toast,
  showToast,
  useNavigation,
} from '@raycast/api'
import { limit } from 'jike-sdk'
import { useEffect, useMemo, useState } from 'react'
import { UserSelect } from '../components/user-select'
import { useUser, useUsers } from '../hooks/user'
import { handleError } from '../utils/errors'
import { OpenProfile } from '../components/actions/user'
import { NoUser } from './no-user'
import type { Entity, JikePostWithDetail } from 'jike-sdk'

export interface LikeTopForm {
  userId: string
  topCount: string
  postCount: string
}

export function LikeTop() {
  const { push } = useNavigation()
  const { noUser } = useUsers()

  const onSubmit = (form: LikeTopForm) => push(<LikeTopResult {...form} />)

  return !noUser ? (
    <Form
      navigationTitle="点赞排行榜"
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <UserSelect />
      <Form.TextField id="topCount" title="排名数量" defaultValue="50" />
      <Form.TextField id="postCount" title="动态数量" defaultValue="0" />
      <Form.Description text="统计多少条最近发布的动态，0 为所有动态" />
    </Form>
  ) : (
    <NoUser />
  )
}

function LikeTopResult({ userId, topCount, postCount }: LikeTopForm) {
  interface LikeStat {
    user: Entity.User
    count: number
  }
  type UserMap = Record<string, LikeStat>

  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<JikePostWithDetail[]>([])
  const [likeStat, setLikeStat] = useState<LikeStat[]>([])
  const { client } = useUser(userId)

  const countRanking = useMemo(
    () =>
      likeStat
        ? [...new Set(Object.values(likeStat).map(({ count }) => count))].sort(
            (a, b) => b - a
          )
        : [],
    [likeStat]
  )
  const getRanking = (count: number) => countRanking.indexOf(count) + 1

  const fetchResult = async (ab: AbortController) => {
    if (!client) return

    setLoading(true)
    let toast = await showToast({
      title: '正在获取',
      message: '正在获取动态',
      style: Toast.Style.Animated,
    })
    try {
      const posts = await client.getSelf().queryPersonalUpdate({
        limit:
          +postCount > 0 ? limit.limitMaxCount(+postCount) : limit.limitNone(),
      })
      setPosts(posts)

      const userMap: UserMap = {}
      for (const [i, post] of posts.entries()) {
        if (ab.signal.aborted) {
          toast = await showToast({
            title: '已取消',
            style: Toast.Style.Failure,
          })
          return
        }
        toast.message = `正在获取点赞数据 (${i + 1} / ${posts.length})`

        const users = await post.listLikedUsers()
        for (const user of users) {
          const id = user.id
          if (!userMap[id]) userMap[id] = { user, count: 1 }
          else userMap[id].count++
        }
      }
      setLikeStat(
        Object.values(userMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, +topCount)
      )
      toast.hide()
    } catch (err) {
      toast.hide()
      handleError(err)
      return
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ab = new AbortController()
    fetchResult(ab)
    return () => ab.abort()
  }, [client, postCount, topCount])

  const renderRanking = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: '🥇' }
      case 2:
        return { icon: '🥈' }
      case 3:
        return { icon: '🥉' }
      default:
        return { text: `#${rank}` }
    }
  }
  return (
    <List isLoading={loading}>
      {likeStat.map(({ user, count }) => (
        <List.Item
          key={user.id}
          icon={user.avatarImage.thumbnailUrl}
          title={user.screenName}
          subtitle={`点赞 ${count} 次，${((count / posts.length) * 100).toFixed(
            2
          )}%`}
          accessories={[renderRanking(getRanking(count))]}
          actions={
            <ActionPanel>
              <OpenProfile username={user.username} />
              <Action.CopyToClipboard
                title="复制昵称"
                content={user.screenName}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
