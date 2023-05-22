import axios from 'axios'

const urlRegex =
  // eslint-disable-next-line
  /(https:\/\/)(gist\.github.com\/)([\w\/-]{1,39}\/)([\w-]{1,32})/

export const gistApi = {
  fetchGistFile: fetchGistFile,
  cancel: function () {
    if (this?.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  },
  abortController: null,
}
async function fetchGistFile(gistUrl: string) {
  const controller = new AbortController()
  if (typeof this !== 'undefined') {
    this.abortController = controller
  }
  const pieces = gistUrl.match(urlRegex)

  if (pieces) {
    const justIdWithoutUser = pieces[4]
    if (justIdWithoutUser) {
      const apiUrl = 'https://api.github.com/gists/' + justIdWithoutUser
      const apiResponse = await axios.get(apiUrl, {
        signal: controller.signal,
      })
      if (apiResponse.status === 200) {
        const jsonContent = apiResponse.data
        const nextUrlFileName = Object.keys(jsonContent['files'])[0]
        const nextUrl = jsonContent['files'][nextUrlFileName]['raw_url']
        if (nextUrl.startsWith('https://gist.githubusercontent.com/')) {
          const fileResponse = await axios.get(nextUrl, {
            signal: controller.signal,
          })
          //console.log('fetchGistFile file', gistUrl, fileResponse)
          return fileResponse.data
        }
        return undefined
      } else {
        console.warn('could not fetchGistFile', {
          gistUrl,
          apiResponse: apiResponse.data,
        })
      }
    }
  }

  return undefined
}
