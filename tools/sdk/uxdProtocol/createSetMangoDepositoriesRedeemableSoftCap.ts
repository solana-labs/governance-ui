import { Program, BN, Provider, Wallet } from '@project-serum/anchor'
import {
  TransactionInstruction,
  PublicKey,
  Connection,
  Keypair,
} from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import uxdIdl from './uxdIdl'

const redeemableDecimals = 6

const createSetMangoDepositoriesRedeemableSoftCapInstruction = (
  connection: Connection,
  uxdProgramId: PublicKey,
  supplyCapUiAmount: number,
  authority: PublicKey
): TransactionInstruction => {
  // generating a random wallet to be able to instantiate a dummy provider
  const provider = new Provider(
    connection,
    new Wallet(Keypair.generate()),
    Provider.defaultOptions()
  )

  const program = new Program(uxdIdl, uxdProgramId, provider)
  const controller = new Controller('UXD', redeemableDecimals, uxdProgramId)

  const decimals = new BN(10 ** redeemableDecimals)
  const supplyCapNativeAmount = new BN(supplyCapUiAmount).mul(decimals)

  return program.instruction.setMangoDepositoriesRedeemableSoftCap(
    supplyCapNativeAmount,
    {
      accounts: {
        authority: authority,
        controller: controller.pda,
      },
      options: Provider.defaultOptions(),
    }
  )
}

export default createSetMangoDepositoriesRedeemableSoftCapInstruction
