import { Program, Provider, Wallet } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  PublicKey,
  Connection,
  Keypair,
} from '@solana/web3.js'
import {
  Controller,
  createAndInitializeMango,
  MangoDepository,
} from '@uxdprotocol/uxd-client'
import uxdIdl from './uxdIdl'

const createRegisterMangoDepositoryInstruction = async (
  connection: Connection,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  payer: PublicKey,
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

  const controller = new Controller('UXD', 6, uxdProgramId)
  const depository = new MangoDepository(
    collateralMint,
    'collateralName',
    6,
    insuranceMint,
    'USDC',
    6,
    uxdProgramId
  )

  return program.instruction.registerMangoDepository(
    depository.bump,
    depository.collateralPassthroughBump,
    depository.insurancePassthroughBump,
    depository.mangoAccountBump,
    {
      accounts: {
        authority,
        payer,
        controller: controller.pda,
        depository: depository.pda,
        collateralMint: depository.collateralMint, // BTC/ WSOL.....
        insuranceMint: depository.insuranceMint, // USDC
        depositoryCollateralPassthroughAccount:
          depository.collateralPassthroughPda,
        depositoryInsurancePassthroughAccount:
          depository.insurancePassthroughPda,
        depositoryMangoAccount: depository.mangoAccountPda,
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
