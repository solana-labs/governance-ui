import { LinkButton } from '@components/Button'
import { getAccountName } from '@components/instructions/tools'
import { DuplicateIcon } from '@heroicons/react/outline'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'

const DepositLabel = ({
  header = 'Treasury account address',
  abbreviatedAddress = true,
  transferAddress,
}: {
  header?: string
  abbreviatedAddress?: boolean
  transferAddress: PublicKey | undefined | null
}) => {
  return (
    <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center">
      <div>
        <div className="text-xs text-fgd-3">{header}</div>
        <div className="text-xs text-fgd-3">
          {transferAddress && getAccountName(transferAddress) ? (
            <div className="text-sm text-th-fgd-1">
              {getAccountName(transferAddress)}
            </div>
          ) : null}
        </div>
        <span className=" text-xs">
          {abbreviatedAddress
            ? abbreviateAddress(transferAddress as PublicKey)
            : transferAddress?.toBase58()}
        </span>
      </div>
      <div className="ml-auto">
        <LinkButton
          className="ml-4 text-th-fgd-1"
          onClick={() => {
            navigator.clipboard.writeText(transferAddress!.toBase58())
          }}
        >
          <DuplicateIcon className="w-5 h-5 mt-1" />
        </LinkButton>
      </div>
    </div>
  )
}

export default DepositLabel
