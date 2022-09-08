import {
  ConnectedVoltSDK,
  FriktionSDK,
  PendingDepositWithKey,
  VoltSDK,
} from '@friktion-labs/friktion-sdk'
import { WSOL_MINT } from '@components/instructions/tools'
import Decimal from 'decimal.js'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import {
  Account,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import type { ConnectionContext } from 'utils/connection'
import { getATA } from '../../ataTools'
import { UiInstruction } from '../../uiTypes/proposalCreationTypes'
import { validateInstruction } from '@utils/instructionTools'
import { AssetAccount } from '@utils/uiTypes/assets'

export async function getFriktionDepositInstruction({
  schema,
  form,
  amount,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: any
  amount: number
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  const voltVaultId = new PublicKey(form.voltVaultId as string)

  const signers: Keypair[] = []
  if (
    isValid &&
    amount &&
    governedTokenAccount?.extensions.token?.publicKey &&
    governedTokenAccount?.extensions.token &&
    governedTokenAccount?.extensions.mint?.account &&
    governedTokenAccount?.governance &&
    wallet
  ) {
    const sdk = new FriktionSDK({
      provider: {
        connection: connection.current,
        wallet: wallet as any,
      },
    })
    const cVoltSDK = new ConnectedVoltSDK(
      connection.current,
      wallet.publicKey as PublicKey,
      await sdk.loadVoltAndExtraDataByKey(voltVaultId),
      governedTokenAccount.governance.pubkey
    )

    const vaultMint = cVoltSDK.voltVault.vaultMint

    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection: connection,
      receiverAddress: governedTokenAccount.governance.pubkey,
      mintPK: vaultMint,
      wallet,
    })
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          vaultMint, // mint
          receiverAddress, // ata
          governedTokenAccount.governance.pubkey, // owner of token account
          wallet.publicKey! // fee payer
        )
      )
    }

    let depositTokenAccountKey: PublicKey | null

    if (governedTokenAccount.isSol) {
      const { currentAddress: receiverAddress, needToCreateAta } = await getATA(
        {
          connection: connection,
          receiverAddress: governedTokenAccount.governance.pubkey,
          mintPK: new PublicKey(WSOL_MINT),
          wallet,
        }
      )
      if (needToCreateAta) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            new PublicKey(WSOL_MINT), // mint
            receiverAddress, // ata
            governedTokenAccount.governance.pubkey, // owner of token account
            wallet.publicKey! // fee payer
          )
        )
      }
      depositTokenAccountKey = receiverAddress
    } else {
      depositTokenAccountKey = governedTokenAccount.extensions.transferAddress!
    }

    try {
      let decimals = 9

      if (!governedTokenAccount.isSol) {
        const underlyingAssetMintInfo = await new Token(
          connection.current,
          governedTokenAccount.extensions.mint.publicKey,
          TOKEN_PROGRAM_ID,
          (null as unknown) as Account
        ).getMintInfo()
        decimals = underlyingAssetMintInfo.decimals
      }

      const depositIx = governedTokenAccount.isSol
        ? await cVoltSDK.depositWithClaim(
            new Decimal(amount),
            depositTokenAccountKey,
            receiverAddress,
            true,
            governedTokenAccount.extensions.transferAddress!,
            governedTokenAccount.governance.pubkey,
            decimals
          )
        : await cVoltSDK.depositWithClaim(
            new Decimal(amount),
            depositTokenAccountKey,
            receiverAddress,
            false,
            undefined,
            governedTokenAccount.governance.pubkey,
            decimals
          )

      if (governedTokenAccount.isSol) {
        const transferAddressIndex = depositIx.keys.findIndex(
          (k) =>
            k.pubkey.toString() ===
            governedTokenAccount.extensions.transferAddress?.toString()
        )
        depositIx.keys[transferAddressIndex].isSigner = true
        depositIx.keys[transferAddressIndex].isWritable = true
      }

      const governedAccountIndex = depositIx.keys.findIndex(
        (k) =>
          k.pubkey.toString() ===
          governedTokenAccount.governance?.pubkey.toString()
      )
      depositIx.keys[governedAccountIndex].isSigner = true

      serializedInstruction = serializeInstructionToBase64(depositIx)
    } catch (e) {
      if (e instanceof Error) {
        throw new Error('Error: ' + e.message)
      }
      throw e
    }
  }
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
    signers,
    shouldSplitIntoSeparateTxs: true,
  }
  return obj
}

