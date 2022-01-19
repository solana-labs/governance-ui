import { Transaction } from '@solana/web3.js'
import { NamedTransactionProps } from '../model/NamedTransaction'

/**
 * Extends Transaction class to create a named transaction class
 */
class NamedTransaction {
  /**
   * The transaction name
   */
  private _name?: string
  private _transaction: Transaction

  constructor(name?: string) {
    this._name = name
  }

  set name(name: string) {
    this._name = name
  }

  get name() {
    return this._name ?? ''
  }

  set transaction(txns: Transaction) {
    this._transaction = txns
  }

  get transaction() {
    return this._transaction
  }
}

export default NamedTransaction
