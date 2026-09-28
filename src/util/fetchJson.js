import { HttpError } from './HttpError'

export const fetchJson = async request => {
  const result = await request.json()
  const response = result.response.value
  const data = result.data?.value

  if (response && !response.ok) {
    throw new HttpError(response, data, result.error.value)
  }

  if (result.error.value) {
    throw result.error.value
  }
  return data
}
