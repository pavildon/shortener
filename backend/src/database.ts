import { Db, MongoClient } from "mongodb";

// TODO init script (mongo docker)
const conn_str =
  process.env["SHORTENER_CONN_STRING"]
  || "mongodb://shortener:shortenerpass@10.6.51.83:27017"
const db_name =
  process.env["SHORTENER_DB_NAME"]
  || "shortener"
const collection_name =
  process.env["SHORTENER_COLLECTION_NAME"]
  || "urls"

export type ShortenerURL = {
  _id: string,
  url: string,
  delete_key: string,
  timestamp: Date,
}

var db: Db | null = null;
export const getURLs = async () => {
  if (!db) {
    const client: MongoClient = new MongoClient(conn_str, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    })
    await client.connect();
    db = client.db(db_name)
  }

  return db.collection<ShortenerURL>(collection_name)
}

