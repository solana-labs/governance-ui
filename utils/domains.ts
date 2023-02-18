import {
  getDomainKey,
  MINT_PREFIX,
  NameRegistryState,
  NAME_TOKENIZER_ID,
} from '@bonfida/spl-name-service'
import { Connection, ParsedAccountData, PublicKey } from '@solana/web3.js'

export const resolveDomain = async (
  connection: Connection,
  domainName: string
) => {
  try {
    // Get the public key for the domain
    const { pubkey } = await getDomainKey(domainName.replace('.sol', ''))

    // Check if the domain is an NFT
    const [nftMintAddress] = await PublicKey.findProgramAddress(
      [MINT_PREFIX, pubkey.toBuffer()],
      NAME_TOKENIZER_ID
    )

    const nftAccountData = await connection.getParsedAccountInfo(nftMintAddress)

    if (
      nftAccountData.value?.data &&
      !Buffer.isBuffer(nftAccountData.value.data)
    ) {
      const parsedData: ParsedAccountData = nftAccountData.value.data

      if (
        parsedData.parsed.info.supply === '1' &&
        parsedData.parsed.info.isInitialized
      ) {
        const { value } = await connection.getTokenLargestAccounts(
          nftMintAddress
        )
        const nftHolder = value.find((e) => e.amount === '1')?.address

        if (!nftHolder) return undefined

        const holderInfo = await connection.getAccountInfo(nftHolder)

        if (!holderInfo || !holderInfo.data) {
          return undefined
        }

        return new PublicKey(holderInfo.data.slice(32, 64))
      }
    }

    // Retrieve the domain's registry information
    const { registry } = await NameRegistryState.retrieve(connection, pubkey)

    return registry.owner
  } catch (error) {
    return undefined
  }
}
