import { Program, BN, utils, Provider, Wallet } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  PublicKey,
  Connection,
  Keypair,
} from '@solana/web3.js'
import uxdIdl from './uxdIdl'

const createInitializeControllerInstruction = (
  uxdProgramId: PublicKey,
  mintDecimals: number,
  authority: PublicKey,
  connection: Connection
): TransactionInstruction => {
  // generating a random wallet to be able to instantiate a dummy provider
  const provider = new Provider(
    connection,
    new Wallet(Keypair.generate()),
    Provider.defaultOptions()
  )
  const program = new Program(uxdIdl, uxdProgramId, provider)

  const [pda, bump] = utils.publicKey.findProgramAddressSync(
    [Buffer.from('CONTROLLER')],
    uxdProgramId
  )
  const [
    redeemableMintPda,
    redeemableMintBump,
  ] = utils.publicKey.findProgramAddressSync(
    [Buffer.from('REDEEMABLE')],
    uxdProgramId
  )

  return program.instruction.initializeController(
    bump,
    redeemableMintBump,
    new BN(mintDecimals),
    {
      accounts: {
        authority: authority,
        controller: pda,
        redeemableMint: redeemableMintPda,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      options: Provider.defaultOptions(),
    }
  )
}

export default createInitializeControllerInstruction
