import {
  Action,
  ActionPanel,
  Form,
  Toast,
  popToRoot,
  showToast,
  useNavigation,
} from '@raycast/api'
import { useState } from 'react'
import { JikeClient } from 'jike-sdk'
import { updateConfig } from './utils/config'
import { isSameUser } from './utils/user'
import { handleError } from './utils/errors'

interface EndpointInfo {
  userAgent: string
  bundleId: string
  appVersion: string
  endpointUrl: string
  buildNo: string
  endpointId: string
}

export default function Command() {
  const { push } = useNavigation()

  const login = (info: EndpointInfo) => {
    push(<Authentication endpointInfo={info} />)
  }

  return (
    <Form
      navigationTitle="配置 Endpoint 信息"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={login} />
        </ActionPanel>
      }
    >
      <Form.Description
        title="Tips"
        text="自行在 GitHub 搜索「jike endpoint」探索配置"
      />

      <Form.TextField
        id="endpointId"
        title="Endpoint ID"
        storeValue
        placeholder="jike"
        autoFocus
      />

      <Form.TextField id="endpointUrl" title="Endpoint URL" storeValue />
      <Form.TextField id="bundleId" title="Bundle ID" storeValue />
      <Form.TextField id="appVersion" title="APP Version" storeValue />
      <Form.TextField id="buildNo" title="Build Number" storeValue />
      <Form.TextField id="userAgent" title="User Agent" storeValue />
    </Form>
  )
}

interface AuthenticationProps {
  endpointInfo: EndpointInfo
}

interface AuthenticationForm {
  areaCode: string
  mobile: string
  password: string
  smsCode: string
}

function Authentication(props: AuthenticationProps) {
  const [loginMethod, setLoginMethod] = useState<'password' | 'smsCode'>(
    'password'
  )
  const [isSentSMS, setIsSentSMS] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const buildClient = () => new JikeClient(props.endpointInfo)

  const sendSMS = async (form: AuthenticationForm) => {
    setIsLoading(true)

    try {
      await buildClient().sendSmsCode(form.areaCode, form.mobile)
    } catch (err) {
      handleError(err)
      return
    } finally {
      setIsLoading(false)
    }

    setIsSentSMS(true)
    await showToast({
      title: '短信已发送',
      style: Toast.Style.Success,
    })
  }

  const login = async (form: AuthenticationForm) => {
    setIsLoading(true)

    const client = buildClient()
    try {
      // TODO: validate form
      if (loginMethod === 'password') {
        await client.loginWithPassword(
          form.areaCode,
          form.mobile,
          form.password
        )
      } else {
        await client.loginWithSmsCode(form.areaCode, form.mobile, form.smsCode)
      }
    } catch (err) {
      handleError(err)
      return
    } finally {
      setIsLoading(false)
    }

    await showToast({
      title: '登录成功',
      message: `Hi, ${await client.getSelf().getScreenName()}`,
      style: Toast.Style.Success,
    })

    // Save
    await updateConfig(async (cfg) => {
      const user = await client.toJSON()
      const index = cfg.users.findIndex((_auth) => isSameUser(user, _auth))
      if (index > -1) {
        cfg.users[index] = user
      } else {
        cfg.users.push(user)
      }
    })

    popToRoot()
  }

  const actions = [
    <Action.SubmitForm key="login" title="Login" onSubmit={login} />,
  ]
  if (loginMethod === 'smsCode') {
    actions[isSentSMS ? 'push' : 'unshift'](
      <Action.SubmitForm
        key="sendSMS"
        title={isSentSMS ? 'Resend SMS' : 'Send SMS'}
        onSubmit={sendSMS}
      />
    )
  }
  return (
    <Form
      navigationTitle="认证信息"
      isLoading={isLoading}
      actions={<ActionPanel>{...actions}</ActionPanel>}
    >
      <Form.TextField
        id="areaCode"
        title="区号"
        placeholder="86"
        defaultValue="86"
      />
      <Form.TextField id="mobile" title="手机号" autoFocus />

      <Form.Separator />

      <Form.Dropdown
        id="loginMethod"
        title="认证方式"
        value={loginMethod}
        onChange={setLoginMethod as any}
      >
        <Form.Dropdown.Item value="password" title="登录密码" icon="🔑" />
        <Form.Dropdown.Item value="smsCode" title="短信验证码" icon="📲" />
      </Form.Dropdown>

      {loginMethod === 'password' && (
        <Form.PasswordField id="password" title="密码" />
      )}
      {loginMethod === 'smsCode' && (
        <Form.TextField id="smsCode" title="短信验证码" />
      )}
    </Form>
  )
}
