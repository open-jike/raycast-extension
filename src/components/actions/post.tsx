import { useMemo } from 'react'
import { Action, Toast, showToast } from '@raycast/api'
import { ApiOptions } from 'jike-sdk'
import { OpenInBrowser } from './common'

export const OpenPost: React.FC<{ type: ApiOptions.PostType; id: string }> = ({
  type,
  id,
}) => {
  const webType = useMemo(
    () => (type === ApiOptions.PostType.ORIGINAL ? 'originalPost' : 'repost'),
    [type]
  )
  return (
    <>
      <OpenInBrowser
        icon="π²"
        title="ζεΌε¨ζ (macOS App)"
        url={`jike://page.jk/${webType}/${id}`}
      />
      <OpenInBrowser
        title="ζεΌε¨ζ (PC Web η«―)"
        url={`https://web.okjike.com/${webType}/${id}`}
      />
      <OpenInBrowser
        title="ζεΌε¨ζ (ζζΊ Web η«―)"
        url={`https://m.okjike.com/${type}/${id}`}
      />
    </>
  )
}

export const LikePost: React.FC<{
  onAction: () => Promise<boolean> | boolean
}> = ({ onAction }) => {
  const action = async () => {
    showToast({
      title: 'ζδ½δΈ­',
      style: Toast.Style.Animated,
    })
    if (!(await onAction())) return
    showToast({
      title: 'ηΉθ΅ζε',
      style: Toast.Style.Success,
    })
  }
  return (
    <Action
      icon="π"
      title="ηΉθ΅"
      shortcut={{ modifiers: ['cmd'], key: 'l' }}
      onAction={action}
    />
  )
}

export const UnlikePost: React.FC<{
  onAction: () => Promise<boolean> | boolean
}> = ({ onAction }) => {
  const action = async () => {
    showToast({
      title: 'ζδ½δΈ­',
      style: Toast.Style.Animated,
    })
    if (!(await onAction())) return
    showToast({
      title: 'εζΆηΉθ΅ζε',
      style: Toast.Style.Success,
    })
  }
  return (
    <Action
      icon="π"
      title="εζΆηΉθ΅"
      shortcut={{ modifiers: ['cmd', 'opt'], key: 'l' }}
      onAction={action}
    />
  )
}
