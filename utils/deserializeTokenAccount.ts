import { AccountInfo, PublicKey } from '@solana/web3.js'
import { AccountLayout } from '@solana/spl-token'
import { BN } from '@coral-xyz/anchor'

interface TokenAccount {
  amount: BN
  closeAuthority: PublicKey
  closeAuthorityOption: number
  delegate: PublicKey
  delegateOption: number
  delegatedAmount: BN
  isNative: number
  isNativeOption: number
  mint: PublicKey
  owner: PublicKey
  state: number
}

export interface TokenAccountWithKey extends TokenAccount {
  key: PublicKey
}

export const deserializeSplTokenAccount = (
  accountInfo: AccountInfo<Buffer>
): TokenAccount => {
  const _accountInfo = AccountLayout.decode(accountInfo.data)
  const amountBuffer = Buffer.from(_accountInfo.amount)
  const amount = new BN(amountBuffer, 'hex', 'le')
  const delegatedAmountBuffer = Buffer.from(_accountInfo.delegatedAmount)
  const delegatedAmount = new BN(delegatedAmountBuffer, 'hex', 'le')
  const isNativeBuffer = Buffer.from(_accountInfo.isNative)
  const isNative = isNativeBuffer.readUIntLE(0, 8)
  return {
    amount,
    closeAuthority: new PublicKey(_accountInfo.closeAuthority),
    closeAuthorityOption: _accountInfo.closeAuthority,
    delegate: new PublicKey(_accountInfo.delegate),
    delegateOption: _accountInfo.delegateOption,
    delegatedAmount,
    isNative,
    isNativeOption: _accountInfo.isNativeOption,
    mint: new PublicKey(_accountInfo.mint),
    owner: new PublicKey(_accountInfo.owner),
    state: _accountInfo.state,
  }
}
