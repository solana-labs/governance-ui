import { UserCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { fmtMintAmount } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import { TokenRecordWithWallet } from './types'

const MemberItem = ({ item }: { item: TokenRecordWithWallet }) => {
  const { mint } = useRealm()
  const { walletAddress, info } = item
  const walletPublicKey = tryParsePublicKey(walletAddress)
  return (
    <div className="cursor-pointer default-transition flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3">
      <div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-8 rounded-full w-8 mr-2">
        <UserCircleIcon className="h-6 text-fgd-3 w-6" />
      </div>
      <div>
        <div className="text-xs text-th-fgd-1">
          {abbreviateAddress(walletPublicKey as PublicKey)}
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">
          Total votes: {info.totalVotesCount}
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">
          Voting power: {fmtMintAmount(mint, info.governingTokenDepositAmount)}
        </div>
      </div>
    </div>
  )
}

export default MemberItem
