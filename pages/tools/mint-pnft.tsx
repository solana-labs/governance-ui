import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata'
import { Keypair } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'

const MintPnft = () => {
  const wallet = useWalletOnePointOh()
  const connection = useWalletStore((s) => s.connection)

  const mint = async () => {
    if (!wallet?.publicKey) throw new Error()

    const metaplex = new Metaplex(connection.current, {
      cluster: 'devnet',
    }).use(walletAdapterIdentity(wallet))
    const signerman = new Keypair()
    const x = await metaplex.nfts().create({
      updateAuthority: signerman,
      mintAuthority: signerman,
      useNewMint: signerman,
      mintTokens: true,
      tokenOwner: wallet?.publicKey,
      tokenStandard: TokenStandard.ProgrammableNonFungible,
      uri: 'https://arweave.net/Al7yuB-ew-3LoD0hvhXzGElLgZnX2S4qZMC5w0STc7s',
      name: 'test pNFT',
      sellerFeeBasisPoints: 0,
    })
  }
  return (
    <>
      <button onClick={mint}>Mint PNFT</button>
    </>
  )
}

export default MintPnft
