import { Program, utils, Provider, Wallet } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  PublicKey,
  Connection,
  Keypair,
} from '@solana/web3.js'
import { createAndInitializeMango } from '@uxdprotocol/uxd-client'
import uxdIdl from './uxdIdl'

const createRegisterMangoDepositoryInstruction = async (
  connection: Connection,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  collateralMint: PublicKey,
  insuranceMint: PublicKey
): Promise<TransactionInstruction> => {
  // generating a random wallet to be able to instantiate a dummy provider
  const provider = new Provider(
    connection,
    new Wallet(Keypair.generate()),
    Provider.defaultOptions()
  )
  const mango = await createAndInitializeMango(provider, 'devnet')
  const program = new Program(uxdIdl, uxdProgramId, provider)
  const [controllerPda] = utils.publicKey.findProgramAddressSync(
    [Buffer.from('CONTROLLER')],
    uxdProgramId
  )

  console.log('uxdProgramId', uxdProgramId)
  console.log('authority', authority)
  console.log('collateralMint', collateralMint)
  console.log('insuranceMint', insuranceMint)

  const [
    depositoryPda,
    depositoryBump,
  ] = utils.publicKey.findProgramAddressSync(
    [Buffer.from('MANGODEPOSITORY'), collateralMint.toBuffer()],
    uxdProgramId
  )

  const [
    collateralPassthroughPda,
    collateralPassthroughBump,
  ] = utils.publicKey.findProgramAddressSync(
    [Buffer.from('COLLATERALPASSTHROUGH'), collateralMint.toBuffer()],
    uxdProgramId
  )
  const [
    insurancePassthroughPda,
    insurancePassthroughBump,
  ] = utils.publicKey.findProgramAddressSync(
    [
      Buffer.from('INSURANCEPASSTHROUGH'),
      collateralMint.toBuffer(),
      insuranceMint.toBuffer(),
    ],
    uxdProgramId
  )
  const [
    mangoAccountPda,
    mangoAccountBump,
  ] = utils.publicKey.findProgramAddressSync(
    [Buffer.from('MANGOACCOUNT'), collateralMint.toBuffer()],
    uxdProgramId
  )

  return program.instruction.registerMangoDepository(
    depositoryBump,
    collateralPassthroughBump,
    insurancePassthroughBump,
    mangoAccountBump,
    {
      accounts: {
        authority: authority,
        controller: controllerPda,
        depository: depositoryPda,
        collateralMint, // BTC/ WSOL.....
        insuranceMint, // USDC
        depositoryCollateralPassthroughAccount: collateralPassthroughPda,
        depositoryInsurancePassthroughAccount: insurancePassthroughPda,
        depositoryMangoAccount: mangoAccountPda,
        mangoGroup: mango.group.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        mangoProgram: mango.programId,
      },
      options: Provider.defaultOptions(),
    }
  )
}

export default createRegisterMangoDepositoryInstruction
