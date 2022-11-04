import express, { Request } from "express"
import { Db, MongoClient } from "mongodb"

type PequeURL = {
  _id: string,
  url: string,
  timestamp: number,
}

const app: express.Application = express()
const port = 3000

const getDb = async () => {
  // TODO ENV
  const conn_str = "mongodb://shortener:shortenerpass@10.6.51.83:27017"
  const db_name = "peque"

  const client: MongoClient = new MongoClient(conn_str)
  await client.connect();
  const db: Db = client.db(db_name)

  return db
}

app.use(express.json())

app.get("/", async (_req, res) => {
  const db = await getDb()
  const urls = db.collection<PequeURL>("urls")
  const doc = await urls.insertOne({ _id: "aBcD321K", url: "https://news.ycombinator.com", timestamp: 1000 })
  res.send({doc})
})

app.get("/:id", async (req: Request, res) => {
  const id = req?.params?.id
  const db = await getDb()
  const urls = db.collection("urls")

  const result = await urls.findOne({_id: id});

  res.send({result})
})

app.listen(port, () => {
  console.log("Ready!")
})
