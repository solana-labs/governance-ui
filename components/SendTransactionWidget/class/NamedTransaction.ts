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

  /**
   * Rebuilds this object with a new transaction
   * @param transaction
   * @param name
   * @returns
   */
  rebuild(transaction: Transaction, name?: string) {
    const nt = new NamedTransaction(name ?? this.name)
    nt.transaction = transaction
    return nt
  }

  set name(name: string) {
    this._name = name
  }

  get name() {
    return this._name ?? ''
  }

  set transaction(txns: Transaction) {
    this._transaction = txns
    console.debug('updated transaction')
  }

  get transaction() {
    return this._transaction
  }
}

export default NamedTransaction
