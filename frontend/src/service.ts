import { IShortenerService } from "./types"

const errorMsg = (status: number, error: Error) => {
  console.log(error.message)
  if (status >= 400 && status < 500)
    return error.message
  else
    return "Ops, something went wrong on our side, try again later."
}

export const makeService = (api_url: string, fetchFn = fetch, errorMsgFn = errorMsg): IShortenerService => {
  const putURL = async (url: string) => {
    try {
      const resp = await fetchFn(api_url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      })
      if (!resp.ok) return errorMsgFn(resp.status, await resp.json())
      return resp.json()
    } catch (e) {
      return errorMsg(0, e as Error)
    }
  }

  const getURLs = async (skip = 0, limit = 10) => {
    const query = `?skip=${skip}&limit=${limit}`
    try {
      const resp = await fetchFn(api_url + query)
      if (!resp.ok) throw new Error(errorMsgFn(resp.status, await resp.json()))
      return resp.json()
    } catch (e) {
      throw new Error(errorMsg(0, e as Error))
    }
  }

  const deleteURL = async () => {
    throw new Error("not implemented")
  }

  return {
    getURLs,
    putURL,
    deleteURL
  }
}
