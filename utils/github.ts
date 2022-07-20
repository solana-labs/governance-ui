const urlRegex =
  // eslint-disable-next-line
  /(https:\/\/)(gist.github.com\/)([\w\/]{1,39}\/)([\w]{1,32})/;

export async function fetchGistFile(gistUrl: string) {
  const pieces = gistUrl.match(urlRegex);
  if (pieces) {
    const justIdWithoutUser = pieces[4];
    if (justIdWithoutUser) {
      const apiUrl = 'https://api.github.com/gists/' + justIdWithoutUser;
      const apiResponse = await fetch(apiUrl);
      if (apiResponse.status === 200) {
        const jsonContent = await apiResponse.json();
        const nextUrlFileName = Object.keys(jsonContent['files'])[0];
        const nextUrl = jsonContent['files'][nextUrlFileName]['raw_url'];
        if (nextUrl.startsWith('https://gist.githubusercontent.com')) {
          const fileResponse = await fetch(nextUrl);

          return await fileResponse.text();
        }
        return undefined;
      } else {
        console.warn('could not fetchGistFile', {
          gistUrl,
          apiResponse: await apiResponse.text(),
        });
      }
    }
  }

  return undefined;
}
