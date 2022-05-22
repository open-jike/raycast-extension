import { Action, ActionPanel, Form } from '@raycast/api'

export interface EndpointInfo {
  userAgent: string
  bundleId: string
  appVersion: string
  endpointUrl: string
  buildNo: string
  endpointId: string
}

export function FormEndpointInfo({
  onSubmit,
}: {
  onSubmit: (info: EndpointInfo) => void
}) {
  return (
    <Form
      navigationTitle="配置 Endpoint 信息"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={onSubmit} />
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
