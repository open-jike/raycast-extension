import { Toast, showToast } from '@raycast/api'
import { RequestFailureError } from 'jike-sdk'

export const handleError = async (err: any) => {
  if (err instanceof RequestFailureError) {
    await showToast({
      title: err.message,
      style: Toast.Style.Failure,
    })
  } else throw err
}
