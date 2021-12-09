import { Program, BN, Provider, Wallet } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  PublicKey,
  Connection,
  Keypair,
} from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import uxdIdl from './uxdIdl'

const createInitializeControllerInstruction = (
  uxdProgramId: PublicKey,
  mintSymbol: string,
  mintDecimals: number,
  authority: PublicKey,
  payer: PublicKey,
  connection: Connection
): TransactionInstruction => {
  // generating a random wallet to be able to instantiate a dummy provider
  const provider = new Provider(
    connection,
    new Wallet(Keypair.generate()),
    Provider.defaultOptions()
  )
  const program = new Program(uxdIdl, uxdProgramId, provider)
  const controller = new Controller(mintSymbol, mintDecimals, uxdProgramId)

  return program.instruction.initializeController(
    controller.bump,
    controller.redeemableMintBump,
    new BN(mintDecimals),
    {
      accounts: {
        authority,
        payer,
        controller: controller.pda,
        redeemableMint: controller.redeemableMintPda,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      options: Provider.defaultOptions(),
    }
  )
}

export default createInitializeControllerInstruction
