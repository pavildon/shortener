import { it, expect } from "@jest/globals";
import { makeService } from "./service";

it("should call put", () => {
  const fetchFn = jest.fn()
  const service = makeService("https://localhost", fetchFn)

  service.putURL("https://google.com")

  expect(fetchFn).toBeCalledTimes(1)
  expect(fetchFn).toBeCalledWith("https://localhost",
    {
      body: '{"url":"https://google.com"}',
      headers: { "Content-Type": "application/json" },
      method: "PUT"
    })

})

it("should call get", () => {
  const fetchFn = jest.fn()
  const service = makeService("https://localhost", fetchFn)

  service.getURLs(0, 100)

  expect(fetchFn).toBeCalledTimes(1)
  expect(fetchFn).toBeCalledWith("https://localhost?skip=0&limit=100")
})

// TODO fail tests
