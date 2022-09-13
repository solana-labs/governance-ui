import { Program } from '@project-serum/anchor'
import {
  RpcContext,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { instructions as psyFiInstructions, PsyFiEuros } from 'psyfi-euros-test'
import { PsyFiActionForm, PsyFiStrategyInfo } from '../types'
import { syncNative } from '@solendprotocol/solend-sdk'

export const deposit = async (
  rpcContext: RpcContext,
  treasuryAssetAccount: AssetAccount,
  psyFiProgram: Program<PsyFiEuros>,
  psyFiStrategyInfo: PsyFiStrategyInfo,
  form: PsyFiActionForm,
  owner: PublicKey,
  transferAddress: PublicKey
) => {
  const instructions: InstructionDataWithHoldUpTime[] = []

  let vaultOwnershipAccount: PublicKey | undefined =
    psyFiStrategyInfo.ownedStrategyTokenAccount?.pubkey
  const prerequisiteInstructions: TransactionInstruction[] = []

  let coreDepositIx: TransactionInstruction
  const serializedTransferToReceiptIxs: string[] = []

  // If the lp token account does not exist, add it to the pre-requisite instructions
  if (!vaultOwnershipAccount) {
    const address = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      form.strategy.vaultAccounts.lpTokenMint,
      owner,
      true
    )
    const createAtaIx = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      form.strategy.vaultAccounts.lpTokenMint,
      address,
      owner,
      rpcContext.walletPubkey
    )
    prerequisiteInstructions.push(createAtaIx)
    vaultOwnershipAccount = address
  }

  const poolMintATA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    treasuryAssetAccount.isSol
      ? NATIVE_MINT
      : form.strategy.vaultAccounts.lpTokenMint,
    owner,
    true
  )

  // If the pool mint associated token account does not exist, add it to the pre-requisite instructions
  if (
    (await psyFiProgram.provider.connection.getAccountInfo(poolMintATA)) ===
    null
  ) {
    prerequisiteInstructions.push(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        treasuryAssetAccount.isSol
          ? NATIVE_MINT
          : form.strategy.vaultAccounts.lpTokenMint,
        poolMintATA,
        owner,
        rpcContext.walletPubkey
      )
    )
  }

  if (form.amount && treasuryAssetAccount.isSol) {
    const wsolTransferIx = SystemProgram.transfer({
      fromPubkey: owner,
      toPubkey: poolMintATA,
      lamports: form.amount * LAMPORTS_PER_SOL,
    })

    serializedTransferToReceiptIxs.push(
      serializeInstructionToBase64(wsolTransferIx)
    )
    serializedTransferToReceiptIxs.push(
      serializeInstructionToBase64(syncNative(poolMintATA))
    )
  }

  // Check if the vault requires a deposit receipt
  if (form.strategy.vaultInfo.status.optionsActive) {
    if (!psyFiStrategyInfo.depositReceipt) {
      // Add init deposit receipt instruction
      const initReceiptIx = await psyFiInstructions.initializeDepositReceiptInstruction(
        // @ts-ignore: Anchor version differences.
        psyFiProgram,
        form.strategy.vaultInfo.status.currentEpoch,
        owner,
        form.strategy.vaultAccounts.pubkey
      )
      const uiInstruction: UiInstruction = {
        governance: treasuryAssetAccount.governance,
        serializedInstruction: serializeInstructionToBase64(initReceiptIx),
        prerequisiteInstructions: [],
        chunkSplitByDefault: true,
        isValid: true,
        customHoldUpTime:
          treasuryAssetAccount.governance.account.config
            .minInstructionHoldUpTime,
      }
      const initReceiptFullPropIx = new InstructionDataWithHoldUpTime({
        instruction: uiInstruction,
      })
      instructions.push(initReceiptFullPropIx)
    }

    // Create transfer to deposit receipt instruction
    coreDepositIx = await psyFiInstructions.transferToDepositReceiptInstruction(
      // @ts-ignore: Anchor version differences.
      psyFiProgram,
      form.bnAmount,
      form.strategy.vaultInfo.status.currentEpoch,
      owner,
      form.strategy.vaultAccounts.pubkey,
      transferAddress
    )

    serializedTransferToReceiptIxs.push(
      serializeInstructionToBase64(coreDepositIx)
    )
  } else {
    // Create the actual deposit instruction
    coreDepositIx = await psyFiInstructions.depositInstruction(
      // @ts-ignore: Anchor version differences.
      psyFiProgram,
      form.bnAmount,
      owner,
      form.strategy.vaultAccounts.pubkey,
      transferAddress,
      vaultOwnershipAccount
    )
    serializedTransferToReceiptIxs.push(
      serializeInstructionToBase64(coreDepositIx)
    )
  }

  // Create the InstructionDataWithHoldUpTime
  const uiInstruction: UiInstruction = {
    governance: treasuryAssetAccount.governance,
    serializedInstruction: serializedTransferToReceiptIxs[0],
    additionalSerializedInstructions:
      serializedTransferToReceiptIxs.slice(1) || [],
    prerequisiteInstructions,
    chunkSplitByDefault: true,
    isValid: true,
    customHoldUpTime:
      treasuryAssetAccount.governance.account.config.minInstructionHoldUpTime,
  }
  const fullPropInstruction = new InstructionDataWithHoldUpTime({
    instruction: uiInstruction,
  })
  instructions.push(fullPropInstruction)
  return instructions
}
