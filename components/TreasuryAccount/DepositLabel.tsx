import { LinkButton } from '@components/Button'
import {
  DEFAULT_NFT_TREASURY_MINT,
  getAccountName,
} from '@components/instructions/tools'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import { GovernedTokenAccount } from '@utils/tokens'

const DepositLabel = ({
  currentAccount,
}: {
  currentAccount: GovernedTokenAccount | null
}) => {
  const isNFT =
    currentAccount?.mint?.publicKey.toBase58() === DEFAULT_NFT_TREASURY_MINT
  const address = !isNFT
    ? currentAccount!.governance!.info.governedAccount
    : currentAccount?.governance?.pubkey
  return (
    <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center">
      <div>
        <div className="text-fgd-3 text-xs">
          {currentAccount?.token?.publicKey &&
          getAccountName(currentAccount?.token?.publicKey) ? (
            <div className="text-sm text-th-fgd-1">
              {getAccountName(currentAccount.token?.publicKey)}
            </div>
          ) : null}
        </div>
        {abbreviateAddress(address as PublicKey)}
      </div>
      <div className="ml-auto">
        <LinkButton
          className="ml-4 text-th-fgd-1"
          onClick={() => {
            navigator.clipboard.writeText(address!.toBase58())
          }}
        >
          Copy
        </LinkButton>
      </div>
    </div>
  )
}

export default DepositLabel
