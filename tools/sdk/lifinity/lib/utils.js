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
exports.getTokenSupply = exports.getTokenAccountBalance = exports.getParsedData = exports.getMultipleAccounts = exports.sleep = exports.getProgramAuthority = exports.findProgramAddress = exports.findAssociatedTokenAddress = exports.createAssociatedTokenAccountIfNotExist = exports.createWSOLAccountIfNotExist = void 0;
const web3_js_1 = require('@solana/web3.js');
const spl_token_1 = require('@solana/spl-token');
const token_instructions_1 = require('@project-serum/serum/lib/token-instructions');
const spl_token_2 = require('@solana/spl-token');
const client_1 = require('@pythnetwork/client');
const decimal_js_1 = __importDefault(require('decimal.js'));
const tokens_1 = require('./tokens');
const layout_1 = require('./layout');
const ASSOCIATED_TOKEN_PROGRAM_ID = new web3_js_1.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);
function createWSOLAccountIfNotExist(
  program,
  account,
  amountIn,
  transaction,
  signer,
) {
  return __awaiter(this, void 0, void 0, function* () {
    let publicKey;
    if (account) {
      publicKey = account;
    } else {
      const owner = program.provider.wallet.publicKey;
      const newAccount = web3_js_1.Keypair.generate();
      publicKey = newAccount.publicKey;
      let lamports =
        amountIn +
        (yield program.provider.connection.getMinimumBalanceForRentExemption(
          spl_token_2.AccountLayout.span,
        ));
      transaction.add(
        web3_js_1.SystemProgram.createAccount({
          fromPubkey: owner,
          newAccountPubkey: publicKey,
          lamports: lamports,
          space: spl_token_2.AccountLayout.span,
          programId: spl_token_2.TOKEN_PROGRAM_ID,
        }),
      );
      transaction.add(
        (0, token_instructions_1.initializeAccount)({
          account: publicKey,
          mint: new web3_js_1.PublicKey(tokens_1.WSOL.mintAddress),
          owner,
        }),
      );
      signer.push(newAccount);
    }
    return publicKey;
  });
}
exports.createWSOLAccountIfNotExist = createWSOLAccountIfNotExist;
function createAssociatedTokenAccountIfNotExist(
  program,
  tokenMintAddress,
  transaction,
) {
  return __awaiter(this, void 0, void 0, function* () {
    let account = yield findAssociatedTokenAddress(
      program.provider.wallet.publicKey,
      tokenMintAddress,
    );
    yield program.provider.connection.getAccountInfo(account).then((info) =>
      __awaiter(this, void 0, void 0, function* () {
        if (!info) {
          account = yield spl_token_1.Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            spl_token_2.TOKEN_PROGRAM_ID,
            tokenMintAddress,
            program.provider.wallet.publicKey,
          );
          transaction.add(
            spl_token_1.Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              spl_token_2.TOKEN_PROGRAM_ID,
              tokenMintAddress,
              account,
              program.provider.wallet.publicKey,
              program.provider.wallet.publicKey,
            ),
          );
        }
      }),
    );
    return account;
  });
}
exports.createAssociatedTokenAccountIfNotExist = createAssociatedTokenAccountIfNotExist;
function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
  return __awaiter(this, void 0, void 0, function* () {
    const { publicKey } = yield findProgramAddress(
      [
        walletAddress.toBuffer(),
        spl_token_2.TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    return publicKey;
  });
}
exports.findAssociatedTokenAddress = findAssociatedTokenAddress;
function findProgramAddress(seeds, programId) {
  return __awaiter(this, void 0, void 0, function* () {
    const [publicKey, nonce] = yield web3_js_1.PublicKey.findProgramAddress(
      seeds,
      programId,
    );
    return { publicKey, nonce };
  });
}
exports.findProgramAddress = findProgramAddress;
function getProgramAuthority(id, publickey) {
  return __awaiter(this, void 0, void 0, function* () {
    const [
      programAuthority,
      nonce,
    ] = yield web3_js_1.PublicKey.findProgramAddress(
      [publickey.toBuffer()],
      id,
    );
    return { programAuthority, nonce };
  });
}
exports.getProgramAuthority = getProgramAuthority;
const sleep = (ms) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield new Promise((resolve) => setTimeout(resolve, ms));
  });
