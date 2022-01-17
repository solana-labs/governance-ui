import { SendTransactionOptions } from '@solana/wallet-adapter-base'
import {
  Keypair,
  TransactionCtorFields,
  TransactionInstruction,
} from '@solana/web3.js'
import { SequenceType } from '@utils/sendTransactions'
import NamedTransaction from '../class/NamedTransaction'

interface NamedTransactionProps extends TransactionCtorFields {
  name?: string
}

interface SignableInstruction {
  instructions: TransactionInstruction
  signers?: Keypair[]
}

interface TransactionFlow {
  name?: string
  opts: SendTransactionOptions
  transactions: NamedTransaction[]
  sequenceType: SequenceType
}

export type { NamedTransactionProps, SignableInstruction, TransactionFlow }
