import { notify } from './notifications';
import {
  Commitment,
  Connection,
  Keypair,
  RpcResponseAndContext,
  SimulatedTransactionResponse,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import Wallet from '@project-serum/sol-wallet-adapter';
import { sleep } from './sendTransactions';

class TransactionError extends Error {
  public txid: string;
  constructor(message: string, txid?: string) {
    super(message);
    this.txid = txid!;
  }
}

export function getUnixTs() {
  return new Date().getTime() / 1000;
}

const DEFAULT_TIMEOUT = 31000;

export async function sendTransaction({
  transaction,
  wallet,
  signers = [],
  connection,
  sendingMessage = 'Sending transaction...',
  successMessage = 'Transaction confirmed',
  timeout = DEFAULT_TIMEOUT,
}: {
  transaction: Transaction;
  wallet: Wallet;
  signers?: Array<Keypair>;
  connection: Connection;
  sendingMessage?: string;
  successMessage?: string;
  timeout?: number;
}) {
  const signedTransaction = await signTransaction({
    transaction,
    wallet,
    signers,
    connection,
  });

  return await sendSignedTransaction({
    signedTransaction,
    connection,
    sendingMessage,
    successMessage,
    timeout,
  });
}

export async function signTransaction({
  transaction,
  wallet,
  signers = [],
  connection,
}: {
  transaction: Transaction;
  wallet: Wallet;
  signers?: Array<Keypair>;
  connection: Connection;
}) {
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;
  transaction.setSigners(wallet.publicKey, ...signers.map((s) => s.publicKey));
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  return await wallet.signTransaction(transaction);
}

export async function signTransactions({
  transactionsAndSigners,
  wallet,
  connection,
}: {
  transactionsAndSigners: {
    transaction: Transaction;
    signers?: Array<Keypair>;
  }[];
  wallet: Wallet;
  connection: Connection;
}) {
  const blockhash = (await connection.getRecentBlockhash('max')).blockhash;
  transactionsAndSigners.forEach(({ transaction, signers = [] }) => {
    transaction.recentBlockhash = blockhash;
    transaction.setSigners(
      wallet.publicKey,
      ...signers.map((s) => s.publicKey),
    );
    if (signers?.length > 0) {
      transaction.partialSign(...signers);
    }
  });
  return await wallet.signAllTransactions(
    transactionsAndSigners.map(({ transaction }) => transaction),
  );
}

export async function sendSignedTransaction({
  signedTransaction,
  connection,
  sendingMessage = 'Sending transaction...',
  successMessage = 'Transaction confirmed',
  timeout = DEFAULT_TIMEOUT,
}: {
  signedTransaction: Transaction;
  connection: Connection;
  sendingMessage?: string;
  successMessage?: string;
  timeout?: number;
}): Promise<string> {
  // debugger
  const rawTransaction = signedTransaction.serialize();
  const startTime = getUnixTs();

  console.info('raw tx', rawTransaction.toString('base64'));

  notify({ message: sendingMessage });

  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
    },
  );

  console.info('Started awaiting confirmation for', txid);

  let done = false;

  (async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });

      await sleep(3000);
    }
  })();

  try {
    console.info('calling confirmation sig', txid, timeout, connection);

    console.info(
      'calling signatures confirmation',
      await awaitTransactionSignatureConfirmation(txid, timeout, connection),
    );
  } catch (err) {
    if (err.timeout) {
      throw new Error('Timed out awaiting confirmation on transaction');
    }

    let simulateResult: SimulatedTransactionResponse | null = null;

    console.info('signed transaction', signedTransaction);

    try {
      console.info('start simulate');
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, 'single')
      ).value;
    } catch (error) {
      console.error('Error simulating: ', error);
    }

    console.info('simulate result', simulateResult);

    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        console.info('simulate result logs', simulateResult.logs);

        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i];

          if (line.startsWith('Program log: ')) {
            throw new TransactionError(
              'Transaction failed: ' + line.slice('Program log: '.length),
              txid,
            );
          }
        }
      }
      throw new TransactionError(JSON.stringify(simulateResult.err), txid);
    }

    throw new TransactionError('Transaction failed', txid);
  } finally {
    done = true;
  }

  notify({ message: successMessage, type: 'success', txid });

  console.info('Latency', txid, getUnixTs() - startTime);
  return txid;
}

export async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
) {
  let done = false;
  const result = await new Promise((resolve, reject) => {
    // eslint-disable-next-line
    (async () => {
      setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        console.info('Timed out for txid', txid);
        reject({ timeout: true });
      }, timeout);
      try {
        connection.onSignature(
          txid,
          (result) => {
            console.info('WS confirmed', txid, result, result.err);
            done = true;
            if (result.err) {
              reject(result.err);
            } else {
              resolve(result);
            }
          },
          connection.commitment,
        );
        console.info('Set up WS connection', txid);
      } catch (e) {
        done = true;
        console.error('WS error in setup', txid, e);
      }
      while (!done) {
        // eslint-disable-next-line
        (async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([
              txid,
            ]);

            console.info('signatures cancel proposal', signatureStatuses);

            const result = signatureStatuses && signatureStatuses.value[0];

            console.info('result signatures', result, signatureStatuses);

            if (!done) {
              if (!result) {
                // console.log('REST null result for', txid, result);
              } else if (result.err) {
                console.error('REST error for', txid, result);
                done = true;
                reject(result.err);
              }
              // @ts-ignore
              else if (
                !(
                  result.confirmations ||
                  result.confirmationStatus === 'confirmed' ||
                  result.confirmationStatus === 'finalized'
                )
              ) {
                console.info('REST not confirmed', txid, result);
              } else {
                console.info('REST confirmed', txid, result);
                done = true;
                resolve(result);
              }
            }
          } catch (e) {
            if (!done) {
              console.error('REST connection error: txid', txid, e);
            }
          }
        })();
        await sleep(3000);
      }
    })();
  });
  done = true;
  return result;
}

/** Copy of Connection.simulateTransaction that takes a commitment parameter. */
export async function simulateTransaction(
  connection: Connection,
  transaction: Transaction,
  commitment: Commitment,
): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
  // @ts-ignore
  transaction.recentBlockhash = await connection._recentBlockhash(
    // @ts-ignore
    connection._disableBlockhashCaching,
  );

  console.info('simulating transaction', transaction);

  const signData = transaction.serializeMessage();
  // @ts-ignore
  const wireTransaction = transaction._serialize(signData);
  const encodedTransaction = wireTransaction.toString('base64');

  const config: any = { encoding: 'base64', commitment };
  const args = [encodedTransaction, config];
  console.info('simulating data', args);

  // @ts-ignore
  const res = await connection._rpcRequest('simulateTransaction', args);

  console.info('res simulating transaction', res);
  if (res.error) {
    throw new Error('failed to simulate transaction: ' + res.error.message);
  }
  return res.result;
}
