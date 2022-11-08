import { FC, useCallback, useState } from "react"
import "./App.css"
import { LatestURLs } from "./LatestURLs"
import { makeService } from "./service"
import { URLList } from "./types"
import { URLForm } from "./URLForm"

const services = makeService("http://localhost:3001")
const baseURL = "https://pbid.io"

export const App: FC = () => {

  const [urls, setURLs] = useState<URLList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const perPage = 10

  const put = useCallback(async (url: string) => {
    const result = await services.putURL(url)

    if (typeof result !== "string") {
      await get(0)
    }

    return result
  }, [])

  const get = useCallback(async (skip: number) => {
    setURLs(null)
    const response = await services.getURLs(skip, perPage)
    if (typeof response === "string") {
      setError(response)
      return
    }
    setURLs(response)
  }, [])

  return (
    <div className="w3-display-container">
      <div
        className="w3-display-topmiddle w3-threequarter">
        <div className="w3-content w3-row-padding" >
          <h1 className="w3-center">Simple Shortener!</h1>
          <div className="w3-cell-row">
            <div className="w3-panel w3-padding w3-card w3-center"
              style={{ maxWidth: "720px", margin: "auto" }} >
              <URLForm putFn={put} />
            </div>
          </div>
          <div className="w3-cell-row">
            <div className="w3-panel w3-padding w3-center"
              style={{ maxWidth: "720px", margin: "auto" }} >
              <LatestURLs
                perPage={perPage}
                error={error}
                urls={urls}
                baseURL={baseURL}
                getURLsFn={get} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

