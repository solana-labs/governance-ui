import {
  Connection,
  PublicKey,
  // TransactionInstruction,
  // Account,
  // Transaction,
} from '@solana/web3.js'
import { AccountMetaData, InstructionData } from '../../models/accounts'

import { BPF_UPGRADEABLE_LOADER_INSTRUCTIONS } from './programs/bpfUpgradeableLoader'
import { GOVERNANCE_INSTRUCTIONS } from './programs/governance'
import { MANGO_INSTRUCTIONS } from './programs/mango'
import { getProgramName, isGovernanceProgram } from './programs/names'
import { RAYDIUM_INSTRUCTIONS } from './programs/raydium'
import { SPL_TOKEN_INSTRUCTIONS } from './programs/splToken'
export const DEFAULT_GOVERNANCE_PROGRAM_ID =
  'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'
// Well known account names displayed on the instruction card
export const ACCOUNT_NAMES = {
  Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z: 'Mango DAO MNGO Treasury Vault',
  '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3':
    'Mango DAO MNGO Treasury Governance',
  '4PdEyhrV3gaUj4ffwjKGXBLo42jF2CQCCBoXenwCRWXf':
    'Mango DAO Insurance Fund Vault',
  '65u1A86RC2U6whcHeD2mRG1tXCSmH2GsiktmEFQmzZgq':
    'Mango DAO Insurance Fund Governance',
  '59BEyxwrFpt3x4sZ7TcXC3bHx3seGfqGkATcDx6siLWy':
    'Mango v3 Insurance Fund Vault',
  '9qFV99WD5TKnpYw8w3xz3mgMBR5anoSZo2BynrGmNZqY': 'Mango v3 Revenue Vault',
  '6GX2brfV7byA8bCurwgcqiGxNEgzjUmdYgarYZZr2MKe': 'Mango v3 Revenue Governance',
  CF8sDcPztLDkvnEbYnCaXiDxhUpZ2uKLStpmFfRDNxSd:
    'Mango v3 BTC-PERP Incentive Vault',
  '7Gm5zF6FNJpyhqdwKcEdMQw3r5YzitYUGVDKYMPT1cMy': 'Mango v3 Program Governance',
  MyHd6a7HWKTMeJMHBkrbMq4hZwZxwn9x7dxXcopQ4Wd: 'OMH Token',
  '2A7UgheVhmoQqXBAQyG1wCoMpooPuiUf2DK6XFiQTtbG': 'OMH Mint Governance',

  // Metaplex Foundation
  Cmtpx4jmkc9ShvWub4hcAvCqrqvWRpWW9eLUdruyZAN8:
    'Metaplex Foundation Council Mint',
  '2yf8YggL4cUhCygoppFMWWeBuJtmLQE9oHkiiUnXP1uM':
    'Metaplex Foundation Council Mint Governance',
  mtpXxYKnxwJJReD3PiZ1NLCfbMkHgNcJeGsdXFTfoBk:
    'Metaplex Foundation Community Mint',
  '2ZxVbyU35dqtMHgLbZZPoGURf2XuPVmSgmVHY8bTfiMC':
    'Metaplex Foundation Community Mint Governance',

  // Metaplex Genesis
  CMPxgYJPXRA8BRfC41uvv6YvpQwtFvLeV9PXjSLpNhYq: 'Metaplex Genesis Council Mint',
  '68NxN1Vo2TLhA3H33yBjwQE5D5UxqB2iL1HL4dgHyF66':
    'Metaplex Genesis Council Mint Governance',
  mpXGnkKdGs1eRZPKkBQ3GW5G4LsVgcX4RzGa5WPo67v:
    'Metaplex Genesis Community Mint',
  '4A9WiAZyXpBBEYaBv3UNQCKTqmDth7fukGnBoprLLH2i':
    'Metaplex Genesis Community Mint Governance',

  Cfafd52FfHRA5FRkTXmMNyHZfhNkbaHpZ12ggmeTVEMw:
    'Friends and Family Council Mint',
  FAFDfoUkaxoMqiNur9F1iigdBNrXFf4uNmS5XrhMewvf:
    'Friends and Family Community Mint',

  // GM DAO
  '7WbRWL33mM3pbFLvuqNjBztihQtHWWFPGr4HLHyqViG9': 'Team funds',
  DWhnQm42vCBLkA9RsrBB2spyR3uAJq1BGeroyNMKgnEh: 'Marketing funds',

  // GSAIL
  '39J1sWHCJgWab8pn6zpTqFCYRXTYVqbEkpLimrq8kTYJ':
    'GSAIL VAULT 2022-2026 VESTING SCHEDULE',
  GAMpPYx4DcJdPhnr7sM84gxym4NiNpzo4G6WufpRLemP: 'GSAIL TREASURY VAULT',

  // Marinade DAO
  B7ux5n2LYxJhS2TsMAcE98eMbkY3dBHUWyrZPBnDmMT5: 'MNDE Treasury',
  GewCM8ipoPnEraZZqEp6VgVPLZfxr8xwJREmidXVU1EH: 'mSOL Treasury',
}

