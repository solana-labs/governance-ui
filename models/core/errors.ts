export class WalletNotConnectedError extends Error {
  constructor() {
    super('Wallet is not connected.')
  }
}

export function isWalletNotConnectedError(
  error: any
): error is WalletNotConnectedError {
  return error instanceof WalletNotConnectedError
}