exports.sleep = sleep;
function getMultipleAccounts(connection, publicKeys, commitment) {
  return __awaiter(this, void 0, void 0, function* () {
    const keys = [];
    let tempKeys = [];
    publicKeys.forEach((k) => {
      if (tempKeys.length >= 100) {
        keys.push(tempKeys);
        tempKeys = [];
      }
      tempKeys.push(k);
    });
    if (tempKeys.length > 0) {
      keys.push(tempKeys);
    }
    const accounts = [];
    const resArray = {};
    yield Promise.all(
      keys.map((key, index) =>
        __awaiter(this, void 0, void 0, function* () {
          const res = yield connection.getMultipleAccountsInfo(key, commitment);
          resArray[index] = res;
        }),
      ),
    );
    Object.keys(resArray)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((itemIndex) => {
        const res = resArray[parseInt(itemIndex)];
        for (const account of res) {
          accounts.push(account);
        }
      });
    return accounts.map((account, idx) => {
      if (account === null) {
        return null;
      }
      return {
        publicKey: publicKeys[idx],
        account,
      };
    });
  });
}
exports.getMultipleAccounts = getMultipleAccounts;
function getParsedData(multipleInfo, poolInfo) {
  let amm;
  let fees;
  let coinBalance;
  let pcBalance;
  let config;
  let pyth;
  let pythPc;
  for (let i = 0; i < multipleInfo.length; i++) {
    const info = multipleInfo[i];
    if (info) {
      const address = info.publicKey.toBase58();
      const data = Buffer.from(info.account.data);
      const { key } = getAddressForWhat(poolInfo, address);
      switch (key) {
        case 'amm': {
          const parsed = layout_1.LIFINITY_AMM_LAYOUT.decode(data);
          const {
            freezeTrade,
            freezeDeposit,
            freezeWithdraw,
            baseDecimals,
            curveType,
          } = parsed;
          amm = {
            freezeTrade: freezeTrade,
            freezeDeposit: freezeDeposit,
            freezeWithdraw: freezeWithdraw,
            baseDecimals: baseDecimals,
            curveType: curveType,
          };
          const {
            tradeFeeNumerator,
            tradeFeeDenominator,
            ownerTradeFeeNumerator,
            ownerTradeFeeDenominator,
          } = parsed;
          fees = {
            tradeFeeNumerator: new decimal_js_1.default(
              Number(tradeFeeNumerator),
            ),
            tradeFeeDenominator: new decimal_js_1.default(
              Number(tradeFeeDenominator),
            ),
            ownerTradeFeeNumerator: new decimal_js_1.default(
              Number(ownerTradeFeeNumerator),
            ),
            ownerTradeFeeDenominator: new decimal_js_1.default(
              Number(ownerTradeFeeDenominator),
            ),
          };
          break;
        }
        case 'poolCoinTokenAccount': {
          const parsed = spl_token_2.AccountLayout.decode(data);
          const amount = spl_token_2.u64.fromBuffer(parsed.amount).toNumber();
          coinBalance = new decimal_js_1.default(amount);
          break;
        }
        case 'poolPcTokenAccount': {
          const parsed = spl_token_2.AccountLayout.decode(data);
          const amount = spl_token_2.u64.fromBuffer(parsed.amount).toNumber();
          pcBalance = new decimal_js_1.default(amount);
          break;
        }
        case 'configAccount': {
          const parsed = layout_1.CONFIG_LAYOUT.decode(data);
          const {
            concentrationRatio,
            lastPrice,
            adjustRatio,
            balanceRatio,
            lastBalancedPrice,
            configDenominator,
            pythConfidenceLimit,
            pythSlotLimit,
            volumeX,
            volumeY,
            volumeXinY,
            coefficientUp,
            coefficientDown,
            oracleStatus,
            configTemp1,
            configTemp2,
          } = parsed;
          config = {
            concentrationRatio: new decimal_js_1.default(
              Number(concentrationRatio),
            ),
            lastPrice: new decimal_js_1.default(Number(lastPrice)),
            adjustRatio: new decimal_js_1.default(Number(adjustRatio)),
            balanceRatio: new decimal_js_1.default(Number(balanceRatio)),
            lastBalancedPrice: new decimal_js_1.default(
              Number(lastBalancedPrice),
            ),
            configDenominator: new decimal_js_1.default(
              Number(configDenominator),
            ),
            pythConfidenceLimit: new decimal_js_1.default(
              Number(pythConfidenceLimit),
            ),
            pythSlotLimit: new decimal_js_1.default(Number(pythSlotLimit)),
            volumeX: new decimal_js_1.default(Number(volumeX)),
            volumeY: new decimal_js_1.default(Number(volumeY)),
            volumeXinY: new decimal_js_1.default(Number(volumeXinY)),
            coefficientUp: new decimal_js_1.default(Number(coefficientUp)),
            coefficientDown: new decimal_js_1.default(Number(coefficientDown)),
            oracleStatus: new decimal_js_1.default(Number(oracleStatus)),
            configTemp1: new decimal_js_1.default(Number(configTemp1)),
            configTemp2: new decimal_js_1.default(Number(configTemp2)),
          };
          break;
        }
        case 'pythAccount': {
          const { aggregate, exponent } = (0, client_1.parsePriceData)(data);
          const pythPrice = new decimal_js_1.default(
            Number(aggregate.priceComponent),
          );
          const pythConfidence = new decimal_js_1.default(
            Number(aggregate.confidenceComponent),
          );
          const pythStatus = new decimal_js_1.default(Number(aggregate.status));
          const pythPublishSlot = new decimal_js_1.default(
            Number(aggregate.publishSlot),
          );
          const pythExponent = exponent;
          pyth = {
            price: pythPrice,
            confidence: pythConfidence,
            status: pythStatus,
            publishSlot: pythPublishSlot,
            exponent: pythExponent,
          };
          break;
        }
        case 'pythPcAccount': {
          const { aggregate, exponent } = (0, client_1.parsePriceData)(data);
          const pythPrice = new decimal_js_1.default(
            Number(aggregate.priceComponent),
          );
          const pythConfidence = new decimal_js_1.default(
            Number(aggregate.confidenceComponent),
          );
          const pythStatus = new decimal_js_1.default(Number(aggregate.status));
          const pythPublishSlot = new decimal_js_1.default(
            Number(aggregate.publishSlot),
          );
          const pythExponent = exponent;
          pythPc = {
            price: pythPrice,
            confidence: pythConfidence,
            status: pythStatus,
            publishSlot: pythPublishSlot,
            exponent: pythExponent,
          };
          break;
        }
      }
    }
  }
  return { amm, fees, coinBalance, pcBalance, config, pyth, pythPc };
}
exports.getParsedData = getParsedData;
function getAddressForWhat(pool, address) {
  for (const [key, value] of Object.entries(pool)) {
    if (value === address) {
      return { key };
    }
  }
  return {};
}
function getTokenAccountBalance(connection, tokenAccount) {
  return __awaiter(this, void 0, void 0, function* () {
    // @ts-ignore
    const resp = yield connection._rpcRequest('getTokenAccountBalance', [
      tokenAccount.toBase58(),
    ]);
    if (resp.error) {
      throw new Error(resp.error.message);
    }
    return resp.result;
  });
}
exports.getTokenAccountBalance = getTokenAccountBalance;
function getTokenSupply(connection, mint) {
  return __awaiter(this, void 0, void 0, function* () {
    // @ts-ignore
    const resp = yield connection._rpcRequest('getTokenSupply', [
      mint.toBase58(),
    ]);
    if (resp.error) {
      throw new Error(resp.error.message);
    }
    return resp.result;
  });
}
exports.getTokenSupply = getTokenSupply;
