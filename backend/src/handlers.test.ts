
import { describe, expect } from "@jest/globals";
import { Request, Response } from "express";
import { ShortenerURL } from "./database";
import { delete_key_chars, id_chars, makeHandlers } from "./handlers";
import mongo from "mongo-mock"
import { Collection, Db, MongoClient } from "mongodb";
import { DeleteQuery, GetIdParams, GetIdResponse, GetQuery, GetResponse, PutBody, PutResponse } from "./types";
import data from "./data.json"


const db_url = 'mongodb://localhost:27017/';

describe("handlers", () => {
  var mockData: ShortenerURL[]
  var collection: Collection<ShortenerURL>
  var db: Db
  var client: MongoClient

  beforeAll(async () => {
    client = await mongo.MongoClient.connect(db_url, {})
    db = client.db("shortener")
    collection = db.collection("urls")
    await collection.createIndex({ timestamp: -1 })
  })

  describe("get list handler", () => {
    beforeAll(async () => {
      mockData = makeMockData()
      await collection.insertMany(mockData)
    })

    afterAll(async () => await collection.deleteMany({}))

    test("gets 10 urls", async () => {
      const
        { get } = makeHandlers(async () => collection),
        req = makeMockListRequest({ skip: null, limit: null }),
        res = makeMockResponse(),
        next = jest.fn()

      await get(req, res, next)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        mockData
          .slice(0, 10)
          .map(u => { delete u.timestamp; delete u.delete_key; return u }))
    })

    test("gets 30 urls", async () => {
      const
        { get } = makeHandlers(async () => collection),
        req = makeMockListRequest({ skip: 0, limit: 30 }),
        res = makeMockResponse(),
        next = jest.fn()

      await get(req, res, next)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        mockData
          .slice(0, 30)
          .map(u => { delete u.timestamp; delete u.delete_key; return u }))
    })

    test("gets no more than 100 urls", async () => {
      const
        { get } = makeHandlers(async () => collection),
        req = makeMockListRequest({ skip: 0, limit: 130 }),
        res = makeMockResponse(),
        next = jest.fn()

      await get(req, res, next)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        mockData
          .slice(0, 100)
          .map(u => { delete u.timestamp; delete u.delete_key; return u }))
    })

    test("gets 50 urls, skiping 50", async () => {
      const
        { get } = makeHandlers(async () => collection),
        req = makeMockListRequest({ skip: 50, limit: 50 }),
        res = makeMockResponse(),
        next = jest.fn()

      await get(req, res, next)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        mockData
          .slice(50, 100)
          .map(u => { delete u.timestamp; delete u.delete_key; return u }))
    })

    test("gets 0 urls, skiping 500", async () => {
      const
        { get } = makeHandlers(async () => collection),
        req = makeMockListRequest({ skip: 500, limit: 50 }),
        res = makeMockResponse(),
        next = jest.fn()

      await get(req, res, next)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith([])
    })

    test("should fail", async () => {
      const
        { get } = makeHandlers(async () => {
          throw "Unable to connect"
        }),
        req = makeMockListRequest({ skip: 0, limit: 50 }),
        res = makeMockResponse(),
        next = jest.fn()

      await get(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith("Unable to connect")
    })

  })

  describe("get by id handler", () => {
    const
      invalid_URL_id_error: Error = {
        message: "Invalid url ID",
        name: "InvalidID"
      },
      not_found_error: Error = {
        message: "URL not found",
        name: "NotFound"
      }

    afterEach(async () => await collection.deleteMany({}))

    test("get none, invalid url id", async () => {
      const
        { getId } = makeHandlers(async () => collection),
        req = makeMockByIdRequest("invalid"),
        res = makeMockResponse(),
        next = jest.fn()

      await getId(req, res, next)

      expect(res.status).toBeCalledTimes(1)
      expect(res.status).toBeCalledWith(400)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        invalid_URL_id_error
      )
    })

    test("get none, null url id", async () => {
      const
        { getId } = makeHandlers(async () => collection),
        req = makeMockByIdRequest(null),
        res = makeMockResponse(),
        next = jest.fn()

      await getId(req, res, next)

      expect(res.status).toBeCalledTimes(1)
      expect(res.status).toBeCalledWith(400)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        invalid_URL_id_error
      )
    })

    test("get one url", async () => {
      const
        { getId } = makeHandlers(async () => collection),
        req = makeMockByIdRequest("xa8dnu12"),
        res = makeMockResponse(),
        next = jest.fn()

      await collection.insertMany(mockData)
      await getId(req, res, next)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        {
          "url": "https://761oueaz6h.com",
        }
      )
    })

    test("not found", async () => {
      const
        { getId } = makeHandlers(async () => collection),
        req = makeMockByIdRequest("noexists"),
        res = makeMockResponse(),
        next = jest.fn()

      await collection.insertMany(mockData)
      await getId(req, res, next)

      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        not_found_error)
    })
  })

  describe("put handler", () => {
    const
      invalid_URL_error: Error = {
        message: "URL null or invalid (only https protocol is valid)",
        name: "InvalidURL"
      }

    afterEach(async () => await collection.deleteMany({}))

    test("put an url", async () => {
      const
        { put } = makeHandlers(async () => collection, genDet),
        req = makeMockPutRequest({ url: "https://www.google.com" }),
        res = makeMockResponse(),
        next = jest.fn()

      await put(req, res, next)

      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        {
          _id: "abcdefgh",
          delete_key: "abcdefghijklmnopqrstuvwxyz012345"
        }
      )
    })

    test("puting a null url should fail", async () => {
      const
        az09 = "abcdefghijklmnopqrstuvwxyz0123456789",
        { put } = makeHandlers(async () => collection, n => az09.slice(0, n)),
        req = makeMockPutRequest({ url: null }),
        res = makeMockResponse(),
        next = jest.fn()

      await put(req, res, next)
      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        invalid_URL_error
      )
    })

    test("puting an url with a forbidden protocol should fail", async () => {
      const
        az09 = "abcdefghijklmnopqrstuvwxyz0123456789",
        { put } = makeHandlers(async () => collection, n => az09.slice(0, n)),
        req = makeMockPutRequest({ url: "ftp://ftp.idsoftware.com" }),
        res = makeMockResponse(),
        next = jest.fn()

      await put(req, res, next)
      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        invalid_URL_error
      )
    })
  })

  describe("delete handler", () => {
    const
      invalid_URL_id_or_del_key_error: Error = {
        name: "InvalidIDOrDelKey",
        message: "Cannot delete url, invalid _id or delete_key"
      },
      not_found_error: Error = {
        message: "URL not found",
        name: "NotFound"
      }

    afterEach(async () => await collection.deleteMany({}))

    test("delete an url that does not exists", async () => {
      const
        { del } = makeHandlers(async () => collection),
        req = makeMockDeleteRequest("01234567", "01234567890123456789012345678901"),
        res = makeMockResponse(),
        next = jest.fn()

      await del(req, res, next)

      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        not_found_error
      )
    })

    test("delete an url with an invalid id", async () => {
      const
        { del } = makeHandlers(async () => collection),
        req = makeMockDeleteRequest("012", "01234567890123456789012345678901"),
        res = makeMockResponse(),
        next = jest.fn()

      await del(req, res, next)

      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        invalid_URL_id_or_del_key_error
      )
    })

    test("delete an url with an invalid delete key", async () => {
      const
        { del } = makeHandlers(async () => collection),
        req = makeMockDeleteRequest("012", "01234567890123456789012345678901"),
        res = makeMockResponse(),
        next = jest.fn()

      await del(req, res, next)

      expect(res.status).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith(
        invalid_URL_id_or_del_key_error
      )
    })

    test("delete an url", async () => {
      const
        { del } = makeHandlers(async () => collection, genDet),
        req = makeMockDeleteRequest(genDet(id_chars), genDet(delete_key_chars)),
        res = makeMockResponse(),
        next = jest.fn()

      await collection.insertOne({
        _id: genDet(id_chars),
        url: "https://google.cl",
        delete_key: genDet(delete_key_chars),
        timestamp: new Date()
      })
      await del(req, res, next)

      expect(await collection.countDocuments()).toBe(0)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.json).toHaveBeenCalledWith({}) 
    })

  })
})

