import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import BN from 'bn.js'
import {
  DepositTx,
  Pool,
  prepareDepositTx,
  prepareWithdrawalRequestTx,
} from '@everlend/general-pool'
import { GeneralPoolsProgram } from '@everlend/general-pool'
import {
  CreateAssociatedTokenAccount,
  findAssociatedTokenAccount,
} from '@everlend/common'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  getInstructionDataFromBase64,
  ProgramAccount,
  Realm,
  RpcContext,
  serializeInstructionToBase64,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { AssetAccount } from '@utils/uiTypes/assets'
import { ConnectionContext } from '@utils/connection'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import {
  createProposal,
  InstructionDataWithHoldUpTime,
} from '../../../actions/createProposal'
import {
  CONFIG_DEVNET,
  CONFIG_MAINNET,
  REGISTRY_DEV,
  REGISTRY_MAIN,
  REWARD_PROGRAM_ID,
} from './constants'
import { getInitMiningTx } from './useInitMining'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { syncNative } from '@solendprotocol/solend-sdk'

export type ActionOptions = {
  /** the JSON RPC connection instance. */
  connection: Connection
  /** the fee payer public key, can be user's SOL address (owner address). */
  payerPublicKey: PublicKey
}

export type ActionResult = {
  /** the prepared transaction, ready for signing and sending. */
  tx: Transaction
  setupIxs: TransactionInstruction[]
  /** the additional key pairs which may be needed for signing and sending transactions. */
  keypairs?: Record<string, Keypair>
}

export const prepareSolDepositTx = async (
  { connection, payerPublicKey }: ActionOptions,
  pool: PublicKey,
  registry: PublicKey,
  amount: BN,
  rewardPool: PublicKey,
  rewardAccount: PublicKey,
  config: PublicKey,
  rewardProgramId: PublicKey,
  source: PublicKey,
  destination: PublicKey
): Promise<ActionResult> => {
  const {
    data: { poolMarket, tokenAccount, poolMint, tokenMint },
  } = await Pool.load(connection, pool)

  const poolMarketAuthority = await GeneralPoolsProgram.findProgramAddress([
    poolMarket.toBuffer(),
  ])

  const tx = new Transaction()
  const setupIxs: TransactionInstruction[] = []
  const poolConfig = await GeneralPoolsProgram.findProgramAddress([
    Buffer.from('config'),
    pool.toBuffer(),
  ])

  // Wrapping SOL
  const depositAccountInfo = await connection.getAccountInfo(source)
  if (!depositAccountInfo) {
    // generate the instruction for creating the ATA
    const createAtaInst = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(tokenMint),
      source,
      payerPublicKey,
      payerPublicKey
    )
    setupIxs.push(createAtaInst)
  }

  const userWSOLAccountInfo = await connection.getAccountInfo(destination)

  const rentExempt = await Token.getMinBalanceRentForExemptAccount(connection)

  const transferLamportsIx = SystemProgram.transfer({
    fromPubkey: payerPublicKey,
    toPubkey: source,
    lamports: (userWSOLAccountInfo ? 0 : rentExempt) + amount.toNumber(),
  })

  setupIxs.push(transferLamportsIx)

  const syncIx = syncNative(source)
  tx.add(syncIx)

  // Create destination account for pool mint if doesn't exist
  destination =
    destination ?? (await findAssociatedTokenAccount(payerPublicKey, poolMint))
  !(await connection.getAccountInfo(destination)) &&
    setupIxs.push(
      new CreateAssociatedTokenAccount(
        { feePayer: payerPublicKey },
        {
          associatedTokenAddress: destination,
          tokenMint: poolMint,
        }
      ).instructions[0]
    )

  tx.add(
    new DepositTx(
      { feePayer: payerPublicKey },
      {
        poolConfig,
        poolMarket,
        pool,
        source,
        destination,
        tokenAccount,
        poolMint,
        rewardPool,
        rewardAccount,
        poolMarketAuthority,
        amount,
      }
    )
  )

  return { tx, setupIxs }
}

