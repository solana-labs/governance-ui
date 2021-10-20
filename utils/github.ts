const urlRegex =
  // eslint-disable-next-line
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

export async function fetchGistFile(gistUrl: string) {
  const pieces = gistUrl.match(urlRegex)
  if (pieces) {
    const justIdWithoutUser = pieces[1].split('/')[2]
    const apiUrl = 'https://api.github.com/gists/' + justIdWithoutUser
    const apiResponse = await fetch(apiUrl)

    if (apiResponse.status === 200) {
      const jsonContent = await apiResponse.json()
      const nextUrlFileName = Object.keys(jsonContent['files'])[0]
      const nextUrl = jsonContent['files'][nextUrlFileName]['raw_url']
      const fileResponse = await fetch(nextUrl)

      console.log('fetchGistFile file', gistUrl, fileResponse)
      return await fileResponse.text()
    } else {
      console.warn('could not fetchGistFile', {
        gistUrl,
        apiResponse: await apiResponse.text(),
      })
    }
  }

  return undefined
}
