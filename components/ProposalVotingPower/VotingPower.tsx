import classNames from 'classnames'
import {
  ProgramAccount,
  RealmConfigAccount,
  TokenOwnerRecord,
  Realm,
  Proposal,
} from '@solana/spl-governance'
import { AccountInfo, MintInfo } from '@solana/spl-token'
import type { PublicKey } from '@solana/web3.js'

import { TokenProgramAccount } from '@utils/tokens'
import useRealm from '@hooks/useRealm'
import { nftPluginsPks, vsrPluginsPks } from '@hooks/useVotingPlugins'
import useProposal from '@hooks/useProposal'

import CommunityVotingPower from './CommunityVotingPower'
import CouncilVotingPower from './CouncilVotingPower'
import LockedCommunityVotingPower from './LockedCommunityVotingPower'
import LockedCouncilVotingPower from './LockedCouncilVotingPower'
import NftVotingPower from './NftVotingPower'

enum Type {
  Council,
  LockedCouncil,
  LockedCommunity,
  NFT,
  Community,
}

function getTypes(
  config?: ProgramAccount<RealmConfigAccount>,
  ownTokenRecord?: ProgramAccount<TokenOwnerRecord>,
  ownCouncilTokenRecord?: ProgramAccount<TokenOwnerRecord>,
  councilTokenAccount?: TokenProgramAccount<AccountInfo>,
  realm?: ProgramAccount<Realm>,
  proposal?: ProgramAccount<Proposal>,
  mint?: MintInfo,
  councilMint?: MintInfo
) {
  const types: Type[] = []

  const currentPluginPk = config?.account?.communityVoterWeightAddin

  if (currentPluginPk && nftPluginsPks.includes(currentPluginPk.toBase58())) {
    types.push(Type.NFT)
  }

  if (currentPluginPk && vsrPluginsPks.includes(currentPluginPk.toBase58())) {
    const isDepositVisible = (
      depositMint: MintInfo | undefined,
      realmMint: PublicKey | undefined
    ) =>
      depositMint &&
      (!proposal ||
        proposal.account.governingTokenMint.toBase58() ===
          realmMint?.toBase58())

    if (
      !realm?.account.config.councilMint ||
      isDepositVisible(mint, realm?.account.communityMint)
    ) {
      types.push(Type.LockedCommunity)
    }

    if (isDepositVisible(councilMint, realm?.account.config.councilMint)) {
      types.push(Type.LockedCouncil)
    }
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
  const { proposal } = useProposal()
  const {
    config,
    councilTokenAccount,
    ownCouncilTokenRecord,
    ownTokenRecord,
    mint,
    realm,
    councilMint,
  } = useRealm()

  const types = getTypes(
    config,
    ownTokenRecord,
    ownCouncilTokenRecord,
    councilTokenAccount,
    realm,
    proposal,
    mint,
    councilMint
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
          case Type.LockedCommunity:
            return <LockedCommunityVotingPower key={type} />
          case Type.LockedCouncil:
            return <LockedCouncilVotingPower key={type} />
          case Type.Community:
            return <CommunityVotingPower key={type} />
          case Type.NFT:
            return <NftVotingPower key={type} />
        }
      })}
    </div>
  )
}
