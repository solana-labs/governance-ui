import { serializeInstructionToBase64 } from '@models/serialisation'
import { Provider } from '@project-serum/anchor'
import { Token, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@utils/tokens'
import {
  Controller,
  findATAAddrSync,
  MangoDepository,
} from '@uxdprotocol/uxd-client'
import { ConnectionContext } from 'stores/useWalletStore'
import { initializeMango, uxdClient } from './uxdClient'

const createRegisterMangoDepositoryInstruction = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  payer: PublicKey,
  collateralMint: PublicKey,
  insuranceMint: PublicKey,
  controllerPda: PublicKey
): Promise<TransactionInstruction> => {
  const mango = await initializeMango(connection.current, connection.cluster)
  const depository = new MangoDepository(
    collateralMint,
    'collateralName',
    6,
    insuranceMint,
    'USDC',
    6,
    uxdProgramId
  )

  const client = uxdClient(connection.current, uxdProgramId)
  const [authorityInsuranceATA] = findATAAddrSync(authority, insuranceMint)
  const createAuthorityInsuranceItx = Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    insuranceMint,
    findATAAddrSync(authority, insuranceMint)[0],
    authority, // owner
    payer // payer
  )

  console.log(
    `Initialize Authority Insurance ATA (${authorityInsuranceATA.toBase58()}) itx:`,
    serializeInstructionToBase64(createAuthorityInsuranceItx)
  )

  return client.createRegisterMangoDepositoryInstruction(
    { pda: controllerPda } as Controller,
    depository,
    mango,
    authority,
    Provider.defaultOptions(),
    payer
  )
}

export default createRegisterMangoDepositoryInstruction
