import { Program, BN, Provider, Wallet, utils } from '@project-serum/anchor'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
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

// derives the canonical token account address for a given wallet and mint
function findAssociatedTokenAddress(
  walletKey: PublicKey,
  mintKey: PublicKey
): PublicKey {
  return findAddr(
    [walletKey.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mintKey.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
}

// simple shorthand
function findAddr(
  seeds: (Buffer | Uint8Array)[],
  programId: PublicKey
): PublicKey {
  return utils.publicKey.findProgramAddressSync(seeds, programId)[0]
}

const createDepositInsuranceToMangoDepositoryInstruction = async (
  connection: Connection,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  depositoryMint: PublicKey,
  insuranceMint: PublicKey,
  insuranceDepositedAmount: number
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
    depositoryMint,
    'collateralName',
    6,
    insuranceMint,
    'USDC',
    6,
    uxdProgramId
  )

  const depositedTokenIndex = mango.group.getTokenIndex(
    depository.insuranceMint
  )
  const mangoCacheAccount = mango.getMangoCacheAccount()
  const mangoRootBankAccount = mango.getRootBankForToken(depositedTokenIndex)
  const mangoNodeBankAccount = mango.getNodeBankFor(
    depositedTokenIndex,
    depository.insuranceMint
  )
  const mangoDepositedVaultAccount = mango.getVaultFor(depositedTokenIndex)
  const authorityInsuranceATA = findAssociatedTokenAddress(
    authority,
    depository.insuranceMint
  )
  const insuranceAmountBN = new BN(
    insuranceDepositedAmount * 10 ** depository.insuranceMintdecimals
  )

  console.log({
    authority: authority.toBase58(),
    controller: controller.pda.toBase58(),
    depository: depository.pda.toBase58(),
    collateralMint: depository.collateralMint.toBase58(),
    insuranceMint: depository.insuranceMint.toBase58(),
    authorityInsurance: authorityInsuranceATA.toBase58(),
    depositoryInsurancePassthroughAccount: depository.insurancePassthroughPda.toBase58(),
    depositoryMangoAccount: depository.mangoAccountPda.toBase58(),
    // mango accounts for CPI
    mangoGroup: mango.group.publicKey.toBase58(),
    mangoCache: mangoCacheAccount.toBase58(),
    mangoRootBank: mangoRootBankAccount.toBase58(),
    mangoNodeBank: mangoNodeBankAccount.toBase58(),
    mangoVault: mangoDepositedVaultAccount.toBase58(),
    //
    tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
    mangoProgram: mango.programId.toBase58(),
  })
  return program.instruction.depositInsuranceToMangoDepository(
    insuranceAmountBN,
    {
      accounts: {
        authority: authority,
        controller: controller.pda,
        depository: depository.pda,
        collateralMint: depository.collateralMint,
        insuranceMint: depository.insuranceMint,
        authorityInsurance: authorityInsuranceATA,
        depositoryInsurancePassthroughAccount:
          depository.insurancePassthroughPda,
        depositoryMangoAccount: depository.mangoAccountPda,
        // mango accounts for CPI
        mangoGroup: mango.group.publicKey,
        mangoCache: mangoCacheAccount,
        mangoRootBank: mangoRootBankAccount,
        mangoNodeBank: mangoNodeBankAccount,
        mangoVault: mangoDepositedVaultAccount,
        //
        tokenProgram: TOKEN_PROGRAM_ID,
        mangoProgram: mango.programId,
      },
      options: Provider.defaultOptions(),
    }
  )
}

export default createDepositInsuranceToMangoDepositoryInstruction