export function getAccountName(accountPk: PublicKey) {
  return ACCOUNT_NAMES[accountPk.toBase58()] ?? getProgramName(accountPk)
}

export interface AccountDescriptor {
  name: string
  important?: boolean
}

export interface InstructionDescriptorFactory {
  name: string
  accounts: AccountDescriptor[]
  getDataUI: (
    connection: Connection,
    data: Uint8Array,
    accounts: AccountMetaData[]
  ) => Promise<JSX.Element>
}

export interface InstructionDescriptor {
  name: string
  accounts: AccountDescriptor[]
  dataUI: JSX.Element
}

// Well known program instructions displayed on the instruction card
export const INSTRUCTION_DESCRIPTORS = {
  ...SPL_TOKEN_INSTRUCTIONS,
  ...BPF_UPGRADEABLE_LOADER_INSTRUCTIONS,
  ...MANGO_INSTRUCTIONS,
  ...RAYDIUM_INSTRUCTIONS,
}

export async function getInstructionDescriptor(
  connection: Connection,
  instruction: InstructionData
) {
  let descriptors: any

  if (isGovernanceProgram(instruction.programId)) {
    descriptors =
      GOVERNANCE_INSTRUCTIONS['GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw']
  } else {
    descriptors = INSTRUCTION_DESCRIPTORS[instruction.programId.toBase58()]
  }

  const descriptor = descriptors && descriptors[instruction.data[0]]

  const dataUI = (descriptor?.getDataUI &&
    (await descriptor?.getDataUI(
      connection,
      instruction.data,
      instruction.accounts
    ))) ?? <>{JSON.stringify(instruction.data)}</>

  return {
    name: descriptor?.name,
    accounts: descriptor?.accounts,
    dataUI,
  }
}

// export async function sleep(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// export function getUnixTs() {
//   return new Date().getTime() / 1000;
// }

// export async function signTransaction({
//   transaction,
//   wallet,
//   signers = [],
//   connection,
// }: {
//   transaction: Transaction;
//   wallet: any;
//   signers?: Array<Account>;
//   connection: Connection;
// }) {
//   const { publicKey } = wallet;
//   if (!publicKey) throw new Error('waller no connected');

//   transaction.recentBlockhash = (
//     await connection.getRecentBlockhash('max')
//   ).blockhash;
//   console.log('tx recent blochash')
//   transaction.feePayer = publicKey;
//   console.log('tx recent blochash 2')
//   if (signers.length > 0) {
//     console.log('tx recent blochash3')
//     transaction.partialSign(...signers);
//   }

//   console.log('tx recent blochash4')
//   try {

//   console.log('tx recent blochash5', wallet)
//     return await wallet.signTransaction(transaction);
//   } catch (ex) {
//     let message = '';
//     if (ex instanceof Error) {
//       message = ex.message;
//     } else if (ex) {
//       message = JSON.stringify(ex);
//     }
//     throw new Error(message);
//   }
// }

// async function awaitTransactionSignatureConfirmation(
//   txid: any,
//   timeout: number,
//   connection: Connection,
// ) {
//   let done = false;
//   const result = await new Promise((resolve, reject) => {
//     // eslint-disable-next-line
//     (async () => {
//       setTimeout(() => {
//         if (done) {
//           return;
//         }
//         done = true;
//         console.log('Timed out for txid', txid);
//         reject({ timeout: true });
//       }, timeout);
//       try {
//         connection.onSignature(
//           txid,
//           result => {
//             console.log('WS confirmed', txid, result);
//             done = true;
//             if (result.err) {
//               reject(result.err);
//             } else {
//               resolve(result);
//             }
//           },
//           connection.commitment,
//         );
//         console.log('Set up WS connection', txid);
//       } catch (e) {
//         done = true;
//         console.log('WS error in setup', txid, e);
//       }
//       while (!done) {
//         // eslint-disable-next-line
//         (async () => {
//           try {
//             const signatureStatuses = await connection.getSignatureStatuses([
//               txid,
//             ]);
//             const result = signatureStatuses && signatureStatuses.value[0];
//             if (!done) {
//               if (!result) {
//                 // console.log('REST null result for', txid, result);
//               } else if (result.err) {
//                 console.log('REST error for', txid, result);
//                 done = true;
//                 reject(result.err);
//               }
//               // @ts-ignore
//               else if (
//                 !(
//                   result.confirmations ||
//                   result.confirmationStatus === 'confirmed' ||
//                   result.confirmationStatus === 'finalized'
//                 )
//               ) {
//                 console.log('REST not confirmed', txid, result);
//               } else {
//                 console.log('REST confirmed', txid, result);
//                 done = true;
//                 resolve(result);
//               }
//             }
//           } catch (e) {
//             if (!done) {
//               console.log('REST connection error: txid', txid, e);
//             }
//           }
//         })();
//         await sleep(3000);
//       }
//     })();
//   });
//   done = true;
//   return result;
// }

