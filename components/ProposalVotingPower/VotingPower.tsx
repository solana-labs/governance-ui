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
import { GoverningTokenType } from '@solana/spl-governance'

import { TokenProgramAccount } from '@utils/tokens'
import useRealm from '@hooks/useRealm'
import { nftPluginsPks, vsrPluginsPks } from '@hooks/useVotingPlugins'
import useProposal from '@hooks/useProposal'
import useWalletStore from 'stores/useWalletStore'

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
  councilMint?: MintInfo,
  councilTokenAccount?: TokenProgramAccount<AccountInfo>,
  mint?: MintInfo,
  ownCouncilTokenRecord?: ProgramAccount<TokenOwnerRecord>,
  ownTokenRecord?: ProgramAccount<TokenOwnerRecord>,
  proposal?: ProgramAccount<Proposal>,
  realm?: ProgramAccount<Realm>,
  tokenType?: GoverningTokenType
) {
  const types: Type[] = []

  const currentPluginPk = config?.account?.communityVoterWeightAddin

  if (
    currentPluginPk &&
    nftPluginsPks.includes(currentPluginPk.toBase58()) &&
    tokenType === GoverningTokenType.Community
  ) {
    types.push(Type.NFT)
  } else if (
    currentPluginPk &&
    vsrPluginsPks.includes(currentPluginPk.toBase58())
  ) {
    const isDepositVisible = (
      depositMint: MintInfo | undefined,
      realmMint: PublicKey | undefined
    ) =>
      depositMint &&
      (!proposal ||
        proposal.account.governingTokenMint.toBase58() ===
          realmMint?.toBase58())

    if (
      (!realm?.account.config.councilMint ||
        isDepositVisible(mint, realm?.account.communityMint)) &&
      tokenType === GoverningTokenType.Community
    ) {
      types.push(Type.LockedCommunity)
    } else if (
      isDepositVisible(councilMint, realm?.account.config.councilMint) &&
      tokenType === GoverningTokenType.Council
    ) {
      types.push(Type.LockedCouncil)
    }
  } else if (tokenType === GoverningTokenType.Council) {
    types.push(Type.Council)
  } else if (tokenType === GoverningTokenType.Community) {
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
    councilMint,
    councilTokenAccount,
    mint,
    ownCouncilTokenRecord,
    ownTokenRecord,
    realm,
  } = useRealm()
  const connected = useWalletStore((s) => s.connected)
  const tokenType = useWalletStore((s) => s.selectedProposal.tokenType)

  const types = getTypes(
    config,
    councilMint,
    councilTokenAccount,
    mint,
    ownCouncilTokenRecord,
    ownTokenRecord,
    proposal,
    realm,
    tokenType
  )

  if (!connected || !proposal) {
    return (
      <div
        className={classNames(props.className, 'rounded-md bg-bkg-1 h-[76px]')}
      />
    )
  }

  if (connected && types.length === 0) {
    return (
      <div className={classNames(props.className, 'text-xs', 'text-white/50')}>
        You do not have any voting power in this realm.
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
