import { Proposal } from '@models/accounts'
import TokenBalanceCard from './TokenBalanceCard'
import { Option } from 'tools/core/option'
import LockPluginTokenBalanceCard from './LockPluginTokenBalanceCard'
//import useRealm from '@hooks/useRealm'

const TokenBalanceCardWrapper = ({
  proposal,
}: {
  proposal?: Option<Proposal>
}) => {
  //const { realmInfo } = useRealm()
  const getTokenBalanceCard = () => {
    //based on realm config it will provide proper tokenBalanceCardComponent
    const isLockTokensMode = true
    if (isLockTokensMode) {
      return <LockPluginTokenBalanceCard></LockPluginTokenBalanceCard>
    }
    //Default
    return <TokenBalanceCard proposal={proposal}></TokenBalanceCard>
  }
  return getTokenBalanceCard()
}

export default TokenBalanceCardWrapper
