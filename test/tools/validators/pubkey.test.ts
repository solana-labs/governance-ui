import { tryParseDomain } from '@tools/validators/pubkey'

describe('Public Key Resolves ', () => {
  const domain = 'realms.sol'
  const pubkey = '8aHFSYp3K2X2qEfUqQhfCuCHvjDumdiMzfCyrJhdJxmQ'

  test('domains to publicKey', async () => {
    const resolvedKey = await tryParseDomain(domain)
    expect(resolvedKey?.toBase58()).toEqual(pubkey)
  })
})
