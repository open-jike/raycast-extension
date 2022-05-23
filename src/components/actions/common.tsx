import { Action, showHUD } from '@raycast/api'

export const OpenInBrowser = (props: Action.OpenInBrowser.Props) => (
  <Action.OpenInBrowser onOpen={() => showHUD('已打开')} {...props} />
)
