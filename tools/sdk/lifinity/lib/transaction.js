'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getWithdrawInst = exports.getDepositInst = exports.getAccountInst = exports.makeSwapInstructionWithAuthority = exports.makeSwapTransactionWithAuthority = exports.getInstruction = exports.sendSwap = void 0;
// Copyright © 2022 LIFINITY FOUNDATION All Rights Reserved.
const anchor_1 = require('@project-serum/anchor');
const web3_js_1 = require('@solana/web3.js');
const spl_token_1 = require('@solana/spl-token');
const spl_token_2 = require('@solana/spl-token');
const token_instructions_1 = require('@project-serum/serum/lib/token-instructions');
const tokens_1 = require('./tokens');
const utils_1 = require('./utils');
const decimal_js_1 = __importDefault(require('decimal.js'));
const mpl_token_metadata_1 = require('@metaplex-foundation/mpl-token-metadata');
const mpl_core_1 = require('@metaplex-foundation/mpl-core');
function sendSwap(
  program,
  pool,
  fromTokenMint,
  toTokenMint,
  amountIn,
  minimumAmountOut,
) {
  return __awaiter(this, void 0, void 0, function* () {
    const { transaction, signers } = yield makeSwapAllInstructions(
      program,
      fromTokenMint,
      toTokenMint,
      pool,
      amountIn,
      minimumAmountOut,
    );
    return yield program.provider.send(transaction, signers);
  });
}
exports.sendSwap = sendSwap;
function getInstruction(
  program,
  pool,
  amountIn,
  minimumOut,
  ownerAccount,
  fromUserAccount,
  toTokenAccount,
  fromPoolAccount,
  toPoolAccount,
  approve = true,
) {
  return __awaiter(this, void 0, void 0, function* () {
    let approveInstruction = null;
    let signers = [];
    let swapAmountIn = new anchor_1.BN(amountIn.toNumber());
    let swapMinimumAmountOut = new anchor_1.BN(minimumOut.toNumber());
    let userAuthority = null;
    if (approve) {
      userAuthority = web3_js_1.Keypair.generate();
      approveInstruction = yield makeApproveInstruction(
        ownerAccount,
        fromUserAccount,
        userAuthority.publicKey,
        swapAmountIn,
      );
      signers.push(userAuthority);
    }
    let swapInstruction = yield makeSwapInstruction(
      program,
      userAuthority ? userAuthority.publicKey : ownerAccount,
      fromUserAccount,
      toTokenAccount,
      fromPoolAccount,
      toPoolAccount,
      swapAmountIn,
      swapMinimumAmountOut,
      pool,
    );
    return { approveInstruction, swapInstruction, signers };
  });
}
exports.getInstruction = getInstruction;
function makeSwapAllInstructions(
  program,
  fromTokenMint,
  toTokenMint,
  pool,
  amountIn,
  minimumAmountOut,
) {
  return __awaiter(this, void 0, void 0, function* () {
    let transaction = new web3_js_1.Transaction();
    let signers = [];
    let amountInBN;
    let minimumAmountOutBN;
    let fromPoolAccount;
    let toPoolAccount;
    let base = 10;
    let coinDecimals = Math.pow(base, pool.poolCoinDecimal);
    let pcDecimals = Math.pow(base, pool.poolPcDecimal);
    if (fromTokenMint.toString() === pool.poolCoinMint) {
      amountInBN = new anchor_1.BN(amountIn * coinDecimals);
      minimumAmountOutBN = new anchor_1.BN(minimumAmountOut * pcDecimals);
      fromPoolAccount = new web3_js_1.PublicKey(pool.poolCoinTokenAccount);
      toPoolAccount = new web3_js_1.PublicKey(pool.poolPcTokenAccount);
    } else {
      amountInBN = new anchor_1.BN(amountIn * pcDecimals);
      minimumAmountOutBN = new anchor_1.BN(minimumAmountOut * coinDecimals);
      fromPoolAccount = new web3_js_1.PublicKey(pool.poolPcTokenAccount);
      toPoolAccount = new web3_js_1.PublicKey(pool.poolCoinTokenAccount);
    }
    let fromUserAccount = null;
    let toTokenAccount = null;
    if (fromTokenMint.toString() === tokens_1.WSOL.mintAddress) {
      fromUserAccount = yield (0, utils_1.createWSOLAccountIfNotExist)(
        program,
        fromUserAccount,
        amountInBN.toNumber(),
        transaction,
        signers,
      );
    } else {
      fromUserAccount = yield (0, utils_1.findAssociatedTokenAddress)(
        program.provider.wallet.publicKey,
        fromTokenMint,
      );
    }
    if (toTokenMint.toString() === tokens_1.WSOL.mintAddress) {
      toTokenAccount = yield (0, utils_1.createWSOLAccountIfNotExist)(
        program,
        toTokenAccount,
        0,
        transaction,
        signers,
      );
    } else {
      toTokenAccount = yield (0,
      utils_1.createAssociatedTokenAccountIfNotExist)(
        program,
        toTokenMint,
        transaction,
      );
    }
    yield makeLifinityTransaction(
      program,
      transaction,
      signers,
      fromUserAccount,
      toTokenAccount,
      fromPoolAccount,
      toPoolAccount,
      amountInBN,
      minimumAmountOutBN,
      pool,
      true,
    );
    if (toTokenMint.toString() === tokens_1.WSOL.mintAddress) {
      transaction.add(
        (0, token_instructions_1.closeAccount)({
          source: toTokenAccount,
          destination: program.provider.wallet.publicKey,
          owner: program.provider.wallet.publicKey,
        }),
      );
    }
    return { transaction, signers };
  });
}
function makeLifinityTransaction(
  program,
  transaction,
  signers,
  fromUserAccount,
  toTokenAccount,
  fromPoolAccount,
  toPoolAccount,
  amountIn,
  minimumOut,
  pool,
  approve = true,
) {
  return __awaiter(this, void 0, void 0, function* () {
    let userTransferAuthority;
    if (approve) {
      userTransferAuthority = web3_js_1.Keypair.generate();
      transaction.add(
        yield makeApproveInstruction(
          program.provider.wallet.publicKey,
          fromUserAccount,
          userTransferAuthority.publicKey,
          amountIn,
        ),
      );
      signers.push(userTransferAuthority);
    } else {
      userTransferAuthority = program.provider.wallet;
    }
    transaction.add(
      yield makeSwapInstruction(
        program,
        userTransferAuthority.publicKey,
        fromUserAccount,
        toTokenAccount,
        fromPoolAccount,
        toPoolAccount,
        amountIn,
        minimumOut,
        pool,
      ),
    );
  });
}
function makeApproveInstruction(
  ownerAccount,
  fromUserAccount,
  userTransferAuthority,
  amountIn,
) {
  return __awaiter(this, void 0, void 0, function* () {
    return spl_token_1.Token.createApproveInstruction(
      spl_token_2.TOKEN_PROGRAM_ID,
      fromUserAccount,
      userTransferAuthority,
      ownerAccount,
      [],
      amountIn.toNumber(),
    );
  });
}
function makeSwapInstruction(
  program,
  userTransferAuthority,
  fromUserAccount,
  toTokenAccount,
  fromPoolAccount,
  toPoolAccount,
  amountIn,
  minimumOut,
  pool,
) {
  return __awaiter(this, void 0, void 0, function* () {
    let { programAuthority } = yield (0, utils_1.getProgramAuthority)(
      program.programId,
      new web3_js_1.PublicKey(pool.amm),
    );
    return program.instruction.swap(amountIn, minimumOut, {
      accounts: {
        authority: programAuthority,
        amm: new web3_js_1.PublicKey(pool.amm),
        userTransferAuthority: userTransferAuthority,
        sourceInfo: fromUserAccount,
        destinationInfo: toTokenAccount,
        swapSource: fromPoolAccount,
        swapDestination: toPoolAccount,
        poolMint: new web3_js_1.PublicKey(pool.poolMint),
        feeAccount: new web3_js_1.PublicKey(pool.feeAccount),
        tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
        pythPcAccount: new web3_js_1.PublicKey(pool.pythPcAccount),
        pythAccount: new web3_js_1.PublicKey(pool.pythAccount),
        configAccount: new web3_js_1.PublicKey(pool.configAccount),
      },
    });
  });
}
function makeSwapTransactionWithAuthority(
  program,
  amountIn,
  minimumAmountOut,
  ownerAccount,
  fromUserAccount,
  toTokenAccount,
  fromTokenMint,
  pool,
  authority,
) {
  let amountInBN;
  let minimumAmountOutBN;
  let fromPoolAccount;
  let toPoolAccount;
  let base = 10;
  let coinDecimals = Math.pow(base, pool.poolCoinDecimal);
  let pcDecimals = Math.pow(base, pool.poolPcDecimal);
  if (fromTokenMint.toString() === pool.poolCoinMint) {
    amountInBN = new anchor_1.BN(amountIn * coinDecimals);
    minimumAmountOutBN = new anchor_1.BN(minimumAmountOut * pcDecimals);
    fromPoolAccount = new web3_js_1.PublicKey(pool.poolCoinTokenAccount);
    toPoolAccount = new web3_js_1.PublicKey(pool.poolPcTokenAccount);
  } else {
    amountInBN = new anchor_1.BN(amountIn * pcDecimals);
    minimumAmountOutBN = new anchor_1.BN(minimumAmountOut * coinDecimals);
    fromPoolAccount = new web3_js_1.PublicKey(pool.poolPcTokenAccount);
    toPoolAccount = new web3_js_1.PublicKey(pool.poolCoinTokenAccount);
  }
  let userTransferAuthority = ownerAccount;
  return makeSwapInstructionWithAuthority(
    program,
    userTransferAuthority,
    fromUserAccount,
    toTokenAccount,
    fromPoolAccount,
    toPoolAccount,
    amountInBN,
    minimumAmountOutBN,
    pool,
    authority,
  );
}
exports.makeSwapTransactionWithAuthority = makeSwapTransactionWithAuthority;
function makeSwapInstructionWithAuthority(
  program,
  userTransferAuthority,
  fromUserAccount,
  toTokenAccount,
  fromPoolAccount,
  toPoolAccount,
  amountIn,
  minimumOut,
  pool,
  authority,
) {
  return program.instruction.swap(amountIn, minimumOut, {
    accounts: {
      authority,
      amm: new web3_js_1.PublicKey(pool.amm),
      userTransferAuthority: userTransferAuthority,
      sourceInfo: fromUserAccount,
      destinationInfo: toTokenAccount,
      swapSource: fromPoolAccount,
      swapDestination: toPoolAccount,
      poolMint: new web3_js_1.PublicKey(pool.poolMint),
      feeAccount: new web3_js_1.PublicKey(pool.feeAccount),
      tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
      pythPcAccount: new web3_js_1.PublicKey(pool.pythPcAccount),
      pythAccount: new web3_js_1.PublicKey(pool.pythAccount),
      configAccount: new web3_js_1.PublicKey(pool.configAccount),
    },
  });
}
exports.makeSwapInstructionWithAuthority = makeSwapInstructionWithAuthority;
function getAccountInst(program, tokenMintAddress) {
  return __awaiter(this, void 0, void 0, function* () {
    let account = yield (0, utils_1.findAssociatedTokenAddress)(
      program.provider.wallet.publicKey,
      tokenMintAddress,
    );
    const accountInfo = yield program.provider.connection.getAccountInfo(
      account,
    );
    let instruction;
    if (!accountInfo) {
      account = yield spl_token_1.Token.getAssociatedTokenAddress(
        spl_token_2.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl_token_2.TOKEN_PROGRAM_ID,
        tokenMintAddress,
        program.provider.wallet.publicKey,
      );
      instruction = spl_token_1.Token.createAssociatedTokenAccountInstruction(
        spl_token_2.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl_token_2.TOKEN_PROGRAM_ID,
        tokenMintAddress,
        account,
        program.provider.wallet.publicKey,
        program.provider.wallet.publicKey,
      );
    }
    return instruction;
  });
}
exports.getAccountInst = getAccountInst;
function getDepositInst(
  program,
  pool,
  amountInUxd,
  amountInUsdc,
  amountInLp,
  userLpTokenAccount,
) {
  return __awaiter(this, void 0, void 0, function* () {
    const walletResult = yield checkWalletDeposit(program, pool);
    if (!walletResult.lifinityTokenAccount) {
      console.log('Error: Lifinity NFT Not found');
      return undefined;
    }
    if (!walletResult.uxdTokenAccount) {
      console.log('Error: Uxd Wallet Not found / No balance');
      return undefined;
    }
    if (!walletResult.usdcTokenAccount) {
      console.log('Error: Usdc Wallet Not found / No balance');
      return undefined;
    }
    const userTransferAuthority = program.provider.wallet.publicKey;
    const maximumTokenAAmount = new anchor_1.BN(
      amountInUxd * Math.pow(10, pool.poolCoinDecimal),
    );
    const maximumTokenBAmount = new anchor_1.BN(
      amountInUsdc * Math.pow(10, pool.poolPcDecimal),
    );
    const poolTokenAmount = new anchor_1.BN(
      amountInLp * Math.pow(10, pool.poolMintDecimal),
    );
    const [authority] = yield web3_js_1.PublicKey.findProgramAddress(
      // @ts-ignore
      [new web3_js_1.PublicKey(pool.amm).toBuffer()],
      program.programId,
    );
    const instruction = program.instruction.depositAllTokenTypes(
      poolTokenAmount,
      maximumTokenAAmount,
      maximumTokenBAmount,
      {
        accounts: {
          amm: new web3_js_1.PublicKey(pool.amm),
          authority: authority,
          userTransferAuthorityInfo: userTransferAuthority,
          sourceAInfo: walletResult.uxdTokenAccount,
          sourceBInfo: walletResult.usdcTokenAccount,
          tokenA: new web3_js_1.PublicKey(pool.poolCoinTokenAccount),
          tokenB: new web3_js_1.PublicKey(pool.poolPcTokenAccount),
          poolMint: new web3_js_1.PublicKey(pool.poolMint),
          destination: userLpTokenAccount,
          tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
          configAccount: new web3_js_1.PublicKey(pool.configAccount),
          holderAccountInfo: program.provider.wallet.publicKey,
          lifinityNftAccount: new web3_js_1.PublicKey(
            walletResult.lifinityTokenAccount,
          ),
          lifinityNftMetaAccount: new web3_js_1.PublicKey(
            walletResult.lifinityMetaAccount,
          ),
        },
        instructions: [],
        signers: [],
      },
    );
    return instruction;
  });
}
exports.getDepositInst = getDepositInst;
function checkWalletDeposit(program, pool) {
  return __awaiter(this, void 0, void 0, function* () {
    let uxdTokenAccount;
    let usdcTokenAccount;
    let lifinityTokenAccount;
    let lifinityMetaAccount;
    yield program.provider.connection
      .getParsedTokenAccountsByOwner(
        program.provider.wallet.publicKey,
        {
          programId: spl_token_2.TOKEN_PROGRAM_ID,
        },
        'confirmed',
      )
      .then((parsedTokenAccounts) =>
        __awaiter(this, void 0, void 0, function* () {
          for (const tokenAccountInfo of parsedTokenAccounts.value) {
            const tokenAccountPubkey = tokenAccountInfo.pubkey;
            const parsedInfo = tokenAccountInfo.account.data.parsed.info;
            if (parsedInfo.tokenAmount.amount > 0) {
              const mintAddress = parsedInfo.mint;
              if (pool.poolCoinMint === mintAddress.toString()) {
                uxdTokenAccount = tokenAccountPubkey;
              }
              if (pool.poolPcMint === mintAddress.toString()) {
                usdcTokenAccount = tokenAccountPubkey;
              }
              const metadataPDA = yield mpl_token_metadata_1.Metadata.getPDA(
                mintAddress,
              );
              const mintAccInfo = yield program.provider.connection.getAccountInfo(
                metadataPDA,
              );
              if (mintAccInfo) {
                // @ts-ignore
                const {
                  data: { updateAuthority },
                } = mpl_token_metadata_1.Metadata.from(
                  new mpl_core_1.Account(mintAddress, mintAccInfo),
                );
                if (
                  updateAuthority ===
                    'BihU63mFnjLaBNPXxaDj8WUPBepZqqB4T2RHBJ99f2xo' ||
                  updateAuthority ===
                    'H5q7Z2FJ5KaWmtGquGqoYJYrM73BEpoabzas5y12s38T'
                ) {
                  lifinityTokenAccount = tokenAccountPubkey.toString();
                  lifinityMetaAccount = metadataPDA.toString();
                }
              }
            }
            if (uxdTokenAccount && usdcTokenAccount && lifinityTokenAccount) {
              break;
            }
          }
        }),
      );
    return {
      uxdTokenAccount,
      usdcTokenAccount,
      lifinityTokenAccount,
      lifinityMetaAccount,
    };
  });
}
function getWithdrawInst(
  program,
  pool,
  amountInLp,
  userUxdTokenAccount,
  userUsdcTokenAccount,
  slippage,
) {
  return __awaiter(this, void 0, void 0, function* () {
    const walletResult = yield checkWalletWithDraw(program, pool);
    if (!walletResult.lpTokenAccount) {
      console.log('Error: LP Account Not found / No balance');
      return undefined;
    }
    const lp = new decimal_js_1.default(
      amountInLp * Math.pow(10, pool.poolMintDecimal),
    );
    const lpAccount = yield program.provider.connection.getTokenSupply(
      new web3_js_1.PublicKey(pool.poolMint),
    );
    const lpSupply = new decimal_js_1.default(lpAccount.value.amount);
    const poolUxdAccount = yield program.provider.connection.getTokenAccountBalance(
      new web3_js_1.PublicKey(pool.poolCoinTokenAccount),
    );
    const uxdBalance = new decimal_js_1.default(poolUxdAccount.value.amount);
    const poolUsdcAccount = yield program.provider.connection.getTokenAccountBalance(
      new web3_js_1.PublicKey(pool.poolPcTokenAccount),
    );
    const usdcBalance = new decimal_js_1.default(poolUsdcAccount.value.amount);
    const percent = new decimal_js_1.default(100).plus(slippage).dividedBy(100);
    const poolTokenAmount = new anchor_1.BN(lp.toNumber());
    const minimumTokenAAmount = new anchor_1.BN(
      uxdBalance.times(lp).dividedBy(lpSupply).dividedBy(percent).toNumber(),
    );
    const minimumTokenBAmount = new anchor_1.BN(
      usdcBalance.times(lp).dividedBy(lpSupply).dividedBy(percent).toNumber(),
    );
    const [authority] = yield web3_js_1.PublicKey.findProgramAddress(
      // @ts-ignore
      [new web3_js_1.PublicKey(pool.amm).toBuffer()],
      program.programId,
    );
    const userTransferAuthority = program.provider.wallet.publicKey;
    const instruction = program.instruction.withdrawAllTokenTypes(
      poolTokenAmount,
      minimumTokenAAmount,
      minimumTokenBAmount,
      {
        accounts: {
          amm: new web3_js_1.PublicKey(pool.amm),
          authority: authority,
          userTransferAuthorityInfo: userTransferAuthority,
          sourceInfo: walletResult.lpTokenAccount,
          tokenA: new web3_js_1.PublicKey(pool.poolCoinTokenAccount),
          tokenB: new web3_js_1.PublicKey(pool.poolPcTokenAccount),
          poolMint: new web3_js_1.PublicKey(pool.poolMint),
          destTokenAInfo: userUxdTokenAccount,
          destTokenBInfo: userUsdcTokenAccount,
          feeAccount: new web3_js_1.PublicKey(pool.feeAccount),
          tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
        },
        signers: [],
      },
    );
    return instruction;
  });
}
exports.getWithdrawInst = getWithdrawInst;
function checkWalletWithDraw(program, pool) {
  return __awaiter(this, void 0, void 0, function* () {
    let lpTokenAccount;
    yield program.provider.connection
      .getParsedTokenAccountsByOwner(
        program.provider.wallet.publicKey,
        {
          programId: spl_token_2.TOKEN_PROGRAM_ID,
        },
        'confirmed',
      )
      .then((parsedTokenAccounts) =>
        __awaiter(this, void 0, void 0, function* () {
          for (const tokenAccountInfo of parsedTokenAccounts.value) {
            const tokenAccountPubkey = tokenAccountInfo.pubkey;
            const parsedInfo = tokenAccountInfo.account.data.parsed.info;
            if (parsedInfo.tokenAmount.amount > 0) {
              const mintAddress = parsedInfo.mint;
              if (pool.poolMint === mintAddress.toString()) {
                lpTokenAccount = tokenAccountPubkey;
              }
            }
            if (lpTokenAccount) {
              break;
            }
          }
        }),
      );
    return {
      lpTokenAccount,
    };
  });
}
