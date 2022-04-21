import { BN, PublicKey } from '@blockworks-foundation/mango-client'
import { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import { isPublicKey } from '@tools/core/pubkey'
import { useRouter } from 'next/router'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { useMemo, useState } from 'react'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import {
  createUnchartedRealmInfo,
  getCertifiedRealmInfo,
  RealmInfo,
} from '../models/registry/api'
import {
  VoteNftWeight,
  SwitchboardQueueVoteWeight,
  VoteRegistryVoterWeight,
  VoterWeight,
} from '../models/voteWeights'

import { QUEUE_LIST,  } from '../SwitchboardVotePlugin/SwitchboardQueueVoterClient';
import { Switchboard, IDL } from '../SwitchboardVotePlugin/SwitchboardIdl';
import * as sbv2 from "../../switchboardv2-api";
import * as anchor from "@project-serum/anchor";

import useWalletStore from '../stores/useWalletStore'
import {
  nftPluginsPks,
  vsrPluginsPks,
  switchboardPluginsPks,
} from './useVotingPlugins'

export default function useRealm() {
  const router = useRouter()
  const { symbol } = router.query
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  /*const provider = new anchor.Provider(connection, wallet);
  const switchboardProgram = new anchor.Program<Switchboard>(IDL, new PublicKey("7PMP6yE6qb3XzBQr5TK2GhuruYayZzBnT8U92ySaLESC"), provider);*/
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
  const [realmInfo, setRealmInfo] = useState<RealmInfo | undefined>(undefined)
  const { getQueuesForSelectedRealm } = useWalletStore((s) => s.actions);
  //getQueuesForSelectedRealm();

  //const anchorProvider = new anchor.AnchorProvider(connection, wallet);

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

  const ownTokenRecord = useMemo(
    () =>
      wallet?.connected && wallet.publicKey
        ? tokenRecords[wallet.publicKey.toBase58()]
        : undefined,
    [tokenRecords, wallet, connected]
  )

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

  const ownCouncilTokenRecord = useMemo(
    () =>
      wallet?.connected && councilMint && wallet.publicKey
        ? councilTokenOwnerRecords[wallet.publicKey.toBase58()]
        : undefined,
    [tokenRecords, wallet, connected]
  )

  const switchboardVotingPower = useMemo(
    () => {
      //console.log("Realm!!!!");
      const provider = new anchor.Provider(connection, wallet);
      //const idl = await anchor.Program.fetchIdl(new PublicKey("7PMP6yE6qb3XzBQr5TK2GhuruYayZzBnT8U92ySaLESC"), provider);
      //console.log("The IDL");
      //console.log(IDL);
      const switchboardProgram = new anchor.Program(IDL, new PublicKey("7PMP6yE6qb3XzBQr5TK2GhuruYayZzBnT8U92ySaLESC"), provider);
      let queues = QUEUE_LIST.map((q) => {
        let queue = new sbv2.OracleQueueAccount({
          program: switchboardProgram,
          publicKey: q
        });
        console.log(queue);
        queue.loadData().then((d) => console.log);
      });
    },
    [realm, wallet, connected]
  );

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

  const currentPluginPk = config?.account?.communityVoterWeightAddin

  const ownVoterWeight = getVoterWeight(
    currentPluginPk,
    ownTokenRecord,
    votingPower,
    nftVotingPower,
    ownCouncilTokenRecord,
    realm,
    wallet,
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
    config,
  }
}

const getVoterWeight = (
  currentPluginPk: PublicKey | undefined,
  ownTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
  votingPower: BN,
  nftVotingPower: BN,
  ownCouncilTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
  realm: PublicKey | undefined,
  wallet: PublicKey | undefined,
) => {
  if (currentPluginPk) {
    if (vsrPluginsPks.includes(currentPluginPk.toBase58())) {
      return new VoteRegistryVoterWeight(ownTokenRecord, votingPower)
    }
    if (nftPluginsPks.includes(currentPluginPk.toBase58())) {
      return new VoteNftWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        nftVotingPower
      )
    }
    if (switchboardPluginsPks.includes(currentPluginPk.toBase58())) {
      //return new VoteRegistryVoterWeight(ownTokenRecord, votingPower)
      //QUEUE_LIST.map((x) => {
        /*let q = new sbv2.OracleQueueAccount({
          program: switchboardProgram,
          publicKey: x,
        });
        console.log(q);*/
      //});
      return new SwitchboardQueueVoteWeight
    }
  }
  return new VoterWeight(ownTokenRecord, ownCouncilTokenRecord)
}
