import { BN, EventParser, Program } from '@coral-xyz/anchor'
import { PublicKey, Transaction, Connection } from '@solana/web3.js'
import { SIMULATION_WALLET } from '@tools/constants'
import { getRegistrarPDA, getVoterPDA } from 'VoteStakeRegistry/sdk/accounts'
import { fetchRealmByPubkey } from '../realm'
import {
  VoterStakeRegistry,
  IDL,
} from 'VoteStakeRegistry/sdk/voter_stake_registry'
import { fetchRealmConfigQuery } from '../realmConfig'
import queryClient from '../queryClient'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import useUserOrDelegator from '@hooks/useUserOrDelegator'
import { useAsync } from 'react-async-hook'

const VOTER_INFO_EVENT_NAME = 'VoterInfo'

export const getVsrGovpower = async (
  connection: Connection,
  realmPk: PublicKey,
  walletPk: PublicKey
) => {
  const { result: realm } = await fetchRealmByPubkey(connection, realmPk)
  if (realm === undefined) throw new Error()
  const communityMintPk = realm.account.communityMint
  const config = await fetchRealmConfigQuery(connection, realmPk)
  const programId = config.result?.account.communityTokenConfig.voterWeightAddin
  if (programId === undefined)
    return { found: false, result: undefined } as const

  const program = new Program<VoterStakeRegistry>(IDL, programId, {
    connection,
  })

  const { registrar: registrarPk } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    programId
  )
  const { voter: voterPk } = await getVoterPDA(registrarPk, walletPk, programId)

  const logs = await queryClient.fetchQuery({
    queryKey: [
      connection.rpcEndpoint,
      'VSR: get vote power log',
      registrarPk.toString(),
      voterPk.toString(),
    ],
    queryFn: () =>
      voterPowerLogQueryFn(connection, program, registrarPk, voterPk),
  })

  const votingPowerEntry = logs.find((x) => x.name === VOTER_INFO_EVENT_NAME)
  return votingPowerEntry
    ? ({
        found: true,
        result: votingPowerEntry.data.votingPower as BN,
      } as const)
    : ({ found: false, result: undefined } as const)
}

export const useVsrGovpower = () => {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()
  const actingAsWallet = useUserOrDelegator()
  return useAsync(async () => {
    if (realmPk === undefined || actingAsWallet === undefined) return undefined
    return getVsrGovpower(connection, realmPk, actingAsWallet)
  }, [connection, realmPk, actingAsWallet])
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
