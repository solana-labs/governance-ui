import { PublicKey } from '@solana/web3.js'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { GovernedTokenAccount } from '@utils/tokens'
import { abbreviateAddress } from '@utils/formatting'
import { getExplorerUrl } from '../explorer/tools'
import useWalletStore from '../../stores/useWalletStore'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ViewState } from './Types'
import nftLogo from 'public/img/nft-logo.jpeg'
import { useEffect, useState } from 'react'
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz'
const AccountItemNFT = ({
  governedAccountTokenAccount,
}: {
  governedAccountTokenAccount: GovernedTokenAccount
}) => {
  const connection = useWalletStore((s) => s.connection)
  const [nftsCount, setNftsCount] = useState(0)
  const {
    setCurrentCompactView,
    setCurrentCompactAccount,
  } = useTreasuryAccountStore()

  const accountPublicKey = governedAccountTokenAccount
    ? governedAccountTokenAccount.governance?.pubkey
    : null

  async function handleGoToAccountOverview() {
    setCurrentCompactView(ViewState.AccountView)
    setCurrentCompactAccount(governedAccountTokenAccount, connection, nftsCount)
  }
  useEffect(() => {
    const getNftsCount = async () => {
      const nfts = await getParsedNftAccountsByOwner({
        publicAddress: accountPublicKey,
        connection: connection.current,
      })
      setNftsCount(nfts.length)
    }
    getNftsCount()
  }, [])
  return (
    <div
      onClick={handleGoToAccountOverview}
      className="cursor-pointer default-transition flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3"
    >
      <img
        src={nftLogo.src}
        className="flex-shrink-0 h-6 w-6 mr-2.5 mt-1 rounded-full"
      />
      <div className="w-full">
        <div className="flex items-start justify-between mb-1">
          <div className="text-xs text-th-fgd-1">
            {abbreviateAddress(accountPublicKey as PublicKey)}
          </div>
          <a
            href={
              accountPublicKey
                ? getExplorerUrl(connection.endpoint, accountPublicKey)
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
          </a>
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">{nftsCount} NFTS</div>
      </div>
    </div>
  )
}

export default AccountItemNFT
