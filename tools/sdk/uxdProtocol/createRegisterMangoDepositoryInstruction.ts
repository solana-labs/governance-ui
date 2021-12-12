import { serializeInstructionToBase64 } from '@models/serialisation'
import { Provider } from '@project-serum/anchor'
import { Token, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@utils/tokens'
import { findATAAddrSync, MangoDepository } from '@uxdprotocol/uxd-client'
import { initializeMango, uxdClient } from './uxdClient'

const createRegisterMangoDepositoryInstruction = async (
  connection: Connection,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  payer: PublicKey,
  collateralMint: PublicKey,
  insuranceMint: PublicKey
): Promise<TransactionInstruction> => {
  const mango = await initializeMango(connection)
  const depository = new MangoDepository(
    collateralMint,
    'collateralName',
    6,
    insuranceMint,
    'USDC',
    6,
    uxdProgramId
  )

  const { client, controller } = uxdClient(connection, uxdProgramId)
  const [authorityInsuranceATA] = findATAAddrSync(authority, insuranceMint)[0]
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
    controller,
    depository,
    mango,
    authority,
    Provider.defaultOptions(),
    payer
  )
}

export default createRegisterMangoDepositoryInstruction