export async function handleEverlendAction(
  rpcContext: RpcContext,
  form: {
    action: 'Deposit' | 'Withdraw'
    title: string
    description: string
    bnAmount: BN
    poolPubKey: string
    tokenMint: string
    poolMint: string
  },
  realm: ProgramAccount<Realm>,
  matchedTreasury: AssetAccount,
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  governingTokenMint: PublicKey,
  proposalIndex: number,
  isDraft: boolean,
  connection: ConnectionContext,
  wallet: SignerWalletAdapter,
  client?: VotingClient
) {
  const isSol = matchedTreasury.isSol
  const insts: InstructionDataWithHoldUpTime[] = []
  const owner = isSol
    ? matchedTreasury!.pubkey
    : matchedTreasury!.extensions!.token!.account.owner
  const isMainnet = connection.cluster === 'mainnet'
  const REGISTRY = new PublicKey(isMainnet ? REGISTRY_MAIN : REGISTRY_DEV)
  const CONFIG = new PublicKey(isMainnet ? CONFIG_MAINNET : CONFIG_DEVNET)

  const liquidityATA = isSol
    ? await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(form.tokenMint),
        owner,
        true
      )
    : matchedTreasury.pubkey

  const ctokenATA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    new PublicKey(form.poolMint),
    owner,
    true
  )

  const [rewardPool] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('reward_pool'),
      CONFIG.toBuffer(),
      new PublicKey(form.tokenMint).toBuffer(),
    ],
    REWARD_PROGRAM_ID
  )
  const [rewardAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from('mining'), owner.toBuffer(), rewardPool.toBuffer()],
    REWARD_PROGRAM_ID
  )

  const setupInsts: InstructionDataWithHoldUpTime[] = []
  const cleanupInsts: InstructionDataWithHoldUpTime[] = []

  if (form.action === 'Deposit') {
    const { actionTx, prerequisiteInstructions } = await handleEverlendDeposit(
      wallet!,
      Boolean(isSol),
      connection,
      owner,
      REGISTRY,
      CONFIG,
      rewardPool,
      rewardAccount,
      form.poolPubKey,
      form.bnAmount,
      liquidityATA,
      ctokenATA
    )
    actionTx.instructions.map((instruction) => {
      insts.push({
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(instruction)
        ),
        holdUpTime: matchedTreasury.governance!.account!.config
          .minInstructionHoldUpTime,
        prerequisiteInstructions: [],
      })
    })

    if (prerequisiteInstructions) {
      prerequisiteInstructions.map((instruction) => {
        setupInsts.push({
          data: getInstructionDataFromBase64(
            serializeInstructionToBase64(instruction)
          ),
          holdUpTime: matchedTreasury.governance!.account!.config
            .minInstructionHoldUpTime,
          prerequisiteInstructions: [],
        })
      })
    }
  } else if (form.action === 'Withdraw') {
    const { withdrawTx } = await handleEverlendWithdraw(
      Boolean(isSol),
      connection,
      owner,
      REGISTRY,
      CONFIG,
      rewardPool,
      rewardAccount,
      form.poolPubKey,
      form.bnAmount,
      ctokenATA,
      liquidityATA
    )

    withdrawTx.instructions.map((instruction) => {
      insts.push({
        data: getInstructionDataFromBase64(
          serializeInstructionToBase64(instruction)
        ),
        holdUpTime: matchedTreasury.governance!.account!.config
          .minInstructionHoldUpTime,
        prerequisiteInstructions: [],
      })
    })
  }

  const proposalsAdresses: PublicKey[] = []

  const proposalAddress = await createProposal(
    rpcContext,
    realm,
    matchedTreasury.governance!.pubkey,
    tokenOwnerRecord,
    form.title,
    form.description,
    governingTokenMint,
    proposalIndex,
    [...setupInsts, ...insts, ...cleanupInsts],
    isDraft,
    ["Approve"],
    client
  )
  proposalsAdresses.push(proposalAddress)

  return proposalsAdresses
}

export async function handleEverlendDeposit(
  wallet: SignerWalletAdapter,
  isSol: boolean,
  connection: ConnectionContext,
  owner: PublicKey,
  REGISTRY: PublicKey,
  CONFIG: PublicKey,
  rewardPool: PublicKey,
  rewardAccount: PublicKey,
  poolPubKey: string,
  amount: BN,
  source: PublicKey,
  destination: PublicKey
) {
  const actionTx = new Transaction()
  const initMiningTx = new Transaction()
  const prerequisiteInstructions: TransactionInstruction[] = []
  const rewardPoolInfo = await connection.current.getAccountInfo(rewardPool)
  const rewardAccountInfo = await connection.current.getAccountInfo(
    rewardAccount
  )

  if (!rewardAccountInfo && rewardPoolInfo?.data && wallet.publicKey) {
    const initTx = await getInitMiningTx(owner, connection.current, rewardPool)
    initMiningTx.add(initTx)
    prerequisiteInstructions.push(...initTx.instructions)
  }
  if (isSol) {
    const { tx: depositTx, setupIxs } = await prepareSolDepositTx(
      { connection: connection.current, payerPublicKey: owner },
      new PublicKey(poolPubKey),
      REGISTRY,
      amount,
      rewardPool,
      rewardAccount,
      CONFIG,
      REWARD_PROGRAM_ID,
      source,
      destination
    )
    actionTx.add(depositTx)
    prerequisiteInstructions.push(...setupIxs)
  } else {
    const { tx: depositTx } = await prepareDepositTx(
      { connection: connection.current, payerPublicKey: owner },
      new PublicKey(poolPubKey),
      amount,
      rewardPool,
      rewardAccount,
      source
    )
    actionTx.add(depositTx)
  }

  return { actionTx, initMiningTx, prerequisiteInstructions }
}

export async function handleEverlendWithdraw(
  isSol: boolean,
  connection: ConnectionContext,
  owner: PublicKey,
  REGISTRY: PublicKey,
  CONFIG: PublicKey,
  rewardPool: PublicKey,
  rewardAccount: PublicKey,
  poolPubKey: string,
  amount: BN,
  source: PublicKey,
  destination: PublicKey
) {
  const { tx: withdrawslTx } = await prepareWithdrawalRequestTx(
    {
      connection: connection.current,
      payerPublicKey: owner,
    },
    new PublicKey(poolPubKey),
    amount,
    rewardPool,
    rewardAccount,
    source,
    isSol ? owner : destination
  )
  const withdrawTx = withdrawslTx
  let closeIx: TransactionInstruction | undefined
  if (isSol) {
    const closeWSOLAccountIx = Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      destination,
      owner,
      owner,
      []
    )
    closeIx = closeWSOLAccountIx
  }

  return {
    withdrawTx,
    closeIx: closeIx ?? null,
  }
}
