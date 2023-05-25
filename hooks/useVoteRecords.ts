import { useEffect, useMemo, useState } from 'react'
import { pipe } from 'fp-ts/function'
import { matchW, fromTaskOption } from 'fp-ts/TaskEither'
import {
  Proposal,
  ProgramAccount,
  VoteRecord,
  TokenOwnerRecord,
  RpcContext,
  VoteKind,
} from '@solana/spl-governance'

import useRpcContext from '@hooks/useRpcContext'
import { getVoteRecords, getTokenOwnerRecords } from '@models/proposal'
import useRealm from '@hooks/useRealm'
import { buildTopVoters } from '@models/proposal'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { getLockTokensVotingPowerPerWallet } from 'VoteStakeRegistry/tools/deposits'
import { BN } from '@coral-xyz/anchor'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import { PublicKey } from '@solana/web3.js'
import { useRealmQuery } from './queries/realm'
import { useRealmCommunityMintInfoQuery } from './queries/mintInfo'
import useLegacyConnectionContext from './useLegacyConnectionContext'

export default function useVoteRecords(proposal?: ProgramAccount<Proposal>) {
  const { getRpcContext } = useRpcContext()
  const [voteRecords, setVoteRecords] = useState<ProgramAccount<VoteRecord>[]>(
    []
  )
  const [tokenOwnerRecords, setTokenOwnerRecords] = useState<
    ProgramAccount<TokenOwnerRecord>[]
  >([])
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const { vsrMode } = useRealm()

  //for vsr
  const [
    undecidedDepositByVoteRecord,
    setUndecidedDepositByVoteRecord,
  ] = useState<{ [walletPk: string]: BN }>({})
  const assetAccounts = useGovernanceAssetsStore((s) => s.assetAccounts)
  const mintsUsedInRealm = assetAccounts
    .filter((x) => x.isToken)
    .map((x) => x.extensions.mint!)
  ///

  const [context, setContext] = useState<RpcContext | null>(null)
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const connection = useLegacyConnectionContext()
  const governingTokenMintPk = proposal?.account.governingTokenMint

  useEffect(() => {
    if (context && proposal && realm) {
      // fetch vote records
      pipe(
        () =>
          getVoteRecords({
            connection: context.connection,
            programId: context.programId,
            proposalPk: proposal.pubkey,
          }),
        fromTaskOption(() => new Error('Could not fetch vote records')),
        matchW((reason) => {
          console.log(reason)
          setVoteRecords([])
        }, setVoteRecords)
      )()

      // fetch token records
      pipe(
        () =>
          getTokenOwnerRecords({
            governingTokenMint: governingTokenMintPk,
            connection: context.connection,
            programId: context.programId,
            realm: realm.pubkey,
          }),
        fromTaskOption(() => new Error('Could not fetch token records')),
        matchW((reason) => {
          console.log(reason)
          setTokenOwnerRecords([])
        }, setTokenOwnerRecords)
      )()
    }
  }, [context, governingTokenMintPk, proposal, realm])

  useEffect(() => {
    if (realm) {
      setContext(getRpcContext())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realm])
  const topVoters = useMemo(() => {
    if (realm && proposal && mint) {
      return buildTopVoters(
        voteRecords,
        tokenOwnerRecords,
        realm,
        proposal,
        mint,
        undecidedDepositByVoteRecord
      )
    }

    return []
  }, [
    voteRecords,
    tokenOwnerRecords,
    realm,
    proposal,
    mint,
    undecidedDepositByVoteRecord,
  ])

  //VSR only
  const handleGetVsrVotingPowers = async (walletsPks: PublicKey[]) => {
    const votingPerWallet = await getLockTokensVotingPowerPerWallet(
      walletsPks,
      realm!,
      client!,
      connection,
      mintsUsedInRealm
    )
    setUndecidedDepositByVoteRecord(votingPerWallet)
  }
  useEffect(() => {
    if (
      vsrMode === 'default' &&
      !Object.keys(undecidedDepositByVoteRecord).length
    ) {
      const undecidedData = tokenOwnerRecords.filter(
        (tokenOwnerRecord) =>
          !voteRecords
            .filter((x) => x.account.vote?.voteType !== VoteKind.Veto)
            .some(
              (voteRecord) =>
                voteRecord.account.governingTokenOwner.toBase58() ===
                tokenOwnerRecord.account.governingTokenOwner.toBase58()
            )
      )
      if (undecidedData.length && mintsUsedInRealm.length) {
        handleGetVsrVotingPowers(
          undecidedData.map((x) => x.account.governingTokenOwner)
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    tokenOwnerRecords.length,
    voteRecords.length,
    vsrMode,
    mintsUsedInRealm.length,
  ])
  ///////

  return topVoters
}
