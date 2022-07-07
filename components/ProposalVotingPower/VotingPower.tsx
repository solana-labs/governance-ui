import classNames from 'classnames'
import {
  ProgramAccount,
  RealmConfigAccount,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { AccountInfo } from '@solana/spl-token'

import { TokenProgramAccount } from '@utils/tokens'
import useRealm from '@hooks/useRealm'
import { nftPluginsPks } from '@hooks/useVotingPlugins'

import CouncilVotingPower from './CouncilVotingPower'
import CommunityVotingPower from './CommunityVotingPower'
import NftVotingPower from './NftVotingPower'

enum Type {
  Council,
  NFT,
  Community,
}

function getTypes(
  config?: ProgramAccount<RealmConfigAccount>,
  ownTokenRecord?: ProgramAccount<TokenOwnerRecord>,
  ownCouncilTokenRecord?: ProgramAccount<TokenOwnerRecord>,
  councilTokenAccount?: TokenProgramAccount<AccountInfo>
) {
  const types: Type[] = []

  const currentPluginPk = config?.account?.communityVoterWeightAddin

  if (currentPluginPk && nftPluginsPks.includes(currentPluginPk?.toBase58())) {
    types.push(Type.NFT)
  }

  if (
    ownCouncilTokenRecord &&
    !ownCouncilTokenRecord.account.governingTokenDepositAmount.isZero()
  ) {
    types.push(Type.Council)
  } else if (
    councilTokenAccount &&
    !councilTokenAccount.account.amount.isZero()
  ) {
    types.push(Type.Council)
  }

  if (
    ownTokenRecord &&
    !ownTokenRecord.account.governingTokenDepositAmount.isZero()
  ) {
    types.push(Type.Community)
  }

  return types
}

interface Props {
  className?: string
}

export default function VotingPower(props: Props) {
  const {
    config,
    councilTokenAccount,
    ownCouncilTokenRecord,
    ownTokenRecord,
  } = useRealm()

  const types = getTypes(
    config,
    ownTokenRecord,
    ownCouncilTokenRecord,
    councilTokenAccount
  )

  if (types.length === 0) {
    return (
      <div className={classNames(props.className, 'text-xs', 'text-white/50')}>
        You do not have any voting power
        <br />
        in this realm.
      </div>
    )
  }

  return (
    <div className={classNames(props.className, 'space-y-2')}>
      {types.map((type) => {
        switch (type) {
          case Type.Council:
            return <CouncilVotingPower key={type} />
          case Type.Community:
            return <CommunityVotingPower key={type} />
          case Type.NFT:
            return <NftVotingPower key={type} />
        }
      })}
    </div>
  )
}
