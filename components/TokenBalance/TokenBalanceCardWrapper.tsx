import { Proposal } from '@solana/spl-governance'
import { Option } from 'tools/core/option'
import useRealm from '@hooks/useRealm'
import dynamic from 'next/dynamic'

const LockPluginTokenBalanceCard = dynamic(
  () =>
    import(
      'VoteStakeRegistry/components/TokenBalance/LockPluginTokenBalanceCard'
    )
)
const TokenBalanceCard = dynamic(() => import('./TokenBalanceCard'))
const NftBalanceCard = dynamic(() => import('./NftBalanceCard'))

const TokenBalanceCardWrapper = ({
  proposal,
}: {
  proposal?: Option<Proposal>
}) => {
  const { realm, ownTokenRecord } = useRealm()

  const getTokenBalanceCard = () => {
    //based on realm config it will provide proper tokenBalanceCardComponent
    const isLockTokensMode = realm?.account.config.useCommunityVoterWeightAddin
    if (
      isLockTokensMode &&
      (!ownTokenRecord ||
        ownTokenRecord.account.governingTokenDepositAmount.isZero())
    ) {
      return <LockPluginTokenBalanceCard></LockPluginTokenBalanceCard>
    }
    if (
      realm?.pubkey.toBase58() ===
      'HVywtno57PwcgWQzRaf3Pv8RKWWrF1zoqLZGULNC2jGm'
    ) {
      return <NftBalanceCard></NftBalanceCard>
    }
    //Default
    return <TokenBalanceCard proposal={proposal}></TokenBalanceCard>
  }
  return getTokenBalanceCard()
}

export default TokenBalanceCardWrapper
