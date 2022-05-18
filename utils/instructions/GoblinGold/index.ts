import {
  ConnectedVoltSDK,
  FriktionSDK,
  PendingDepositWithKey,
  VoltSDK,
} from '@friktion-labs/friktion-sdk'
import { AnchorWallet } from '@friktion-labs/friktion-sdk/dist/cjs/src/miscUtils'
import { WSOL_MINT, WSOL_MINT_PK } from '@components/instructions/tools'
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
  Transaction,
  Connection,
} from '@solana/web3.js'

import type { ConnectionContext } from 'utils/connection'
import { getATA } from '../../ataTools'
import { UiInstruction } from '../../uiTypes/proposalCreationTypes'
import { validateInstruction } from '@utils/instructionTools'
import BN from 'bn.js'
import { AssetAccount } from '@utils/uiTypes/assets'

import { AnchorProvider } from '@project-serum/anchor'

import { GoblinGold, NetworkName, StrategyVault } from 'goblingold-sdk'
import { GoblinGoldVault } from 'pages/dao/[symbol]/proposal/components/instructions/GoblinGold/GoblinGoldDeposit'

async function createAssociatedTokenAccountIfNotExist(
  connection: Connection,
  owner: PublicKey,
  mintAddress: PublicKey,
  prerequisiteInstructions: TransactionInstruction[]
) {
  const ataAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintAddress,
    owner,
    true
  )

  const accountInfo = await connection.getAccountInfo(ataAddress)

  if (!accountInfo) {
    prerequisiteInstructions.push(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintAddress,
        ataAddress,
        owner,
        owner
      )
    )
  }

  return ataAddress
}

function getGovernedAccountPk(acc: AssetAccount): PublicKey {
  return (acc.isSol
    ? acc.extensions.transferAddress
    : acc.extensions?.token?.publicKey) as PublicKey
}

