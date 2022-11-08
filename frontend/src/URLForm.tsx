import { FC, useState, EventHandler, FormEvent } from "react"
import { validation_invalid_url, validation_only_https } from "./strings"
import { PutFn } from "./types"

export const URLForm: FC<{ putFn: PutFn }> = ({ putFn }) => {
  const [url, setURL] = useState<string>("")
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErr, setValidationErr] = useState<string | null>(null)

  const submit: EventHandler<FormEvent> = async event => {
    event.preventDefault()
    if (url?.length == 0) {
      setValidationErr("URL is empty!")
      return
    }

    try {
      const urlO = new URL(url)
      if (urlO.protocol !== "https:") {
        setValidationErr(validation_only_https)
        return
      }
    } catch {
      setValidationErr(validation_invalid_url)
      return
    }

    setSending(true)
    const resp = await putFn(url)
    setSending(false)
    if (typeof resp === "string") {
      setError(resp)
    } else {
      setURL("")
      setError(null)
    }
  }
  const reset = () => {
    setValidationErr(null)
    setError(null)
  }

  return (
    <div className="w3-container w3-panel">
      <form onSubmit={submit}>
        <input
          type="url" name="url" id="url"
          className="w3-input "
          placeholder="https://example.com/"
          value={url}
          disabled={sending}
          onChange={e => { reset(); setURL(e.target.value) }}
          data-testid="url-input" />
        {error && (<div data-testid="error" className="w3-panel w3-pale-red">{error}</div>)}
        {validationErr && (
          <div data-testid="validation" className="w3-panel w3-pale-yellow">{validationErr}</div>)}
        <input type="submit"
          className="w3-btn w3-blue w3-margin-top"
          disabled={sending}
          value="make it short!" />
      </form >
    </div >
  )
}
