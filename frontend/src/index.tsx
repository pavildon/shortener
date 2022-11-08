import React  from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import reportWebVitals from "./reportWebVitals"
import { makeService } from "./service"

import config from "./config.json"
import "./w3.css"

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
)

const service = makeService(config.api_base)
const baseURL = config.base_url

root.render(
  <React.StrictMode>
    <App service={service} baseURL={baseURL} />
  </React.StrictMode >
)

reportWebVitals()
