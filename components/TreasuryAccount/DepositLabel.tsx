import { LinkButton } from '@components/Button'
import { getAccountName } from '@components/instructions/tools'
import { DuplicateIcon } from '@heroicons/react/outline'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import { GovernedTokenAccount } from '@utils/tokens'

const DepositLabel = ({
  currentAccount,
}: {
  currentAccount: GovernedTokenAccount | null
}) => {
  const isNFT = currentAccount?.isNft
  const address = !isNFT
    ? currentAccount!.governance!.info.governedAccount
    : currentAccount?.governance?.pubkey
  return (
    <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center">
      <div>
        <div className="text-xs text-fgd-3">Treasury account address</div>
        <div className="text-xs text-fgd-3">
          {currentAccount?.token?.publicKey &&
          getAccountName(currentAccount?.token?.publicKey) ? (
            <div className="text-sm text-th-fgd-1">
              {getAccountName(currentAccount.token?.publicKey)}
            </div>
          ) : null}
        </div>
        <span className=" text-xs">
          {abbreviateAddress(address as PublicKey)}
        </span>
      </div>
      <div className="ml-auto">
        <LinkButton
          className="ml-4 text-th-fgd-1"
          onClick={() => {
            navigator.clipboard.writeText(address!.toBase58())
          }}
        >
          <DuplicateIcon className="w-5 h-5 mt-1" />
        </LinkButton>
      </div>
    </div>
  )
}

export default DepositLabel
