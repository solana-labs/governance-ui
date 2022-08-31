import { Wallet } from '@project-serum/anchor'
import { EldRewards, IDL } from '@everlend/core/dist/idl/eld_rewards'
import * as anchor from '@project-serum/anchor'
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from '@solana/web3.js'
import { REWARD_PROGRAM_ID } from './constants'
import { ConnectionContext } from '@utils/connection'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'

const getInitMiningTx = async (
  rewardPool: PublicKey,
  rewardAccount: PublicKey,
  walletPubKey: PublicKey,
  owner: PublicKey,
  connection: ConnectionContext,
  wallet: SignerWalletAdapter,
  CONFIG: PublicKey
): Promise<Transaction> => {
  const provider = new anchor.AnchorProvider(
    connection.current,
    (wallet as unknown) as Wallet,
    {
      commitment: 'processed',
    }
  )
  const rewardProgram = new anchor.Program(
    IDL,
    REWARD_PROGRAM_ID,
    provider
  ) as anchor.Program<EldRewards>
  const tx = new Transaction()
  if (!walletPubKey) return tx

  tx.add(
    rewardProgram.transaction.initializeMining({
      accounts: {
        config: CONFIG,
        rewardPool,
        mining: rewardAccount,
        user: owner,
        payer: owner,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    })
  )

  tx.feePayer = walletPubKey
  tx.recentBlockhash = (await connection.current.getLatestBlockhash()).blockhash

  return tx
}

export { getInitMiningTx }