// /** Copy of Connection.simulateTransaction that takes a commitment parameter. */
// export async function simulateTransaction(
//   connection: Connection,
//   transaction: Transaction,
//   commitment: any,
// ): Promise<any> {
//   // @ts-ignore
//   transaction.recentBlockhash = await connection._recentBlockhash(
//     // @ts-ignore
//     connection._disableBlockhashCaching,
//   );

//   const signData = transaction.serializeMessage();
//   // @ts-ignore
//   const wireTransaction = transaction._serialize(signData);
//   const encodedTransaction = wireTransaction.toString('base64');
//   const config: any = { encoding: 'base64', commitment };
//   const args = [encodedTransaction, config];

//   // @ts-ignorexwxxx
//   const res = await connection._rpcRequest('simulateTransaction', args);
//   if (res.error) {
//     throw new Error('failed to simulate transaction: ' + res.error.message);
//   }
//   return res.result;
// }

// export async function sendSignedTransaction({
//   signedTransaction,
//   connection,
//   timeout = 3000,
// }: {
//   signedTransaction: Transaction;
//   connection: Connection;
//   sendingMessage?: string;
//   successMessage?: string;
//   timeout?: number;
// }): Promise<string> {
//   const rawTransaction = signedTransaction.serialize();
//   const startTime = getUnixTs();

//   const txid: any = await connection.sendRawTransaction(
//     rawTransaction,
//     {
//       skipPreflight: true,
//     },
//   );

//   console.log('Started awaiting confirmation for', txid);

//   let done = false;
//   (async () => {
//     while (!done && getUnixTs() - startTime < timeout) {
//       connection.sendRawTransaction(rawTransaction, {
//         skipPreflight: true,
//       });
//       await sleep(3000);
//     }
//   })();
//   try {
//     await awaitTransactionSignatureConfirmation(txid, timeout, connection);
//   } catch (err) {
//     if ((err as any).timeout) {
//       throw new Error(txid);
//     }
//     let simulateResult: any | null = null;
//     try {
//       simulateResult = (
//         await simulateTransaction(connection, signedTransaction, 'single')
//       ).value;
//     } catch (e) {
//       console.log('Error: ', e);
//     }

//     if (simulateResult && simulateResult.err) {
//       if (simulateResult.logs) {
//         for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
//           const line = simulateResult.logs[i];
//           if (line.startsWith('Program log: ')) {
//             throw new Error(
//               simulateResult.err,
//             );
//           }
//         }
//       }
//       throw new Error(
//         simulateResult.err,
//       );
//     }

//     throw new Error('Transaction failed');
//   } finally {
//     done = true;
//   }

//   console.log('Latency', txid, getUnixTs() - startTime);
//   return txid;
// }

// export async function sendTransaction2({
//   transaction,
//   wallet,
//   signers = [],
//   connection,
//   timeout = 3000,
// }: {
//   transaction: Transaction;
//   wallet: any;
//   signers?: Array<Account>;
//   connection: Connection;
//   sendingMessage?: string;
//   successMessage?: string;
//   timeout?: number;
// }) {
//   const signedTransaction = await signTransaction({
//     transaction,
//     wallet,
//     signers,
//     connection,
//   });
//   return await sendSignedTransaction({
//     signedTransaction,
//     connection,
//     timeout,
//   });
// }

// export async function sendTransactionWithNotifications(
//   connection: Connection,
//   wallet: any,
//   instructions: TransactionInstruction[],
//   signers: Account[],
//   pendingMessage: string,
//   successMessage: string,
// ) {
//   try {
//     const transaction = new Transaction();
//     transaction.add(...instructions);

//     try {
//       let txid = await sendTransaction2({
//         transaction,
//         wallet,
//         signers,
//         connection,
//       });

//       console.log('siccess', txid)
//     } catch (txError) {
//       throw new Error(txError);
//     }
//   } catch (ex) {
//     console.error(ex);
//     throw ex;
//   }
// }
