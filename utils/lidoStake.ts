import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import BN from 'bn.js'
import * as BufferLayout from 'buffer-layout'

const calculateReserveAccount = async (lidoAddress, programId) => {
  const bufferArray = [lidoAddress.toBuffer(), Buffer.from('reserve_account')]

  const reserve = await PublicKey.findProgramAddress(bufferArray, programId)

  return reserve[0]
}

const calculateMintAuthority = async (lidoAddress, programId) => {
  const bufferArray = [lidoAddress.toBuffer(), Buffer.from('mint_authority')]

  const mint = await PublicKey.findProgramAddress(bufferArray, programId)

  return mint[0]
}

const getDepositKeys = async (
  payer,
  recipient,
  { lidoAddress, stSolMint, programId }
) => {
  const reserveAccount = await calculateReserveAccount(lidoAddress, programId)
  const mintAuthority = await calculateMintAuthority(lidoAddress, programId)

  return [
    {
      pubkey: lidoAddress,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: payer, isSigner: true, isWritable: true },
    {
      pubkey: recipient,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: stSolMint,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: reserveAccount, isSigner: false, isWritable: true },
    { pubkey: mintAuthority, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ]
}

const depositInstruction = async (
  payer,
  amount,
  recipient,
  transaction,
  config
) => {
  const { programId } = config
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    BufferLayout.nu64('amount'),
  ])

  const data = Buffer.alloc(dataLayout.span)
  dataLayout.encode(
    {
      instruction: 1,
      amount: new BN(amount),
    },
    data
  )

  const keys = await getDepositKeys(payer, recipient, config)

  transaction.add(
    new TransactionInstruction({
      keys,
      programId,
      data,
    })
  )
}

export const lidoStake = async ({
  connection,
  payer,
  stSolAddress,
  amount,
  config,
}) => {
  const transaction = new Transaction({ feePayer: payer })
  const { blockhash } = await connection.getRecentBlockhash()
  transaction.recentBlockhash = blockhash

  await depositInstruction(payer, amount, stSolAddress, transaction, config)

  return transaction
}
