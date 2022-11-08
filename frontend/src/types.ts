export type URLInfo = {
  _id: string,
  url: string,
}

export type URLList = {
  total: number,
  items: URLInfo[]
}

export type PutResponse = {
  _id: string,
}

export type ErrorMsg = string

export type PutFn = (url: string) => Promise<PutResponse | ErrorMsg>
export type GetURLsFn = (skip: number, limit: number) => Promise<URLList | ErrorMsg>
export type DeleteFn = (_id: string, key: string) => Promise<void | ErrorMsg>

export type IShortenerService = {
  getURLs: GetURLsFn,
  putURL: PutFn,
  deleteURL: DeleteFn,
}
