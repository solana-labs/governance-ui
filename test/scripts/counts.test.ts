import realms from 'public/realms/mainnet-beta.json'
import getProposalCounts from 'scripts/getProposalCounts'

test('counts', async () => {
  const counts = await getProposalCounts(realms)

  expect(counts).toStrictEqual({
    '7wsrKBeTpqfcribDo34qr8rdSbqXbmQq9Fog2cVirK6C': 0,
    '36fZRsuM3oXvb5VrEXXVmokbGnjADzVgKpW1pgQq7jXJ': 1,
    FvzZFjf3NPTZbKAmQA4Gf1v7uTW7HFcP5Pcr2oVm49t3: 0,
    By2sVGZXwfQq6rAiAM3rNPJ9iQfb5e2QhnF4YjJ4Bip: 1,
    DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE: 0,
    '759qyfKDMMuo9v36tW7fbGanL63mZFPNbhU7zjPrkuGK': 0,
    FMEWULPSGR1BKVJK4K7xTjhG23NfYxeAn2bamYgNoUck: 0,
    '3MMDxjv1SzEFQDKryT7csAvaydYtrgMAc3L9xL9CVLCg': 0,
    '2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv': 0,
    Cdui9Va8XnKVng3VGZXcfBFF6XSxbqSi2XruMc7iu817: 0,
    CS3HBXBdZ44g7FdZfgPAz6nSBe4FSThg6ANuVdowTT6G: 0,
    '4BNkheiMATVVcyJnGpjPbbPvFuKMx3cCDmkEbtnTz2iV': 0,
    B1CxhV1khhj7n5mi5hebbivesqH9mvXr5Hfh2nD2UCh6: 0,
    '8eUUtRpBCg7sJ5FXfPUMiwSQNqC3FjFLkmS2oFPKoiBi': 0,
    EtZWAeFFRC5k6uesap1F1gkHFimsL2HqttVTNAeN86o8: 0,
    '4SsH1eg4zzwfRXBJjrKTY163U2UvW7n16B35pZVPxRpX': 0,
    Dn5yLFi6ZNhkD25CX4c8qq1MV3CC2vcrH2Qujfzy22rT: 0,
    '371PRJu9vyU2U6WHcqorakWvz3wpfGSVhHr65BBSoaiN': 0,
    '3YdSnGzJbgyq5mGoFxu4RqmrUetUCEvyDkXEFy4oi6zd': 0,
  })
})
