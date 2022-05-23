import { Action, ActionPanel, Icon, showHUD } from '@raycast/api'
import { Login } from '../views/login'

export const openProfile = (username: string) => [
  <Action.OpenInBrowser
    key="open"
    title="打开用户页 (macOS App)"
    icon="📲"
    url={`jike://page.jk/user/${username}`}
    onOpen={() => showHUD('已打开')}
  />,
  <ActionPanel.Submenu
    key="openWith"
    title="打开用户页 (其他客户端)"
    icon={Icon.Window}
  >
    <Action.OpenInBrowser
      title="PC Web 端"
      url={`https://web.okjike.com/u/${username}`}
      onOpen={() => showHUD('已打开')}
    />
    <Action.OpenInBrowser
      title="手机 Web 端"
      url={`https://m.okjike.com/users/${username}`}
      onOpen={() => showHUD('已打开')}
    />
  </ActionPanel.Submenu>,
]

export const loginNewUser = (
  <Action.Push
    key="userUser"
    title="登录新用户"
    target={<Login />}
    icon={Icon.Plus}
    shortcut={{ modifiers: ['cmd'], key: 'n' }}
  />
)
