import { tryParseDomain } from '@tools/validators/pubkey'

describe('Public Key Resolves ', () => {
  const domain = 'carlos_0x.sol'
  const tokenizedDomain = 'snakeoil.sol'
  const pubkey = '9apnHjEQ8enLaPLxP7z9VQTphWE4nWqZcyHJYocQMpSE'

  test('domains to publicKey', async () => {
    const resolvedKey = await tryParseDomain(domain)
    expect(resolvedKey?.toBase58()).toEqual(pubkey)
  })

  test('tokenized domains to publicKey', async () => {
    const resolvedKey = await tryParseDomain(tokenizedDomain)
    expect(resolvedKey?.toBase58()).toEqual(pubkey)
  })
})
