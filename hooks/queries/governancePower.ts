import { Connection, PublicKey } from '@solana/web3.js'
import { fetchTokenOwnerRecordByPubkey } from './tokenOwnerRecord'
import BN from 'bn.js'

export const getVanillaGovpower = async (
  connection: Connection,
  tokenOwnerRecord: PublicKey
) => {
  const torAccount = await fetchTokenOwnerRecordByPubkey(
    connection,
    tokenOwnerRecord
  )
  return torAccount.result
    ? torAccount.result.account.governingTokenDepositAmount
    : new BN(0)
}

export const getNftGovpower = async (
  connection: Connection,
  tokenOwnerRecord: PublicKey
) => {}