const makeMockListRequest = (query: GetQuery) => {
  return ({
    query: query
  } as unknown) as Request<{}, GetResponse, {}, GetQuery>
}

const makeMockByIdRequest = (id: string) => {
  return ({
    params: { _id: id }
  } as unknown) as Request<GetIdParams, GetIdResponse | Error, {}, {}>
}

const makeMockPutRequest = (body: PutBody) => {
  const json = jest.fn(() => { })
  const status = jest.fn(() => { return { json: json } })
  return ({
    json: json,
    status: status,
    body,
    end: () => { },
  } as unknown) as Request<{}, PutResponse | Error, {}, {}>
}

const makeMockDeleteRequest = (id: string, key: string) => {
  const json = jest.fn(() => { })
  const status = jest.fn(() => { return { json: json } })
  return ({
    json: json,
    status: status,
    params: { _id: id },
    query: { delete_key: key },
    end: () => { },
  } as unknown) as Request<GetIdParams, {} | Error, {}, DeleteQuery>

}

const makeMockResponse = () => {
  const json = jest.fn(() => { })
  const status = jest.fn(() => { return { json: json } })
  return ({
    json: json,
    status: status,
    end: () => { },
  } as unknown) as Response
}

const genDet = (n: number) => {
  const az09 = "abcdefghijklmnopqrstuvwxyz0123456789"
  return az09.slice(0, n)
}

const makeMockData = () =>
  data.map(u => { return { ...u, timestamp: new Date(u.timestamp) } })
