use("shortener")
db.getCollection("urls").createIndex({timestamp: -1})
db.getCollection("urls").createIndex( { delete_key: "hashed" } )
