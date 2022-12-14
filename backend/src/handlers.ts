import {
  Handlers,
  GetURLsFn,
  GetHandler,
  GetIdHandler,
  PutHandler,
  PutBody,
  DeleteHandler
} from "./types"

// note: I had to make the handlers async for jest assetions to work properly
export const makeHandlers = (getURLs: GetURLsFn, gen = genRnd): Handlers => {
  const get: GetHandler = async (request, response, next) => {
    const
      skip: number = +request.query.skip || 0,
      limit: number = Math.min(+(request.query.limit || 10), 100)

    try {
      const urls = await getURLs()
      const items = urls
        .find({}, { projection: { _id: 1, url: 1 } })
        .skip(skip)
        .limit(limit)
        .sort({ timestamp: -1 })
        .toArray()
      const total = urls.countDocuments()
      response.json({ total: await total, items: await items })
    } catch (error) {
      next(error as Error)
    }
  }

  const getId: GetIdHandler = async (request, response, next) => {
    const _id = request?.params?._id
    if (_id?.length != id_chars) {
      response
        .status(400)
        .json(invalid_url_id_error)
      return
    }

    try {
      const urls = await getURLs()
      const resp = await urls.findOne({ _id }, { projection: { _id: 0, url: 1 } })
      if (!resp)
        response
          .status(404)
          .json(not_found_error)
      else
        response.json(resp)
    } catch (error) {
      next(error as Error)
    }
  }

  const put: PutHandler = async (request, response, next) => {
    const new_url = request.body as PutBody

    if (!validURL(new_url.url)) {
      response
        .status(400)
        .json(invalid_url_error)
      return
    }

    try {
      const
        _id = gen(id_chars),
        delete_key = gen(delete_key_chars)

      const urls = await getURLs()
      const resp = await urls.insertOne({
        _id,
        delete_key,
        url: new_url.url,
        timestamp: new Date()
      })

      response.json({
        _id: resp.insertedId,
        delete_key
      })
    } catch (error) {
      next(error)
    }
  }

  const del: DeleteHandler = async (request, response, next) => {
    const
      _id = request?.params?._id,
      delete_key = request?.query?.delete_key

    if (_id?.length != id_chars || delete_key?.length != delete_key_chars) {
      response
        .status(400)
        .json(invalid_id_or_key_error)
      return
    }

    await getURLs()
      .then(urls =>
        urls
          .deleteOne({ _id, delete_key }))
      .then(db_resp => {
        if (db_resp.deletedCount != 1) {
          response
            .status(404)
            .json(not_found_error)
          return
        }

        response.json({})
      })
      .catch(error => next(error))
  }

  return {
    get,
    getId,
    put,
    del,
  }
}

export const id_chars = 8
export const delete_key_chars = 32

export const not_found_error: Error = {
  name: "NotFound",
  message: "URL not found"
}
export const invalid_id_or_key_error: Error = {
  name: "InvalidIDOrDelKey",
  message: "Cannot delete url, invalid _id or delete_key"
}
export const invalid_url_id_error: Error = {
  name: "InvalidID",
  message: "Invalid url ID"
}
export const invalid_url_error: Error = {
  message: "URL null or invalid (only https protocol is valid)",
  name: "InvalidURL"
}

export const genRnd = (length: number) => {
  const az09 = "abcdefghijklmnopqrstuvwxyz0123456789"
  var id = ""
  for (var i = 0; i < length; i++) {
    id = id.concat(az09.at(Math.floor(Math.random() * az09.length)));
  }
  return id;
}

const validURL = (url_str: string): boolean => {
  const protocols = ["https:"]
  if(url_str?.length > 2048) return false
  try {
    const url = new URL(url_str)
    if (protocols.includes(url.protocol))
      return true
  } catch (e) {/* notin */ }
  return false
}
