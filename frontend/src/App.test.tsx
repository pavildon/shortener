import { act, render } from "@testing-library/react"
import { App } from "./App"
import { IShortenerService } from "./types"

it("should show loading...", async () => {
    const service: IShortenerService = {
    putURL: () => { throw "Not implemented" },
    getURLs: jest.fn(async () => {
      return {
        total: 1,
        items: [{ _id: "abcdefjh", url: "https:www.google.com" }]
      }
    }),
    deleteURL: () => { throw "Not implemented" }
  }

  await act(async () => {
    render(<App
      service={service} baseURL="https://pbid.io/" />)
  })

  expect(service.getURLs).toBeCalledTimes(1)
  expect(service.getURLs).toBeCalledWith(0, 10)

})

