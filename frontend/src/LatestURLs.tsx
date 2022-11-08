import { FC, useEffect, useState } from "react"
import {URLList} from "./types"

type ListParams = {
  perPage: number,
  error: string | null,
  urls: URLList | null,
  getURLsFn: (skip: number) => void
  baseURL: string
}

export const LatestURLs: FC<ListParams> = ({ perPage, error, urls, getURLsFn, baseURL }) => {

  const [skip, setSkip] = useState<number>(0)

  useEffect(() => {
    getURLsFn(skip)
  }, [skip])

  return (
    <div className="w3-container w3-panel">
      <h4>latests URLs</h4>
      {!error ? (<>
        {urls ? (<>
          <div className="w3-left-align w3-monospace">
            <ol start={skip + 1}
              style={{
                minHeight: "315px",
                listStyleType: "decimal-leading-zero",
                padding: "0px"
              }}>
              {urls.items.map((u, i) => (
                <li key={i}
                  style={{
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #ddd",
                    padding: "4px",
                    listStylePosition: "inside",
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                  }}>
                  <a href={u.url}>{baseURL}/{u._id}</a>
                  <i className="w3-light-gray w3-margin">{u.url}</i>
                </li>
              ))}
            </ol>
          </div>
          <button
            data-testid="prev"
            className="w3-btn"
            style={{ visibility: (skip <= 0 ? "hidden" : "visible") }}
            onClick={() => setSkip(skip - perPage)}>← prev</button>
          <button
            data-testid="next"
            className="w3-btn"
            style={{ visibility: (((skip + perPage) > urls.total) ? "hidden" : "visible") }}
            onClick={() => setSkip(skip + perPage)}>next →</button>
        </>) : (<i>loading... </i>)
        }
      </>) : (<div className="w3-panel w3-pale-red">{error}</div>)}
    </div>
  )
}
