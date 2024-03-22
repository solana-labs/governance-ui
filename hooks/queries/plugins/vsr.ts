import { BN, EventParser, Program } from '@coral-xyz/anchor'
import { PublicKey, Transaction, Connection } from '@solana/web3.js'
import { SIMULATION_WALLET } from '@tools/constants'
import { getRegistrarPDA, getVoterPDA } from 'VoteStakeRegistry/sdk/accounts'
import { fetchRealmByPubkey, useRealmQuery } from '../realm'
import {
  VoterStakeRegistry,
  IDL,
} from 'VoteStakeRegistry/sdk/voter_stake_registry'
import { fetchRealmConfigQuery, useRealmConfigQuery } from '../realmConfig'
import queryClient from '../queryClient'
import { useConnection } from '@solana/wallet-adapter-react'
import useUserOrDelegator from '@hooks/useUserOrDelegator'
import { getLockTokensVotingPowerPerWallet } from 'VoteStakeRegistry/tools/deposits'
import { useQuery } from '@tanstack/react-query'
import { findPluginName } from '@constants/plugins'
import {useVsrClient} from "../../../VoterWeightPlugins/useVsrClient";
import {getPluginClientCachedWithEmptySigner} from "@hooks/queries/pluginRegistrar";

const VOTER_INFO_EVENT_NAME = 'VoterInfo'

export const vsrQueryKeys = {
  all: (connection: Connection) => [connection.rpcEndpoint, 'VSR'],
  allVotingPower: (connection: Connection, pluginId: PublicKey) => [
    ...vsrQueryKeys.all(connection),
    pluginId.toString(),
    'voting power',
  ],
  votingPower: (
    connection: Connection,
    pluginId: PublicKey,
    registrarPk: PublicKey,
    voterPk: PublicKey
  ) => [
    ...vsrQueryKeys.allVotingPower(connection, pluginId),
    registrarPk.toString(),
    voterPk.toString(),
  ],
}

// @deprecated - use the vsr voting client instead (useVsrClient), or preferably just obtain the weight generically for all plugins using
// useRealmVoterWeightPlugins().totalCalculatedVoterWeight
export const getVsrGovpower = async (
  connection: Connection,
  realmPk: PublicKey,
  walletPk: PublicKey
) => {
  const { result: realm } = await fetchRealmByPubkey(connection, realmPk)
  if (realm === undefined) throw new Error()
  const plugin = await getPluginClientCachedWithEmptySigner(realmPk, connection, walletPk, 'VSR', 'voterWeight');
  const votingPower =await plugin?.client?.calculateVoterWeight(
    walletPk,
    realmPk,
    realm.account.communityMint,
    new BN(0) // technically incorrect. Should obtain the voter weight from the input TOR
  );

  if (!votingPower) {
    return {found: false, result: undefined} as const
  }

  return { found: true, result: votingPower }
}

const extractVotingPowerFromSimulation = (
  logs: Awaited<ReturnType<typeof voterPowerLogQueryFn>>
) => {
  const votingPowerEntry = logs.find((x) => x.name === VOTER_INFO_EVENT_NAME)
  const votingPower = votingPowerEntry
    ? ({
        found: true,
        result: votingPowerEntry.data.votingPower as BN,
      } as const)
    : ({ found: false, result: undefined } as const)
  return votingPower
}

const votingPowerQueryFn = async (
  connection: Connection,
  pluginId: PublicKey,
  registrarPk: PublicKey,
  voterPk: PublicKey
) => {
  const program = new Program<VoterStakeRegistry>(IDL, pluginId, {
    connection,
  })
  const logs = await fetchVotingPowerSimulation(
    connection,
    program,
    registrarPk,
    voterPk
  )
  const votingPower = extractVotingPowerFromSimulation(logs)
  return votingPower
}

export const fetchVotingPower = (
  connection: Connection,
  pluginId: PublicKey,
  registrarPk: PublicKey,
  voterPk: PublicKey
) =>
  queryClient.fetchQuery({
    queryKey: vsrQueryKeys.votingPower(
      connection,
      pluginId,
      registrarPk,
      voterPk
    ),
    queryFn: () =>
      votingPowerQueryFn(connection, pluginId, registrarPk, voterPk),
  })

