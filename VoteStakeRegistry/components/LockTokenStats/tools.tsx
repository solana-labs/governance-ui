import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import {
  ProposalTransaction,
  getGovernanceSchemaForAccount,
  getAccountTypes,
  GovernanceAccountClass,
  deserializeBorsh,
  ProgramAccount,
  GovernanceAccountType,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import axios from 'axios'
import { Deposit } from 'VoteStakeRegistry/sdk/accounts'

export interface DepositWithWallet {
  voter: PublicKey
  wallet: PublicKey
  deposit: Deposit
}

//TODO fcn specific to grant instruction => make it generic for all governanceAccounts and move to sdk
export const getProposalsTransactions = async (
  pubkeys: PublicKey[],
  connection: ConnectionContext,
  programId: PublicKey
) => {
  const getTransactions = await axios.request({
    url: connection.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify([
      ...pubkeys.map((x) => {
        return {
          jsonrpc: '2.0',
          id: 1,
          method: 'getProgramAccounts',
          params: [
            programId.toBase58(),
            {
              commitment: connection.current.commitment,
              encoding: 'base64',
              filters: [
                {
                  memcmp: {
                    offset: 0, // number of bytes
                    bytes: bs58.encode(
                      Uint8Array.from([
                        GovernanceAccountType.ProposalTransactionV2,
                      ])
                    ), // base58 encoded string
                  },
                },
                {
                  memcmp: {
                    offset: 1,
                    bytes: x.toBase58(),
                  },
                },
              ],
            },
          ],
        }
      }),
    ]),
  })

  const accounts: ProgramAccount<ProposalTransaction>[] = []
  const rawAccounts = getTransactions.data
    ? getTransactions.data.flatMap((x) => x.result)
    : []
  for (const rawAccount of rawAccounts) {
    try {
      const getSchema = getGovernanceSchemaForAccount
      const data = Buffer.from(rawAccount.account.data[0], 'base64')
      const accountTypes = getAccountTypes(
        (ProposalTransaction as any) as GovernanceAccountClass
      )
      const account: ProgramAccount<ProposalTransaction> = {
        pubkey: new PublicKey(rawAccount.pubkey),
        account: deserializeBorsh(
          getSchema(accountTypes[1]),
          ProposalTransaction,
          data
        ),
        owner: new PublicKey(rawAccount.account.owner),
      }

      accounts.push(account)
    } catch (ex) {
      console.info(`Can't deserialize @ ${rawAccount.pubkey}, ${ex}.`)
    }
  }
  return accounts
}
