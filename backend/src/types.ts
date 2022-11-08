import { NextFunction, Request, Response } from "express"
import { Collection } from "mongodb"

import { ShortenerURL } from "./database"

export type Handler<P = {}, ResB = {}, ReqB = {}, Q = {}> =
  (req: Request<P, ResB, ReqB, Q>, res: Response<ResB>, next: NextFunction) => Promise<void>
export type GetURLsFn = () => Promise<Collection<ShortenerURL>>

export type GetQuery = { skip: number, limit: number }
export type GetResponse = { total: number, items: { _id: string, url: string }[] }
export type GetHandler = Handler<{}, GetResponse, {}, GetQuery>

export type GetIdParams = { _id: string }
export type GetIdResponse = { url: string }
export type GetIdHandler = Handler<GetIdParams, GetIdResponse | Error>

export type PutResponse = { _id: string, delete_key: string }
export type PutBody = { url?: string }
export type PutHandler = Handler<{}, PutResponse | Error, PutBody>

export type DeleteQuery = { delete_key: string }
export type DeleteHandler = Handler<GetIdParams, {}, {}, DeleteQuery>

export type Handlers = {
  get: GetHandler,
  getId: GetIdHandler,
  put: PutHandler,
  // name clash keyword
  del: DeleteHandler
}