export async function getGoblinGoldDepositInstruction({
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

  const signers: Keypair[] = []

  if (
    isValid &&
    amount &&
    governedTokenAccount?.extensions.mint?.account &&
    governedTokenAccount?.governance &&
    wallet
  ) {
    const env = NetworkName.Mainnet
    const endpoint = 'https://ssc-dao.genesysgo.net'
    const options = AnchorProvider.defaultOptions()

    const provider = new AnchorProvider(
      connection.current,
      wallet as any,
      options
    )

    const sdk = new GoblinGold(env, endpoint, provider)
    const strategyProgram = sdk.BestApy

    // const vault: StrategyVault = await sdk.getVaultById(form.goblinGoldVaultId)

    const vault = {
      id: '5NRMCHoJtq5vNgxmNgDzAqroKxDWM6mmE8HQnt7p4yLM',
      type: 'bestApy',
      name: 'Best APY',
      input: {
        symbol: 'WSOL',
        name: 'Wrapped Solana',
        mintAddress: 'So11111111111111111111111111111111111111112',
        decimals: 9,
        decimalsE: 1000000000,
      },
      lp: {
        symbol: 'ggSOL',
        name: 'ggSOL',
        mintAddress: '5NRMCHoJtq5vNgxmNgDzAqroKxDWM6mmE8HQnt7p4yLM',
        decimals: 9,
        decimalsE: 1000000000,
      },
      tvl: '45b99184f9',
      supply: '43c6c0e27c',
      apy: '0',
      apr: '0',
      aboutTxt:
        'This strategy automatically rebalances between different lending protocols in order to get the maximum yield in each period.',
      protocolsTxt: 'Mango, Port, Tulip, Solend and Francium',
      risksTxt:
        'The protocols being used underneath (although being audited) present some risks. No audit has been done for the current strategy. Use it at your own risk.',
      vaultAccount: 'CNJrJumoPRxvCaQZ2MJTEUUitwwen955JsxiUvoJa7Wp',
    }

    if (!vault) {
      throw new Error('Error: no vault')
    }

    strategyProgram.setToken(vault.input.symbol)

    const governedTokenAccountPk = WSOL_MINT_PK
    const governedAccountPk = getGovernedAccountPk(governedTokenAccount)

    const inputTokenMintAddress = new PublicKey(vault.input.mintAddress)
    const lpTokenMintAddress = new PublicKey(vault.lp.mintAddress)

    if (vault.name !== 'Best APY') {
      throw new Error("Error: strategy doesn't support")
    }

    if (
      inputTokenMintAddress.toString() !== governedTokenAccountPk.toString()
    ) {
      throw new Error('Error: selected governance token is not supported')
    }

    const ataInputAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      inputTokenMintAddress,
      governedAccountPk,
      true
    )

    const ataLpAddress = await createAssociatedTokenAccountIfNotExist(
      connection.current,
      governedAccountPk,
      lpTokenMintAddress,
      prerequisiteInstructions
    )

    // const depositIx = await strategyProgram.getDepositIx({
    //   userInputTokenAccount: new PublicKey(ataInputAddress),
    //   userLpTokenAccount: ataLpAddress,
    //   amount: new BN(amount),
    // })

    // serializedInstruction = serializeInstructionToBase64(depositIx)
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

export async function getGoblinGoldWithdrawInstruction({
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
  const goblinGoldVaultId = new PublicKey(form.goblinGoldVaultId as string)
  const depositTokenMint = new PublicKey(form.depositTokenMint as string)
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
        wallet: (wallet as unknown) as AnchorWallet,
      },
    })
    const cVoltSDK = new ConnectedVoltSDK(
      connection.current,
      wallet.publicKey as PublicKey,
      await sdk.loadVoltByKey(goblinGoldVaultId),
      undefined,
      governedTokenAccount.governance.pubkey
    )

    const voltVault = cVoltSDK.voltVault
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
          mintPK: WSOL_MINT_PK,
          wallet,
        })
        if (needToCreateAta) {
          prerequisiteInstructions.push(
            Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
              TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
              WSOL_MINT_PK, // mint
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
      const {
        currentAddress: vaultTokenAccount,
        needToCreateAta,
      } = await getATA({
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
            vaultTokenAccount, // ata
            governedTokenAccount.governance.pubkey, // owner of token account
            wallet.publicKey! // fee payer
          )
        )
      }

      let pendingDepositInfo
      try {
        const key = (
          await VoltSDK.findPendingDepositInfoAddress(
            goblinGoldVaultId,
            governedTokenAccount.governance.pubkey,
            cVoltSDK.sdk.programs.Volt.programId
          )
        )[0]
        const acct = await cVoltSDK.sdk.programs.Volt.account.pendingDeposit.fetch(
          key
        )
        pendingDepositInfo = {
          ...acct,
          key: key,
        } as PendingDepositWithKey
      } catch (err) {
        pendingDepositInfo = null
      }

      if (
        pendingDepositInfo &&
        pendingDepositInfo.roundNumber.lt(voltVault.roundNumber) &&
        pendingDepositInfo?.numUnderlyingDeposited?.gtn(0)
      ) {
        prerequisiteInstructions.push(
          await cVoltSDK.claimPending(vaultTokenAccount)
        )
      }

      let pendingWithdrawalInfo

      try {
        const key = (
          await VoltSDK.findPendingWithdrawalInfoAddress(
            goblinGoldVaultId,
            governedTokenAccount.governance.pubkey,
            cVoltSDK.sdk.programs.Volt.programId
          )
        )[0]
        const acct = await this.sdk.programs.Volt.account.pendingWithdrawal.fetch(
          key
        )
        pendingWithdrawalInfo = {
          ...acct,
          key: key,
        }
      } catch (err) {
        pendingWithdrawalInfo = null
      }
      if (
        pendingWithdrawalInfo &&
        pendingWithdrawalInfo.roundNumber.lt(voltVault.roundNumber) &&
        pendingWithdrawalInfo?.numVoltRedeemed?.gtn(0)
      ) {
        prerequisiteInstructions.push(
          await cVoltSDK.claimPendingWithdrawal(depositTokenDest)
        )
      }

      const withdrawIx = await cVoltSDK.withdrawHumanAmount(
        new BN(amount),
        depositTokenMint,
        vaultTokenAccount,
        null,
        depositTokenDest,
        governedTokenAccount.governance.pubkey
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
