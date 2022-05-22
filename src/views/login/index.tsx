import { popToRoot, useNavigation } from '@raycast/api'
import { JikeClient } from 'jike-sdk'
import { useMemo } from 'react'
import { updateConfig } from '../../utils/config'
import { isSameUser } from '../../utils/user'
import { handleError } from '../../utils/errors'
import { FormEndpointInfo } from './form-endpoint-info'
import { FormAuth } from './form-auth'
import type { AuthForm } from './form-auth'
import type { EndpointInfo } from './form-endpoint-info'

export function Login() {
  const { push } = useNavigation()

  return (
    <FormEndpointInfo onSubmit={(info) => push(<Auth endpointInfo={info} />)} />
  )
}

function Auth({ endpointInfo }: { endpointInfo: EndpointInfo }) {
  const client = useMemo(() => new JikeClient(endpointInfo), [endpointInfo])

  const onLogin = async ({
    areaCode,
    mobile,
    loginMethod,
    password,
    smsCode,
  }: AuthForm) => {
    try {
      if (loginMethod === 'password') {
        await client.loginWithPassword(areaCode, mobile, password)
      } else {
        await client.loginWithSmsCode(areaCode, mobile, smsCode)
      }

      const user = await client.toJSON()

      // Save
      await updateConfig(async (cfg) => {
        const index = cfg.users.findIndex((_auth) => isSameUser(user, _auth))
        if (index > -1) {
          cfg.users[index] = user
        } else {
          cfg.users.push(user)
        }
      })

      popToRoot()
      return user.screenName
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <FormAuth
      onSendSMS={async ({ areaCode, mobile }) => {
        try {
          await client.sendSmsCode(areaCode, mobile)
        } catch (err) {
          handleError(err)
          return
        }
      }}
      onLogin={onLogin}
    />
  )
}
