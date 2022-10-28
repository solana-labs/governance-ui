import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT as NATIVE_WSOL_MINT,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token'

export default async function addFunds({
  mint,
  treasurer,
  autoWSol,
  allocationAssigned,
}) {
  // Get the treasurer token account
  const treasurerToken = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    treasurer,
    true
  )

  const treasurerTokenInfo = await this.connection.getAccountInfo(
    treasurerToken
  )

  await this.ensureAutoWrapSolInstructions(
    autoWSol,
    new BN(allocationAssigned),
    treasurer,
    treasurerToken,
    treasurerTokenInfo,
    ixs,
    txSigners
  )

  // Add Funds
  return this.program.instruction.addFunds(
    LATEST_IDL_FILE_VERSION,
    new BN(allocationAssigned),
    {
      accounts: {
        payer: treasurer,
        contributor: treasurer,
        contributorToken: treasurerToken,
        treasury: treasury,
        treasuryToken: treasuryToken,
        associatedToken: mint,
        feeTreasury: Constants.FEE_TREASURY,
        feeTreasuryToken: feeTreasuryToken,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  )
}
