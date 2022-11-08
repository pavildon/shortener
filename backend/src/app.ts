import express, { NextFunction, Request, Response } from "express"
import cors from "cors"

import { getURLs } from "./database"
import { makeHandlers } from "./handlers"

const handlers = makeHandlers(getURLs)

const port = process.env["SHORTENER_PORT"] || 3001
const application: express.Application = express()

application.use(cors())
application.use(express.json())
application.get("/", handlers.get)
application.get("/:_id", handlers.getId)
application.put("/", handlers.put)
application.delete("/:_id", handlers.del)

// Error handler , TODO handle errors more specfically
application.use(
  (error: Error, _r: Request, response: Response, _n: NextFunction) => {
    console.error("unhandled exception:", error)
    response
      .status(500)
      .json(error)
  })

application.listen(port, () => {
  console.log("Shortener running")
})
