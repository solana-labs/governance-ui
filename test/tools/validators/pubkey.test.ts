import { tryParseDomain } from '@tools/validators/pubkey'

describe('Public Key Resolves ', () => {
  const domain = 'max.sol'
  const pubkey = '3LPh9LN88kxSe3shxLZ2R4jiNmHh2U2F9h9TmVKjc18P'

  test('domains to publicKey', async () => {
    const resolvedKey = await tryParseDomain(domain)
    expect(resolvedKey?.toBase58()).toEqual(pubkey)
  })
})
