// During realm creation, add a plugin that provides sybil resistance protection (by default provided by civic.com) using proof of uniqueness passes
import { Connection, PublicKey } from '@solana/web3.js'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { GatewayClient } from '@solana/governance-program-library'
import { getRegistrarPDA } from '@utils/plugin/accounts'
import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance'
import { AddPluginResult } from './types'

export const addGatewayPlugin = async (
  connection: Connection,
  wallet: Wallet,
  realmPk: PublicKey,
  communityMintPk: PublicKey,
  programIdPk: PublicKey,
  predecessorPluginProgram: PublicKey | undefined, // if chained, set the previous plugin here
  passType: PublicKey // The type of sybil resistance protection
): Promise<AddPluginResult> => {
  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(connection, wallet as Wallet, options)
  const isDevnet = connection.rpcEndpoint.includes('devnet')
  const gatewayClient = await GatewayClient.connect(provider, isDevnet)

  const { registrar } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    gatewayClient.program.programId
  )

  const gatewayRegistrarInstruction = await gatewayClient.program.methods
    .createRegistrar(!!predecessorPluginProgram) // chain with the previous if it exists
    .accounts({
      registrar,
      realm: realmPk,
      governanceProgramId: programIdPk,
      realmAuthority: wallet.publicKey, // the realm authority is not yet transferred to the Realm PDA
      governingTokenMint: communityMintPk,
      gatekeeperNetwork: passType,
      payer: wallet.publicKey,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .remainingAccounts(
      predecessorPluginProgram
        ? [
            {
              pubkey: predecessorPluginProgram,
              isWritable: false,
              isSigner: false,
            },
          ]
        : []
    )
    .instruction()

  return {
    pluginProgramId: gatewayClient.program.programId,
    instructions: [gatewayRegistrarInstruction],
  }
}