export const fetchVotingPowerSimulation = (
  connection: Connection,
  program: Program<VoterStakeRegistry>,
  registrarPk: PublicKey,
  voterPk: PublicKey,
  depositEntryBegin = 0,
  depositEntryCount = 0
) =>
  queryClient.fetchQuery({
    queryKey: [
      connection.rpcEndpoint,
      'VSR',
      'voting power',
      'simulation',
      registrarPk.toString(),
      voterPk.toString(),
      depositEntryBegin,
      depositEntryCount,
    ],
    queryFn: () =>
      voterPowerLogQueryFn(
        connection,
        program,
        registrarPk,
        voterPk,
        depositEntryBegin,
        depositEntryCount
      ),
  })

export const useRegistrarPk = () => {
  const realm = useRealmQuery().data?.result
  const communityMintPk = realm?.account.communityMint
  const config = useRealmConfigQuery().data?.result
  const programId = config?.account.communityTokenConfig.voterWeightAddin
  return realm &&
      communityMintPk &&
      programId &&
      getRegistrarPDA(realm.pubkey, communityMintPk, programId)
}

export const useVoterPk = (walletPk: PublicKey | undefined) => {
  const registrar = useRegistrarPk()
  const config = useRealmConfigQuery().data?.result
  const programId = config?.account.communityTokenConfig.voterWeightAddin

  return registrar &&
      walletPk &&
      programId &&
      getVoterPDA(registrar.registrar, walletPk, programId);
}

export const useVsrGovpower = () => {
  const { connection } = useConnection()
  const actingAsWallet = useUserOrDelegator()
  const config = useRealmConfigQuery().data?.result
  const pluginId = config?.account.communityTokenConfig.voterWeightAddin
  const voterPk = useVoterPk(actingAsWallet)?.voter
  const registrarPk = useRegistrarPk()?.registrar
  const pluginName = findPluginName(pluginId)

  const enabled =
    pluginName === 'VSR' &&
    !(
      pluginId === undefined ||
      registrarPk === undefined ||
      voterPk === undefined
    )
  return useQuery({
    enabled,
    queryKey: enabled
      ? vsrQueryKeys.votingPower(connection, pluginId, registrarPk, voterPk)
      : undefined,
    queryFn: () => {
      if (!enabled) throw new Error()
      return votingPowerQueryFn(connection, pluginId, registrarPk, voterPk)
    },
  })
}

/**
 * this code is based on VoteStakeRegistry/tools/deposits.ts
 */
const voterPowerLogQueryFn = async (
  connection: Connection,
  program: Program<VoterStakeRegistry>,
  registrar: PublicKey,
  voter: PublicKey,
  depositEntryBegin = 0,
  depositEntryCount = 0
) => {
  const ix = await program.methods
    .logVoterInfo(depositEntryBegin, depositEntryCount)
    .accounts({ registrar, voter })
    .instruction()
  const transaction = new Transaction({
    feePayer: new PublicKey(SIMULATION_WALLET),
  }).add(ix)
  const sim = await connection.simulateTransaction(transaction)
  const parser = new EventParser(program.programId, program.coder)
  if (sim.value.logs === null) {
    console.error('log_voter_info returned no logs')
    return []
  }
  return [...parser.parseLogs(sim.value.logs)]
}

// TODO, use batshit to batch this, i guess.
export const useVsrGovpowerMulti = (wallets: PublicKey[] | undefined) => {
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result
  const { vsrClient } = useVsrClient();

  return useQuery({
    enabled: wallets !== undefined && wallets.length > 0,
    queryKey: [
      vsrQueryKeys.all(connection),
      'VSR',
      'voting power',
      'simulation',
      'multi',
      wallets?.map((x) => x.toString()).toString(),
    ],
    queryFn: async () => {
      console.log('vsr multi govpower CALLED')
      if (realm === undefined) return undefined
      if (wallets === undefined) return undefined
      if (wallets.length === 0) return {}
      const config = await fetchRealmConfigQuery(connection, realm.pubkey)
      const programId =
        config.result?.account.communityTokenConfig.voterWeightAddin
      if (!vsrClient || programId === undefined) return undefined

      const x = await getLockTokensVotingPowerPerWallet(
        wallets,
        realm,
          vsrClient,
        connection
      )

      const { registrar: registrarPk } = getRegistrarPDA(
          realm.pubkey,
          realm.account.communityMint,
          programId
      )

      for (const [key, power] of Object.entries(x)) {
        const { voter: voterPk } = getVoterPDA(
          registrarPk,
          new PublicKey(key),
          programId
        )

        queryClient.setQueryData(
          vsrQueryKeys.votingPower(connection, programId, registrarPk, voterPk),
          { found: true, result: power }
        )
      }

      return x
    },
  })
}