export async function getFriktionWithdrawInstruction({
  schema,
  form,
  amount,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: any
  amount: number
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  const voltVaultId = new PublicKey(form.voltVaultId as string)
  const signers: Keypair[] = []
  if (
    isValid &&
    amount &&
    governedTokenAccount?.extensions.token?.publicKey &&
    governedTokenAccount?.extensions.token &&
    governedTokenAccount?.extensions.mint?.account &&
    governedTokenAccount?.governance &&
    wallet
  ) {
    const sdk = new FriktionSDK({
      provider: {
        connection: connection.current,
        wallet: wallet as any,
      },
    })
    const cVoltSDK = new ConnectedVoltSDK(
      connection.current,
      wallet.publicKey as PublicKey,
      await sdk.loadVoltAndExtraDataByKey(voltVaultId),
      governedTokenAccount.governance.pubkey
    )

    const vaultMint = cVoltSDK.voltVault.vaultMint

    try {
      let depositTokenDest: PublicKey | null

      if (governedTokenAccount.isSol) {
        const {
          currentAddress: receiverAddress,
          needToCreateAta,
        } = await getATA({
          connection: connection,
          receiverAddress: governedTokenAccount.governance.pubkey,
          mintPK: new PublicKey(WSOL_MINT),
          wallet,
        })
        if (needToCreateAta) {
          prerequisiteInstructions.push(
            Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
              TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
              new PublicKey(WSOL_MINT), // mint
              receiverAddress, // ata
              governedTokenAccount.governance.pubkey, // owner of token account
              wallet.publicKey! // fee payer
            )
          )
        }
        depositTokenDest = receiverAddress
      } else {
        depositTokenDest = governedTokenAccount.extensions.transferAddress!
      }

      //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
      const { currentAddress: vaultTokenAccount } = await getATA({
        connection: connection,
        receiverAddress: governedTokenAccount.governance.pubkey,
        mintPK: vaultMint,
        wallet,
      })

      const withdrawIx = await cVoltSDK.withdrawHumanAmount(
        new Decimal(amount),
        vaultTokenAccount,
        depositTokenDest,
        governedTokenAccount.governance.pubkey,
        undefined,
        true
      )

      const governedAccountIndex = withdrawIx.keys.findIndex(
        (k) =>
          k.pubkey.toString() ===
          governedTokenAccount.governance?.pubkey.toString()
      )
      withdrawIx.keys[governedAccountIndex].isSigner = true

      serializedInstruction = serializeInstructionToBase64(withdrawIx)
    } catch (e) {
      if (e instanceof Error) {
        throw new Error('Error: ' + e.message)
      }
      throw e
    }
  }
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
    signers,
    shouldSplitIntoSeparateTxs: true,
  }
  return obj
}

