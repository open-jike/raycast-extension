import { Blob } from 'buffer'
import { File, FormData, Headers, Request, Response, fetch } from 'undici'

export const useInit = (Comp: React.FC) => {
  const globals: any = globalThis
  // Fetch
  if (!globals.fetch) {
    globals.fetch = fetch
    globals.Headers = Headers
    globals.Request = Request
    globals.Response = Response
  }

  if (!globals.FormData) {
    globals.File = File
    globals.Blob = Blob
    globals.FormData = FormData
  }

  return Comp
}
