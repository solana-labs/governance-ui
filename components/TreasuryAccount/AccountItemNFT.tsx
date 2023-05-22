import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { AssetAccount } from '@utils/uiTypes/assets'
import tokenPriceService from '@utils/services/tokenPrice'
import { WSOL_MINT } from '@components/instructions/tools'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const AccountItemNFT = ({
  governedAccountTokenAccount,
  className,
  onClick,
  border = false,
}: {
  governedAccountTokenAccount: AssetAccount
  className?: string
  onClick?: () => void
  border?: boolean
}) => {
  const connection = useLegacyConnectionContext()
  const nftsPerPubkey = useTreasuryAccountStore((s) => s.governanceNfts)
  const { setCurrentAccount } = useTreasuryAccountStore()

  const accountPublicKey = governedAccountTokenAccount
    ? governedAccountTokenAccount.extensions.transferAddress
    : null
  //TODO move to outside component
  async function handleGoToAccountOverview() {
    setCurrentAccount(governedAccountTokenAccount, connection)
  }
  const info = governedAccountTokenAccount.isSol
    ? tokenPriceService.getTokenInfo(WSOL_MINT)
    : undefined
  const nftsCount = governedAccountTokenAccount.isSol
    ? nftsPerPubkey[governedAccountTokenAccount.governance.pubkey.toBase58()]
        ?.length +
      nftsPerPubkey[
        governedAccountTokenAccount.extensions.transferAddress!.toBase58()
      ]?.length
    : nftsPerPubkey[governedAccountTokenAccount.governance.pubkey.toBase58()]
        ?.length
  return (
    <div
      onClick={onClick ? onClick : handleGoToAccountOverview}
      className={`cursor-pointer default-transition flex items-center text-fgd-1 ${
        border && 'border'
      } border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3 ${
        className && className
      }`}
    >
      {governedAccountTokenAccount.isSol ? (
        <img
          src={info?.logoURI || ''}
          className="flex-shrink-0 h-5 w-5 mr-2.5 rounded-full"
        />
      ) : (
        <img
          src="/img/collectablesIcon.svg"
          className="flex-shrink-0 h-5 w-5 mr-2.5"
        />
      )}

      <div className="w-full">
        <div className="flex items-start justify-between mb-0.5">
          <div className="text-xs text-th-fgd-1">
            {abbreviateAddress(accountPublicKey as PublicKey)}
          </div>
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">
          {governedAccountTokenAccount.governance ? nftsCount : 0} NFTS
        </div>
      </div>
    </div>
  )
}

export default AccountItemNFT
