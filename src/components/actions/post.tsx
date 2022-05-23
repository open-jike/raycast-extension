import { useMemo } from 'react'
import { Action, Toast, showToast } from '@raycast/api'
import { ApiOptions } from 'jike-sdk'
import { OpenInBrowser } from './common'

export const OpenPost = ({
  type,
  id,
}: {
  type: ApiOptions.PostType
  id: string
}) => {
  const webType = useMemo(
    () => (type === ApiOptions.PostType.ORIGINAL ? 'originalPost' : 'repost'),
    [type]
  )
  return (
    <>
      <OpenInBrowser
        icon="📲"
        title="打开动态 (macOS App)"
        url={`jike://page.jk/${webType}/${id}`}
      />
      <OpenInBrowser
        title="打开动态 (PC Web 端)"
        url={`https://web.okjike.com/${webType}/${id}`}
      />
      <OpenInBrowser
        title="打开动态 (手机 Web 端)"
        url={`https://m.okjike.com/${type}/${id}`}
      />
    </>
  )
}

export const LikePost = ({
  onAction,
}: {
  onAction: () => Promise<boolean> | boolean
}) => {
  const action = async () => {
    showToast({
      title: '操作中',
      style: Toast.Style.Animated,
    })
    if (!(await onAction())) return
    showToast({
      title: '点赞成功',
      style: Toast.Style.Success,
    })
  }
  return <Action icon="👍" title="点赞" onAction={action} />
}

export const UnlikePost = ({
  onAction,
}: {
  onAction: () => Promise<boolean> | boolean
}) => {
  const action = async () => {
    showToast({
      title: '操作中',
      style: Toast.Style.Animated,
    })
    if (!(await onAction())) return
    showToast({
      title: '取消点赞成功',
      style: Toast.Style.Success,
    })
  }
  return <Action icon="💔" title="取消点赞" onAction={action} />
}
