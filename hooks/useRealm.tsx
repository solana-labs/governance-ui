import { BN, PublicKey } from '@blockworks-foundation/mango-client'
import { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import { isPublicKey } from '@tools/core/pubkey'
import { useRouter } from 'next/router'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { PythBalance } from 'pyth-staking-api'
import { useEffect, useMemo, useState } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import {
  createUnchartedRealmInfo,
  getCertifiedRealmInfo,
  RealmInfo,
} from '../models/registry/api'
import {
  PythVoterWeight,
  SimpleGatedVoterWeight,
  VoteNftWeight,
  SwitchboardQueueVoteWeight,
  VoteRegistryVoterWeight,
  VoterWeight,
} from '../models/voteWeights'
import useMembersStore from 'stores/useMembersStore'
import useWalletStore from '../stores/useWalletStore'
import {
  nftPluginsPks,
  vsrPluginsPks,
  switchboardPluginsPks,
  pythPluginsPks,
  gatewayPluginsPks,
} from './useVotingPlugins'
import useGatewayPluginStore from '../GatewayPlugin/store/gatewayPluginStore'
import useSwitchboardPluginStore from 'SwitchboardVotePlugin/store/switchboardStore'

export default function useRealm() {
  const router = useRouter()
  const { symbol } = router.query
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const tokenAccounts = useWalletStore((s) => s.tokenAccounts)
  const {
    realm,
    mint,
    councilMint,
    governances,
    proposals,
    tokenRecords,
    councilTokenOwnerRecords,
    programVersion,
    config,
  } = useWalletStore((s) => s.selectedRealm)
  const votingPower = useDepositStore((s) => s.state.votingPower)
  const nftVotingPower = useNftPluginStore((s) => s.state.votingPower)
  const gatewayVotingPower = useGatewayPluginStore((s) => s.state.votingPower)
  const sbVotingPower = useSwitchboardPluginStore((s) => s.state.votingPower)
  const [realmInfo, setRealmInfo] = useState<RealmInfo | undefined>(undefined)
  const currentPluginPk = config?.account?.communityVoterWeightAddin
  const pythClient = useVotePluginsClientStore((s) => s.state.pythClient)
  const [pythVoterWeight, setPythVoterWeight] = useState<PythBalance>()
  const isPythclientMode =
    currentPluginPk && pythPluginsPks.includes(currentPluginPk?.toBase58())

  //Move to store + move useEffect to main app index,
  //useRealm is used very often across application
  //and in every instance of useRealm it will shot with getMainAccount spamming rpc.
  useEffect(() => {
    const getPythVoterWeight = async () => {
      if (connected && wallet?.publicKey && pythClient && isPythclientMode) {
        console.log('@@@@@@@@@@@')
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
  }, [wallet?.publicKey])

  const delegates = useMembersStore((s) => s.compact.delegates)
  const selectedCouncilDelegate = useWalletStore(
    (s) => s.selectedCouncilDelegate
  )
  const selectedCommunityDelegate = useWalletStore(
    (s) => s.selectedCommunityDelegate
  )

  useMemo(async () => {
    let realmInfo = isPublicKey(symbol as string)
      ? realm
        ? // Realm program data needs to contain config options to enable/disable things such as notifications
          // Currently defaulting to false here for now
          createUnchartedRealmInfo(realm)
        : undefined
      : getCertifiedRealmInfo(symbol as string, connection)

    if (realmInfo) {
      realmInfo = { ...realmInfo, programVersion: programVersion }
    }
    // Do not set realm info until the programVersion  is resolved
    if (programVersion) {
      setRealmInfo(realmInfo)
    }
  }, [symbol, realm, programVersion])

  const realmTokenAccount = useMemo(
    () =>
      realm &&
      tokenAccounts.find((a) =>
        a.account.mint.equals(realm.account.communityMint)
      ),
    [realm, tokenAccounts]
  )

  const ownTokenRecord = useMemo(() => {
    if (wallet?.connected && wallet.publicKey) {
      if (
        selectedCommunityDelegate &&
        tokenRecords[selectedCommunityDelegate]
      ) {
        return tokenRecords[selectedCommunityDelegate]
      }

      return tokenRecords[wallet.publicKey.toBase58()]
    }
    return undefined
  }, [tokenRecords, wallet, connected, selectedCommunityDelegate])

  // returns array of community tokenOwnerRecords that connected wallet has been delegated
  const ownDelegateTokenRecords = useMemo(() => {
    if (wallet?.connected && wallet.publicKey) {
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
  }, [tokenRecords, wallet, connected])

  const councilTokenAccount = useMemo(
    () =>
      realm &&
      councilMint &&
      tokenAccounts.find(
        (a) =>
          realm.account.config.councilMint &&
          a.account.mint.equals(realm.account.config.councilMint)
      ),
    [realm, tokenAccounts]
  )

  const ownCouncilTokenRecord = useMemo(() => {
    if (wallet?.connected && councilMint && wallet.publicKey) {
      if (
        selectedCouncilDelegate &&
        councilTokenOwnerRecords[selectedCouncilDelegate]
      ) {
        return councilTokenOwnerRecords[selectedCouncilDelegate]
      }

      return councilTokenOwnerRecords[wallet.publicKey.toBase58()]
    }
    return undefined
  }, [tokenRecords, wallet, connected, selectedCouncilDelegate])

  // returns array of council tokenOwnerRecords that connected wallet has been delegated
  const ownDelegateCouncilTokenRecords = useMemo(() => {
    if (wallet?.connected && councilMint && wallet.publicKey) {
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
  }, [tokenRecords, wallet, connected])

  const canChooseWhoVote =
    realm?.account.communityMint &&
    (!mint?.supply.isZero() ||
      realm.account.config.useCommunityVoterWeightAddin) &&
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
  //based on realm config it will provide proper tokenBalanceCardComponent
  const isLockTokensMode =
    currentPluginPk && vsrPluginsPks.includes(currentPluginPk?.toBase58())
  const isNftMode =
    currentPluginPk && nftPluginsPks.includes(currentPluginPk?.toBase58())
  const pythVotingPower = pythVoterWeight?.toBN() || new BN(0)
  const ownVoterWeight = getVoterWeight(
    currentPluginPk,
    ownTokenRecord,
    votingPower,
    nftVotingPower,
    sbVotingPower,
    pythVotingPower,
    gatewayVotingPower,
    ownCouncilTokenRecord
  )
  return {
    realm,
    realmInfo,
    symbol,
    mint,
    councilMint,
    governances,
    proposals,
    tokenRecords,
    realmTokenAccount,
    ownTokenRecord,
    councilTokenAccount,
    ownCouncilTokenRecord,
    ownVoterWeight,
    realmDisplayName: realmInfo?.displayName ?? realm?.account?.name,
    canChooseWhoVote,
    councilTokenOwnerRecords,
    toManyCouncilOutstandingProposalsForUse,
    toManyCommunityOutstandingProposalsForUser,
    ownDelegateTokenRecords,
    ownDelegateCouncilTokenRecords,
    config,
    currentPluginPk,
    isLockTokensMode,
    isNftMode,
  }
}

const getVoterWeight = (
  currentPluginPk: PublicKey | undefined,
  ownTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
  votingPower: BN,
  nftVotingPower: BN,
  sbVotingPower: BN,
  pythVotingPower: BN,
  gatewayVotingPower: BN,
  ownCouncilTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined
) => {
  if (currentPluginPk) {
    if (vsrPluginsPks.includes(currentPluginPk.toBase58())) {
      return new VoteRegistryVoterWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        votingPower
      )
    }
    if (nftPluginsPks.includes(currentPluginPk.toBase58())) {
      return new VoteNftWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        nftVotingPower
      )
    }
    if (switchboardPluginsPks.includes(currentPluginPk.toBase58())) {
      return new SwitchboardQueueVoteWeight(ownTokenRecord, sbVotingPower)
    }
    if (pythPluginsPks.includes(currentPluginPk.toBase58())) {
      return new PythVoterWeight(ownTokenRecord, pythVotingPower)
    }
    if (gatewayPluginsPks.includes(currentPluginPk.toBase58())) {
      return new SimpleGatedVoterWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        gatewayVotingPower
      )
    }
  }
  return new VoterWeight(ownTokenRecord, ownCouncilTokenRecord)
}
