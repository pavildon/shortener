import React, {
  EventHandler,
  FC,
  FormEvent,
  useEffect,
  useState,
} from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import './w3.css';

// TODO favicon

type URLInfo = {
  _id: string,
  url: string,
}

type URLList = {
  total: number,
  items: URLInfo[]
}

type PutResponse = {
  _id: string,
}

type PutFn = (url: string) => Promise<PutResponse>
type GetURLsFn = (skip: number, limit: number) => Promise<URLList>
type DeleteFn = (_id: string, key: string) => Promise<void>

type IShortenerService = {
  getURLs: GetURLsFn,
  putURL: PutFn,
  deleteURL: DeleteFn,
}

const errorMsg = (status: number, error: Error) => {
  // TODO switch for error names from backend
  console.log(status)
  if (status >= 400 && status < 500)
    return error.message
  else
    return "Ops, something went wrong on our side, try again later."
}

const makeService = (api_url: string, fetchFn = fetch): IShortenerService => {
  const putURL = async (url: string) => {
    try {
      const resp = await fetchFn(api_url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      })
      if (!resp.ok) throw new Error(errorMsg(resp.status, await resp.json()))
      return resp.json()
    } catch (e) {
      throw new Error(errorMsg(0, e as Error))
    }
  }

  const getURLs = async (skip: number = 0, limit: number = 10) => {
    const query = `?skip=${skip}&limit=${limit}`
    try {
      const resp = await fetchFn(api_url + query)
      if (!resp.ok) throw new Error(errorMsg(resp.status, await resp.json()))
      return resp.json()
    } catch (e) {
      throw new Error(errorMsg(0, e as Error))
    }
  }

  const deleteURL = async (_id: string, _key: string) => {
    throw new Error("not implemented")
  }

  return {
    getURLs,
    putURL,
    deleteURL
  }
}

export const Form: FC<{ putFn: PutFn }> = ({ putFn }) => {
  const [url, setURL] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const submit: EventHandler<FormEvent> = async event => {
    event.preventDefault()
    try {
      await putFn(url)
      setURL("")
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="w3-container w3-panel">
      <form onSubmit={submit}>
        <input
          type="url" name="url" id="url"
          className="w3-input "
          required
          placeholder="https://example.com/"
          value={url}
          onChange={e => { setError(null); setURL(e.target.value) }} />
        {error && (<div className="w3-panel w3-pale-red">{error}</div>)}
        <input type="submit"
          className="w3-btn w3-blue w3-margin-top"
          value="make it short!" />
      </form >
    </div >
  )
}

const List: FC<{ getURLsFn: GetURLsFn }> = ({ getURLsFn }) => {
  const [urls, setURLs] = useState<URLInfo[] | null>()
  const [total, setTotal] = useState<number>(0)
  const [skip, setSkip] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const perPage = 10

  useEffect(() => {
    setURLs(null)
    getURLsFn(skip, perPage)
      .then(list => { setURLs(list.items); setTotal(list.total) })
      .catch(e => setError((e as Error).message))
  }, [getURLsFn, skip])

  return (
    <div className="w3-container w3-panel">
      {!error ? (<>
        <h4>latests URLs</h4>
        {urls ? (<>
          <div className="w3-left-align">
            <ol start={skip + 1}
              style={{
                width: "100%",
                minHeight: "315px",
                listStyleType: "decimal-leading-zero"
              }}>
              {urls.map((u, i) => (
                <li key={i}
                  style={{ borderBottom: "1px solid #ddd", padding: "4px" }}>
                  <a href={u.url}>https://scene.cl/{u._id}</a>
                </li>
              ))}
            </ol>
          </div>
          <button
            className="w3-btn"
            style={{ visibility: (skip <= 0 ? "hidden" : "visible") }}
            onClick={() => setSkip(skip - perPage)}>← prev</button>
          <button
            className="w3-btn"
            style={{ visibility: (((skip + perPage) >= total) ? "hidden" : "visible") }}
            onClick={() => setSkip(skip + perPage)}>next →</button>
        </>) : (<i> loading... </i>)
        }
      </>) : (<div className="w3-panel w3-pale-red">{error}</div>)}
    </div>
  )
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

const services = makeService("http://localhost:3001")

root.render(
  <React.StrictMode>
    <div className="w3-display-container">
      <div
        className="w3-display-topmiddle w3-threequarter">
        <div className="w3-content w3-row-padding" >
          <h1 className="w3-center">Simple Shortener!</h1>
          <div className="w3-cell-row">
            <div className="w3-panel w3-padding w3-card w3-center"
              style={{ maxWidth: "500px", margin: "auto" }} >
              <Form putFn={services.putURL} />
            </div>
          </div>
          <div className="w3-cell-row">
            <div className="w3-panel w3-padding w3-center"
              style={{ maxWidth: "500px", margin: "auto" }} >
              <List getURLsFn={services.getURLs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </React.StrictMode >
)

reportWebVitals()
