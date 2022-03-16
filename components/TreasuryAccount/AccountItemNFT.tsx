import { PublicKey } from '@solana/web3.js'
import { GovernedTokenAccount } from '@utils/tokens'
import { abbreviateAddress } from '@utils/formatting'
import useWalletStore from '../../stores/useWalletStore'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
const AccountItemNFT = ({
  governedAccountTokenAccount,
  className,
  onClick,
  border = false,
}: {
  governedAccountTokenAccount: GovernedTokenAccount
  className?: string
  onClick?: () => void
  border?: boolean
}) => {
  const connection = useWalletStore((s) => s.connection)
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  const { setCurrentAccount } = useTreasuryAccountStore()

  const accountPublicKey = governedAccountTokenAccount
    ? governedAccountTokenAccount.governance?.pubkey
    : null
  //TODO move to outside component
  async function handleGoToAccountOverview() {
    setCurrentAccount(governedAccountTokenAccount, connection)
  }
  return (
    <div
      onClick={onClick ? onClick : handleGoToAccountOverview}
      className={`cursor-pointer default-transition flex items-center text-fgd-1 ${
        border && 'border'
      } border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3 ${
        className && className
      }`}
    >
      <img
        src="/img/collectablesIcon.svg"
        className="flex-shrink-0 h-5 w-5 mr-2.5"
      />
      <div className="w-full">
        <div className="flex items-start justify-between mb-0.5">
          <div className="text-xs text-th-fgd-1">
            {abbreviateAddress(accountPublicKey as PublicKey)}
          </div>
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">
          {governedAccountTokenAccount.governance
            ? governanceNfts[
                governedAccountTokenAccount.governance?.pubkey.toBase58()
              ]?.length
            : 0}{' '}
          NFTS
        </div>
      </div>
    </div>
  )
}

export default AccountItemNFT
