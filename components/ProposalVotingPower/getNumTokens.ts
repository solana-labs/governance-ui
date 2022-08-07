import type { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import type { MintInfo } from '@solana/spl-token'
import {
  LOCALNET_REALM_ID as PYTH_LOCALNET_REALM_ID,
  PythBalance,
} from 'pyth-staking-api'
import { BigNumber } from 'bignumber.js'

import { getMintDecimalAmount } from '@tools/sdk/units'
import type {
  VoteRegistryVoterWeight,
  VoteNftWeight,
  SwitchboardQueueVoteWeight,
  PythVoterWeight,
  SimpleGatedVoterWeight,
  VoterWeight,
} from '../../models/voteWeights'
import type { RealmInfo } from '../../models/registry/api'

type OwnVoterWeight =
  | VoteRegistryVoterWeight
  | VoteNftWeight
  | SwitchboardQueueVoteWeight
  | PythVoterWeight
  | SimpleGatedVoterWeight
  | VoterWeight

export default function getNumTokens(
  ownVoterWeight: OwnVoterWeight,
  depositTokenRecord?: ProgramAccount<TokenOwnerRecord>,
  mint?: MintInfo,
  realmInfo?: RealmInfo
) {
  const isPyth =
    realmInfo?.realmId.toBase58() === PYTH_LOCALNET_REALM_ID.toBase58()

  if (isPyth && ownVoterWeight.votingPower) {
    return new BigNumber(
      new PythBalance(ownVoterWeight.votingPower).toBN().toString()
    )
  }

  if (depositTokenRecord && mint) {
    return getMintDecimalAmount(
      mint,
      depositTokenRecord.account.governingTokenDepositAmount
    )
  }

  return new BigNumber('0')
}
