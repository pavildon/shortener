import express, { NextFunction, Request, Response } from "express"
import { Db, MongoClient } from "mongodb"

const app: express.Application = express()
const port = 3000

var db: Db = null;

const getDb = async () => {
  // TODO ENV
  const conn_str = "mongodb://shortener:shortenerpass@10.6.51.83:27017"
  const db_name = "shortener"

  if (!db) {
    const client: MongoClient = new MongoClient(conn_str, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    })
    await client.connect();
    db = client.db(db_name)
  }

  return db
}

app.use(express.json())


type NewURL = {
  url?: string
}

type URL = {
  _id: string,
  url: string,
  timestamp: Date,
}

const ID_CHARS = 8

const genId = () => {
  const azAZ = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  var id = ""

  for (var i = 0; i < ID_CHARS; i++) {
    id = id.concat(azAZ.at(Math.floor(Math.random() * azAZ.length)));
  }

  return id;
}

app.put<null, { _id: string }, NewURL>
  ("/", async (req, res, next) => {
    // TODO validate
    const new_url = req.body as NewURL

    getDb()
      .then(db =>
        db.collection<URL>("urls").insertOne(
          {
            _id: genId(),
            url: new_url.url,
            timestamp: new Date()
          }
        ))
      .then(resp => {
        res.json({ _id: resp.insertedId })
      })
      .catch(error => {
        if (error.code && error.code == 11000)
          findByURL()
        else
          next(error)
      })

    // TODO init script (mongo docker)
    const findByURL = () =>
      db.collection<URL>("urls").findOne({ url: new_url.url })
        .then(resp => res.json({ _id: resp._id }))
        .catch(error => next(error))

  })

app.get("/:id", (req, res, next) => {
  const _id = req?.params?.id

  getDb()
    .then(db => db.collection("urls").findOne(
      { _id }, { projection: { _id: 0, url: 1 } }))
    .then(resp => res.json(resp))
    .catch(error => {
      db = null
      next(error)
    })
})

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  db = null
  res.status(422)
  console.log(error)
  const dev_info = error
  res.json({ error: "err", dev_info })
})

app.listen(port, () => {
  // TODO setup db
})
