import { Transaction } from '@solana/web3.js'
import { NamedTransactionProps } from '../model/NamedTransaction'

/**
 * Extends Transaction class to create a named transaction class
 */
class NamedTransaction extends Transaction {
  /**
   * The transaction name
   */
  private _name?: string

  constructor(opts?: NamedTransactionProps) {
    super(opts)
    this._name = opts?.name
  }

  set name(name: string) {
    this._name = name
  }

  get name() {
    return this._name ?? ''
  }
}

export default NamedTransaction
