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
import { useRealmConfigQuery } from './queries/realmConfig'
import { NFT_PLUGINS_PKS } from '@constants/plugins'
import { getNetworkFromEndpoint } from '@utils/connection'
import { fetchDigitalAssetsByOwner } from './queries/digitalAssets'
import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'

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
  const { vsrMode, isNftMode } = useRealm()

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
  const [nftMintRegistrar] = useVotePluginsClientStore((s) => [
    s.state.nftMintRegistrar,
  ])
  const nftVoterPluginTotalWeight = useMemo(() => {
    return nftMintRegistrar?.collectionConfigs.reduce((prev, curr) => {
      const size = curr.size
      const weight = curr.weight
      if (typeof size === 'undefined' || typeof weight === 'undefined')
        return prev
      return prev + size * weight
    }, 0)
  }, [nftMintRegistrar])
  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin
  const usedCollectionsPks: string[] = useMemo(
    () =>
      (currentPluginPk &&
        NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58()) &&
        nftMintRegistrar?.collectionConfigs.map((x) =>
          x.collection.toBase58()
        )) ||
      [],
    [currentPluginPk, nftMintRegistrar?.collectionConfigs]
  )
  const [undecidedNftsByVoteRecord, setUndecidedNftsByVoteRecord] = useState<{
    [walletPk: string]: BN
  }>({})

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
    if (getRpcContext) {
      setContext(getRpcContext() ?? null)
    }
  }, [getRpcContext])
  const topVoters = useMemo(() => {
    if (realm && proposal && mint && !isNftMode) {
      const maxVote = calculateMaxVoteScore(realm, proposal, mint)
      return buildTopVoters(
        voteRecords,
        tokenOwnerRecords,
        mint,
        undecidedDepositByVoteRecord,
        maxVote
      )
    } else if (realm && proposal && mint && isNftMode) {
      return buildTopVoters(
        voteRecords,
        tokenOwnerRecords,
        mint,
        undecidedNftsByVoteRecord,
        new BN(nftVoterPluginTotalWeight)
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
    undecidedNftsByVoteRecord,
    isNftMode,
    nftVoterPluginTotalWeight,
  ])

  useEffect(() => {
    //VSR only
    const handleGetVsrVotingPowers = async (walletsPks: PublicKey[]) => {
      if (!realm || !client) throw new Error()

      const votingPerWallet = await getLockTokensVotingPowerPerWallet(
        walletsPks,
        realm,
        client,
        connection,
        mintsUsedInRealm
      )
      setUndecidedDepositByVoteRecord(votingPerWallet)
    }

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
      if (undecidedData.length && mintsUsedInRealm.length && realm && client) {
        handleGetVsrVotingPowers(
          undecidedData.map((x) => x.account.governingTokenOwner)
        )
      }
    }
  }, [
    tokenOwnerRecords.length,
    voteRecords.length,
    vsrMode,
    mintsUsedInRealm.length,
    undecidedDepositByVoteRecord,
    tokenOwnerRecords,
    voteRecords,
    realm,
    client,
    connection,
    mintsUsedInRealm,
  ])
  ///////

  useEffect(() => {
    const handleGetNftsVotingPowers = async (walletsPks: PublicKey[]) => {
      const network = getNetworkFromEndpoint(connection.endpoint)
      if (network === 'localnet') throw new Error()

      const enabled =
        walletsPks !== undefined && usedCollectionsPks !== undefined
      if (!enabled) throw new Error()
      const votingPower = await Promise.all(
        walletsPks.map(async (walletPk) => {
          const ownedNfts = await fetchDigitalAssetsByOwner(network, walletPk)
          const verifiedNfts = ownedNfts.filter((nft) => {
            const collection = nft.grouping.find(
              (x) => x.group_key === 'collection'
            )
            return (
              collection &&
              usedCollectionsPks.includes(collection.group_value) &&
              (collection.verified ||
                typeof collection.verified === 'undefined')
            )
          })
          return {
            walletPk: walletPk,
            votingPower: verifiedNfts.length * 10 ** 6, //default decimal wieight is 10^6
          }
        })
      )

      if (votingPower) {
        const votingPowerObj = {}
        for (const record of votingPower) {
          votingPowerObj[record.walletPk.toBase58()] = new BN(
            record.votingPower
          )
        }
        setUndecidedNftsByVoteRecord(votingPowerObj)
      } else {
        setUndecidedNftsByVoteRecord({})
      }
    }

    if (isNftMode && !Object.keys(undecidedNftsByVoteRecord).length) {
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
      if (undecidedData.length) {
        handleGetNftsVotingPowers(
          undecidedData.map((x) => x.account.governingTokenOwner)
        )
      }
    }
  }, [
    isNftMode,
    connection,
    currentPluginPk,
    usedCollectionsPks,
    undecidedNftsByVoteRecord,
    tokenOwnerRecords,
    voteRecords,
  ])

  return topVoters
}
