import { LatestURLs } from "./LatestURLs"
import renderer from "react-test-renderer"
import { act, fireEvent, render, waitFor, screen } from "@testing-library/react"

it("should show loading...", async () => {
  const get = jest.fn(
    async () => { })

  const c = renderer.create(<LatestURLs
    perPage={10}
    urls={null}
    error={null}
    getURLsFn={get}
    baseURL="https://pbid.io" />)

  var tree = c.toJSON()
  expect(tree).toMatchSnapshot()
})

it("should show 1 url", async () => {
  const get = jest.fn(
    async () => { })

  const c = renderer.create(<LatestURLs
    perPage={10}
    urls={{ total: 1, items: [{ _id: "abcdefgh", url: "www.google.com" }] }}
    error={null}
    getURLsFn={get}
    baseURL="https://pbid.io" />)

  var tree = c.toJSON()
  expect(tree).toMatchSnapshot()
})

it("should show 10 url and the next button", async () => {

  const c = renderer.create(<LatestURLs
    perPage={10}
    urls={{ total: url100.length, items: url100.slice(0, 10) }}
    error={null}
    getURLsFn={() => { }}
    baseURL="https://pbid.io" />)

  var tree = c.toJSON()
  expect(tree).toMatchSnapshot()
})

it("should call get to show next and previous page", async () => {
  const get = jest.fn(
    async () => { }
  )

  await act(async () => {
    render(<LatestURLs
      perPage={10}
      urls={{ total: url100.length, items: url100.slice(0, 10) }}
      error={null}
      getURLsFn={get}
      baseURL="https://pbid.io" />)
  })

  await (act(async () => {
    fireEvent.click(await waitFor(() => screen.getByTestId("next")))
  }))

  expect(get).toBeCalledTimes(2)
  expect(get).nthCalledWith(1, 0)
  expect(get).nthCalledWith(2, 10)

  await (act(async () => {
    fireEvent.click(await waitFor(() => screen.getByTestId("prev")))
  }))

  expect(get).toBeCalledTimes(3)
  expect(get).nthCalledWith(3, 0)
})

const pad = (num: number, size: number) => {
  var nums = num.toString();
  while (nums.length < size) {
    nums = "0" + nums
  }
  return nums;
}

const genURLs = (n: number) => {
  const urls = []

  for (var i = 0; i < n; i++) {
    urls.push({ _id: pad(i, 8), url: `https://${pad(i, 12)}.com` })
  }

  return urls
}

const url100 = genURLs(100)


