import { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import { useRouter } from 'next/router'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { PythBalance } from 'pyth-staking-api'
import { useEffect, useMemo, useState } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import {
  PythVoterWeight,
  SimpleGatedVoterWeight,
  VoteNftWeight,
  SwitchboardQueueVoteWeight,
  VoteRegistryVoterWeight,
  VoterWeight,
} from '../models/voteWeights'
import useMembersStore from 'stores/useMembersStore'
import {
  NFT_PLUGINS_PKS,
  VSR_PLUGIN_PKS,
  SWITCHBOARD_PLUGINS_PKS,
  PYTH_PLUGINS_PKS,
  GATEWAY_PLUGINS_PKS,
  HELIUM_VSR_PLUGINS_PKS,
} from '../constants/plugins'
import useGatewayPluginStore from '../GatewayPlugin/store/gatewayPluginStore'
import useSwitchboardPluginStore from 'SwitchboardVotePlugin/store/switchboardStore'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useVsrMode } from './useVsrMode'
import useWalletOnePointOh from './useWalletOnePointOh'
import { useRealmQuery } from './queries/realm'
import {
  useTokenRecordsByOwnersMap,
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from './queries/tokenOwnerRecord'
import { useRealmConfigQuery } from './queries/realmConfig'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from './queries/mintInfo'
import { useSelectedRealmInfo } from './selectedRealm/useSelectedRealmRegistryEntry'
import { useTokenAccountsByOwnerQuery } from './queries/tokenAccount'

/**
 * @deprecated This hook has been broken up into many smaller hooks, use those instead, DO NOT use this
 */
export default function useRealm() {
  const router = useRouter()
  const { symbol } = router.query

  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { data: tokenAccounts } = useTokenAccountsByOwnerQuery()
  const realm = useRealmQuery().data?.result
  const realmInfo = useSelectedRealmInfo()

  const {
    communityTORsByOwner: tokenRecords,
    councilTORsByOwner: councilTokenOwnerRecords,
  } = useTokenRecordsByOwnersMap()

  const config = useRealmConfigQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result

  const votingPower = useDepositStore((s) => s.state.votingPower)
  const heliumVotingPower = useHeliumVsrStore((s) => s.state.votingPower)
  const nftVotingPower = useNftPluginStore((s) => s.state.votingPower)
  const gatewayVotingPower = useGatewayPluginStore((s) => s.state.votingPower)
  const sbVotingPower = useSwitchboardPluginStore((s) => s.state.votingPower)
  const currentPluginPk = config?.account?.communityTokenConfig.voterWeightAddin
  const pythClient = useVotePluginsClientStore((s) => s.state.pythClient)
  const [pythVoterWeight, setPythVoterWeight] = useState<PythBalance>()
  const isPythclientMode =
    currentPluginPk && PYTH_PLUGINS_PKS.includes(currentPluginPk?.toBase58())

  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result

  //Move to store + move useEffect to main app index,
  //useRealm is used very often across application
  //and in every instance of useRealm it will shot with getMainAccount spamming rpc.
  useEffect(() => {
    const getPythVoterWeight = async () => {
      if (connected && wallet?.publicKey && pythClient && isPythclientMode) {
        const sa = await pythClient.stakeConnection.getMainAccount(
          wallet.publicKey
        )
        const vw = sa?.getVoterWeight(
          await pythClient.stakeConnection.getTime()
        )
        setPythVoterWeight(vw)
      }
    }
    getPythVoterWeight()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [wallet?.publicKey])

  const delegates = useMembersStore((s) => s.compact.delegates)

  const realmTokenAccount = useMemo(
    () =>
      realm &&
      tokenAccounts?.find((a) =>
        a.account.mint.equals(realm.account.communityMint)
      ),
    [realm, tokenAccounts]
  )

  // TODO refactor as query
  // returns array of community tokenOwnerRecords that connected wallet has been delegated
  const ownDelegateTokenRecords = useMemo(() => {
    if (wallet?.connected && wallet.publicKey && tokenRecords) {
      const walletId = wallet.publicKey.toBase58()
      const delegatedWallets = delegates && delegates[walletId]
      if (delegatedWallets?.communityMembers) {
        const communityTokenRecords = delegatedWallets.communityMembers.map(
          (member) => {
            return tokenRecords[member.walletAddress]
          }
        )

        return communityTokenRecords
      }
    }

    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [tokenRecords, wallet, connected])

  const councilTokenAccount = useMemo(
    () =>
      realm &&
      tokenAccounts?.find(
        (a) =>
          realm.account.config.councilMint &&
          a.account.mint.equals(realm.account.config.councilMint)
      ),
    [realm, tokenAccounts]
  )

  // TODO refactor as query
  // returns array of council tokenOwnerRecords that connected wallet has been delegated
  const ownDelegateCouncilTokenRecords = useMemo(() => {
    if (
      wallet?.connected &&
      councilMint &&
      wallet.publicKey &&
      councilTokenOwnerRecords
    ) {
      const walletId = wallet.publicKey.toBase58()
      const delegatedWallets = delegates && delegates[walletId]
      if (delegatedWallets?.councilMembers) {
        const councilTokenRecords = delegatedWallets.councilMembers.map(
          (member) => {
            return councilTokenOwnerRecords[member.walletAddress]
          }
        )

        return councilTokenRecords
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [tokenRecords, wallet, connected])

  const canChooseWhoVote =
    realm?.account.communityMint &&
    (!mint?.supply.isZero() ||
      config?.account.communityTokenConfig.voterWeightAddin) &&
    realm.account.config.councilMint &&
    !councilMint?.supply.isZero()

  //TODO take from realm config when available
  const realmCfgMaxOutstandingProposalCount = 10
  const toManyCommunityOutstandingProposalsForUser =
    ownTokenRecord &&
    ownTokenRecord?.account.outstandingProposalCount >=
      realmCfgMaxOutstandingProposalCount
  const toManyCouncilOutstandingProposalsForUse =
    ownCouncilTokenRecord &&
    ownCouncilTokenRecord?.account.outstandingProposalCount >=
      realmCfgMaxOutstandingProposalCount
  const vsrMode = useVsrMode()
  const isNftMode =
    currentPluginPk && NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58())
  const pythVotingPower = pythVoterWeight?.toBN() || new BN(0)
  const ownVoterWeight = getVoterWeight(
    currentPluginPk,
    ownTokenRecord,
    votingPower,
    nftVotingPower,
    sbVotingPower,
    pythVotingPower,
    gatewayVotingPower,
    ownCouncilTokenRecord,
    heliumVotingPower
  )

  return useMemo(
    () => ({
      /** @deprecated use useRealmQuery */
      //    realm,
      /** @deprecated use useSelectedRealmInfo
       * Legacy hook structure, I suggest using useSelectedRealmRegistryEntry if you want the resgistry entry and useRealmQuery for on-chain data
       */
      realmInfo,
      /** @deprecated just use `useRouter().query` directly... */
      symbol,
      //voteSymbol: realmInfo?.voteSymbol,
      //mint,
      //councilMint,
      //governances,
      /** @deprecated use useRealmProposalsQuery */
      //proposals,
      //tokenRecords,
      realmTokenAccount,
      councilTokenAccount,
      /** @deprecated just use the token owner record directly, ok? */
      ownVoterWeight,
      //realmDisplayName: realmInfo?.displayName ?? realm?.account?.name,
      canChooseWhoVote,
      //councilTokenOwnerRecords,
      toManyCouncilOutstandingProposalsForUse,
      toManyCommunityOutstandingProposalsForUser,
      ownDelegateTokenRecords,
      ownDelegateCouncilTokenRecords,
      //config,
      currentPluginPk,
      vsrMode,
      isNftMode,
    }),
    [
      canChooseWhoVote,
      councilTokenAccount,
      currentPluginPk,
      isNftMode,
      ownDelegateCouncilTokenRecords,
      ownDelegateTokenRecords,
      ownVoterWeight,
      realmInfo,
      realmTokenAccount,
      symbol,
      toManyCommunityOutstandingProposalsForUser,
      toManyCouncilOutstandingProposalsForUse,
      vsrMode,
    ]
  )
}

const getVoterWeight = (
  currentPluginPk: PublicKey | undefined,
  ownTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
  votingPower: BN,
  nftVotingPower: BN,
  sbVotingPower: BN,
  pythVotingPower: BN,
  gatewayVotingPower: BN,
  ownCouncilTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
  heliumVotingPower: BN
) => {
  if (currentPluginPk) {
    if (VSR_PLUGIN_PKS.includes(currentPluginPk.toBase58())) {
      return new VoteRegistryVoterWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        votingPower
      )
    }
    if (HELIUM_VSR_PLUGINS_PKS.includes(currentPluginPk.toBase58())) {
      return new VoteRegistryVoterWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        heliumVotingPower
      )
    }
    if (NFT_PLUGINS_PKS.includes(currentPluginPk.toBase58())) {
      return new VoteNftWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        nftVotingPower
      )
    }
    if (SWITCHBOARD_PLUGINS_PKS.includes(currentPluginPk.toBase58())) {
      return new SwitchboardQueueVoteWeight(ownTokenRecord, sbVotingPower)
    }
    if (PYTH_PLUGINS_PKS.includes(currentPluginPk.toBase58())) {
      return new PythVoterWeight(ownTokenRecord, pythVotingPower)
    }
    if (GATEWAY_PLUGINS_PKS.includes(currentPluginPk.toBase58())) {
      return new SimpleGatedVoterWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        gatewayVotingPower
      )
    }
  }
  return new VoterWeight(ownTokenRecord, ownCouncilTokenRecord)
}