export async function getFriktionClaimPendingDepositInstruction({
  schema,
  form,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  const voltVaultId = new PublicKey(form.voltVaultId as string)
  const signers: Keypair[] = []
  if (
    isValid &&
    governedTokenAccount?.extensions.token?.publicKey &&
    governedTokenAccount?.extensions.token &&
    governedTokenAccount?.extensions.mint?.account &&
    governedTokenAccount?.governance &&
    wallet
  ) {
    const sdk = new FriktionSDK({
      provider: {
        connection: connection.current,
        wallet: wallet as any,
      },
    })
    const cVoltSDK = new ConnectedVoltSDK(
      connection.current,
      wallet.publicKey as PublicKey,
      await sdk.loadVoltAndExtraDataByKey(voltVaultId),
      governedTokenAccount.governance.pubkey
    )

    const voltVault = cVoltSDK.voltVault
    const vaultMint = cVoltSDK.voltVault.vaultMint

    try {
      //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
      const { currentAddress: receiverAddress, needToCreateAta } = await getATA(
        {
          connection: connection,
          receiverAddress: governedTokenAccount.governance.pubkey,
          mintPK: vaultMint,
          wallet,
        }
      )
      //we push this createATA instruction to transactions to create right before creating proposal
      //we don't want to create ata only when instruction is serialized
      if (needToCreateAta) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            vaultMint, // mint
            receiverAddress, // ata
            governedTokenAccount.governance.pubkey, // owner of token account
            wallet.publicKey! // fee payer
          )
        )
      }

      const key = (
        await VoltSDK.findPendingDepositInfoAddress(
          voltVaultId,
          governedTokenAccount.governance.pubkey,
          cVoltSDK.sdk.programs.Volt.programId
        )
      )[0]
      const acct = await cVoltSDK.sdk.programs.Volt.account.pendingDeposit.fetch(
        key
      )
      const pendingDepositInfo = {
        ...acct,
        key: key,
      } as PendingDepositWithKey

      if (
        pendingDepositInfo &&
        pendingDepositInfo.roundNumber.lt(voltVault.roundNumber) &&
        pendingDepositInfo?.numUnderlyingDeposited?.gtn(0)
      ) {
        const ix = await cVoltSDK.claimPending(receiverAddress)
        serializedInstruction = serializeInstructionToBase64(ix)
      } else {
        throw new Error('No pending deposit to claim')
      }
    } catch (e) {
      if (e instanceof Error) {
        throw new Error('Error: ' + e.message)
      }
      throw e
    }
  }
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
    signers,
    shouldSplitIntoSeparateTxs: true,
  }
  return obj
}

export async function getFriktionClaimPendingWithdrawInstruction({
  schema,
  form,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  const voltVaultId = new PublicKey(form.voltVaultId as string)
  const signers: Keypair[] = []
  if (
    isValid &&
    governedTokenAccount?.extensions.token?.publicKey &&
    governedTokenAccount?.extensions.token &&
    governedTokenAccount?.extensions.mint?.account &&
    governedTokenAccount?.governance &&
    wallet
  ) {
    const sdk = new FriktionSDK({
      provider: {
        connection: connection.current,
        wallet: wallet as any,
      },
    })
    const cVoltSDK = new ConnectedVoltSDK(
      connection.current,
      wallet.publicKey as PublicKey,
      await sdk.loadVoltAndExtraDataByKey(voltVaultId),
      governedTokenAccount.governance.pubkey
    )

    const voltVault = cVoltSDK.voltVault

    try {
      let depositTokenDest: PublicKey | null

      if (governedTokenAccount.isSol) {
        const {
          currentAddress: receiverAddress,
          needToCreateAta,
        } = await getATA({
          connection: connection,
          receiverAddress: governedTokenAccount.governance.pubkey,
          mintPK: new PublicKey(WSOL_MINT),
          wallet,
        })
        if (needToCreateAta) {
          prerequisiteInstructions.push(
            Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
              TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
              new PublicKey(WSOL_MINT), // mint
              receiverAddress, // ata
              governedTokenAccount.governance.pubkey, // owner of token account
              wallet.publicKey! // fee payer
            )
          )
        }
        depositTokenDest = receiverAddress
      } else {
        depositTokenDest = governedTokenAccount.extensions.transferAddress!
      }

      const key = (
        await VoltSDK.findPendingWithdrawalInfoAddress(
          voltVaultId,
          governedTokenAccount.governance.pubkey,
          cVoltSDK.sdk.programs.Volt.programId
        )
      )[0]
      const acct = await this.sdk.programs.Volt.account.pendingWithdrawal.fetch(
        key
      )
      const pendingWithdrawalInfo = {
        ...acct,
        key: key,
      }

      if (
        pendingWithdrawalInfo &&
        pendingWithdrawalInfo.roundNumber.lt(voltVault.roundNumber) &&
        pendingWithdrawalInfo?.numVoltRedeemed?.gtn(0)
      ) {
        const ix = await cVoltSDK.claimPendingWithdrawal(depositTokenDest)
        serializedInstruction = serializeInstructionToBase64(ix)
      } else {
        throw new Error('No pending withdrawal to claim')
      }
    } catch (e) {
      if (e instanceof Error) {
        throw new Error('Error: ' + e.message)
      }
      throw e
    }
  }
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
    signers,
    shouldSplitIntoSeparateTxs: true,
  }
  return obj
}
