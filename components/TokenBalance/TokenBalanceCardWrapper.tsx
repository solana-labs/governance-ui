import { Proposal } from '@solana/spl-governance'
import TokenBalanceCard from './TokenBalanceCard'
import { Option } from 'tools/core/option'
import useRealm from '@hooks/useRealm'
import LockPluginTokenBalanceCard from 'VoteStakeRegistry/components/TokenBalance/LockPluginTokenBalanceCard'
import NftBalanceCard from './NftBalanceCard'

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
