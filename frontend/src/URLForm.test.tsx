import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { validation_empty_url, validation_only_https } from './strings'
import { URLForm } from './URLForm'

// Note: html5 form validation fails to trigger
// see: https://github.com/jsdom/jsdom/issues/2898
// so i had to make the validation in 'onSubmit'
it("should not call putFn if url is empty", async () => {
  const putFn = jest.fn(
    async (_url: string) => { return { _id: "abcdefgh" } })

  render(<URLForm putFn={putFn} />)
  fireEvent.click(screen.getByText(/short/i))

  const validation = screen.getByTestId("validation")
  expect(validation.innerHTML).toBe(validation_empty_url)
  expect(putFn).toBeCalledTimes(0)
})

it("should not allow url protocol other than https", async () => {
  const putFn = jest.fn(
    async (_url: string) => { return { _id: "abcdefgh" } })

  render(<URLForm putFn={putFn} />)
  fireEvent.change(screen.getByTestId("url-input"), {
    target: { value: "http://insecuresite.com/" }
  })
  fireEvent.click(screen.getByText(/short/i))

  const validation = screen.getByTestId("validation")
  expect(validation.innerHTML).toBe(validation_only_https)
  expect(putFn).toBeCalledTimes(0)
})

it("should show the services error message when it fails", async () => {
  const putFn = jest.fn(
    async (_url: string) => { return "Backend error!" })

  await act(async () => {
    render(<URLForm putFn={putFn} />)
  })

  await (act(async () => {
    fireEvent.change(await waitFor(() => screen.getByTestId("url-input")), {
      target: { value: "https://google.com/" }
    })
    fireEvent.click(screen.getByText(/short/i))
  }))

  const validation = screen.getByTestId("error")
  expect(validation.innerHTML).toBe("Backend error!")
  expect(putFn).toBeCalledTimes(1)
  expect(putFn).toBeCalledWith("https://google.com/")
})

it("should send the url and clear the input text", async () => {
  const putFn = jest.fn(
    async (_url: string) => { return { _id: "abcdefgh" } })

  await act(async () => {
    render(<URLForm putFn={putFn} />)
  })

  await (act(async () => {
    fireEvent.change(await waitFor(() => screen.getByTestId("url-input")), {
      target: { value: "https://google.com/" }
    })
    fireEvent.click(screen.getByText(/short/i))
  }))

  expect(screen.getByTestId("url-input").getAttribute("value")).toBe("")
  expect(putFn).toBeCalledTimes(1)
  expect(putFn).toBeCalledWith("https://google.com/")
})
