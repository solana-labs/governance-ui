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
exports.getSwapTransactionWithAuthority = exports.getSwapInstruction = exports.getAmountOut = exports.Lifinity = void 0;
// Copyright © 2022 LIFINITY FOUNDATION All Rights Reserved.
const anchor_1 = require('@project-serum/anchor');
const web3_js_1 = require('@solana/web3.js');
const decimal_js_1 = __importDefault(require('decimal.js'));
const lifinity_amm_1 = require('./idl/lifinity_amm');
const network_1 = require('./network');
const pool_1 = require('./pool');
const transaction_1 = require('./transaction');
const utils_1 = require('./utils');
const curve_1 = require('./curve');
class Lifinity {
  constructor(connection, wallet) {
    this.stateAddress = web3_js_1.PublicKey.default;
    this.programAuthority = web3_js_1.PublicKey.default;
    this.connection = connection;
    this.wallet = wallet;
    const programAddress = new web3_js_1.PublicKey(
      (0, network_1.getProgramAddress)(),
    );
    const provider = new anchor_1.Provider(
      connection,
      wallet,
      anchor_1.Provider.defaultOptions(),
    );
    this.program = new anchor_1.Program(
      lifinity_amm_1.IDL,
      programAddress,
      provider,
    );
  }
  static build(connection, wallet) {
    return __awaiter(this, void 0, void 0, function* () {
      const instance = new Lifinity(connection, wallet);
      return instance;
    });
  }
  swap(amountIn, minimumAmountOut, fromMint, toMint) {
    return __awaiter(this, void 0, void 0, function* () {
      const poolInfo = (0, pool_1.getPool)(
        fromMint.toString(),
        toMint.toString(),
      );
      try {
        const tx = yield (0, transaction_1.sendSwap)(
          this.program,
          poolInfo,
          fromMint,
          toMint,
          amountIn,
          minimumAmountOut,
        );
        return tx;
      } catch (error) {
        console.error(error);
        return '';
      }
    });
  }
  getCreateTokenAccountInstruction(tokenMintAddress) {
    return __awaiter(this, void 0, void 0, function* () {
      const instruction = yield (0, transaction_1.getAccountInst)(
        this.program,
        tokenMintAddress,
      );
      return instruction;
    });
  }
  getDepositUxdInstruction(
    amountInUxd,
    amountInUsdc,
    amountInLp,
    userLpTokenAccount,
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      const fromMint = new web3_js_1.PublicKey(
        '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT',
      );
      const toMint = new web3_js_1.PublicKey(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      );
      const pool = (0, pool_1.getPool)(fromMint.toString(), toMint.toString());
      if (pool) {
        try {
          const instruction = yield (0, transaction_1.getDepositInst)(
            this.program,
            pool,
            amountInUxd,
            amountInUsdc,
            amountInLp,
            userLpTokenAccount,
          );
          return instruction;
        } catch (error) {
          console.error('getWithdrawUxdInstruction Error:', error);
          return undefined;
        }
      }
    });
  }
  getWithdrawUxdInstruction(
    amountInLp,
    userUxdTokenAccount,
    userUsdcTokenAccount,
    slippage,
  ) {
    return __awaiter(this, void 0, void 0, function* () {
      const fromMint = new web3_js_1.PublicKey(
        '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT',
      );
      const toMint = new web3_js_1.PublicKey(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      );
      const pool = (0, pool_1.getPool)(fromMint.toString(), toMint.toString());
      if (pool) {
        try {
          const instruction = yield (0, transaction_1.getWithdrawInst)(
            this.program,
            pool,
            amountInLp,
            userUxdTokenAccount,
            userUsdcTokenAccount,
            slippage,
          );
          return instruction;
        } catch (error) {
          console.error('getWithdrawUxdInstruction Error:', error);
          return undefined;
        }
      }
    });
  }
  getDepositAmountOut(connection, amountIn, slippage) {
    return __awaiter(this, void 0, void 0, function* () {
      const fromMint = new web3_js_1.PublicKey(
        '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT',
      );
      const toMint = new web3_js_1.PublicKey(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      );
      const pool = (0, pool_1.getPool)(fromMint.toString(), toMint.toString());
      if (pool) {
        const amount = new decimal_js_1.default(amountIn);
        const lpSup = yield (0, utils_1.getTokenSupply)(
          connection,
          new web3_js_1.PublicKey(pool.poolMint),
        );
        const lpAmount = new decimal_js_1.default(lpSup.value.amount);
        const lpSupply = lpAmount.times(
          new decimal_js_1.default(10).pow(lpSup.value.decimals),
        );
        const coin = yield (0, utils_1.getTokenAccountBalance)(
          connection,
          new web3_js_1.PublicKey(pool.poolCoinTokenAccount),
        );
        const coinAmount = new decimal_js_1.default(coin.value.amount);
        const coinBalance = coinAmount.times(
          new decimal_js_1.default(10).pow(pool.poolCoinDecimal),
        );
        const pc = yield (0, utils_1.getTokenAccountBalance)(
          connection,
          new web3_js_1.PublicKey(pool.poolPcTokenAccount),
        );
        const pcAmount = new decimal_js_1.default(pc.value.amount);
        const pcBalance = pcAmount.times(
          new decimal_js_1.default(10).pow(pool.poolPcDecimal),
        );
        const coinAddress = pool.poolCoinMint;
        const pcAddress = pool.poolPcMint;
        const outAmount = this.getOutAmount(
          pool,
          amount.toString(),
          coinAddress,
          pcAddress,
          slippage,
          coinBalance,
          pcBalance,
        );
        const lpRecive =
          Math.floor(
            ((amount.toNumber() * Math.pow(10, pool.poolCoinDecimal)) /
              coinBalance.toNumber()) *
              lpSupply.toNumber(),
          ) / Math.pow(10, pool.poolMintDecimal);
        const amountOut =
          Math.floor(outAmount.toNumber() * Math.pow(10, pool.poolPcDecimal)) /
          Math.pow(10, pool.poolPcDecimal);
        return {
          amountIn,
          amountOut,
          lpRecive,
        };
      }
    });
  }
  getOutAmount(
    poolInfo,
    amount,
    fromCoinMint,
    toCoinMint,
    slippage,
    coinBalance,
    pcBalance,
  ) {
    const price = pcBalance.dividedBy(coinBalance);
    const fromAmount = new decimal_js_1.default(amount);
    let outAmount = new decimal_js_1.default(0);
    const percent = new decimal_js_1.default(100).plus(slippage).dividedBy(100);
    if (!coinBalance || !pcBalance) {
      return outAmount;
    }
    if (
      fromCoinMint === poolInfo.poolCoinMint &&
      toCoinMint === poolInfo.poolPcMint
    ) {
      // outcoin is pc
      outAmount = fromAmount.times(price);
      outAmount = outAmount.times(percent);
    } else if (
      fromCoinMint === poolInfo.poolPcMint &&
      toCoinMint === poolInfo.poolCoinMint
    ) {
      // outcoin is coin
      outAmount = fromAmount.dividedBy(percent);
      outAmount = outAmount.dividedBy(price);
    }
    return outAmount;
  }
}
exports.Lifinity = Lifinity;
function getAmountOut(connection, amountIn, fromMint, toMint, slippage) {
  return __awaiter(this, void 0, void 0, function* () {
    const poolInfo = (0, pool_1.getPool)(
      fromMint.toString(),
      toMint.toString(),
    );
    if (poolInfo) {
      let amount = new decimal_js_1.default(amountIn);
      let tradeDirection;
      let inDecimal;
      let outDecimal;
      if (poolInfo.poolCoinMint === fromMint.toString()) {
        amount = amount.times(
          new decimal_js_1.default(10).pow(poolInfo.poolCoinDecimal),
        );
        inDecimal = poolInfo.poolCoinDecimal;
        outDecimal = poolInfo.poolPcDecimal;
        tradeDirection = curve_1.TradeDirection.AtoB;
      } else {
        amount = amount.times(
          new decimal_js_1.default(10).pow(poolInfo.poolPcDecimal),
        );
        inDecimal = poolInfo.poolPcDecimal;
        outDecimal = poolInfo.poolCoinDecimal;
        tradeDirection = curve_1.TradeDirection.BtoA;
      }
      const publicKeys = [
        new web3_js_1.PublicKey(poolInfo.amm),
        new web3_js_1.PublicKey(poolInfo.poolCoinTokenAccount),
        new web3_js_1.PublicKey(poolInfo.poolPcTokenAccount),
        new web3_js_1.PublicKey(poolInfo.configAccount),
        new web3_js_1.PublicKey(poolInfo.pythAccount),
      ];
      if (poolInfo.pythAccount !== poolInfo.pythPcAccount) {
        publicKeys.push(new web3_js_1.PublicKey(poolInfo.pythPcAccount));
      }
      try {
        const multipleInfo = yield (0, utils_1.getMultipleAccounts)(
          connection,
          publicKeys,
        );
        const { amm, fees, coinBalance, pcBalance, config, pyth, pythPc } = (0,
        utils_1.getParsedData)(multipleInfo, poolInfo);
        const slot = yield connection.getSlot();
        const { amountSwapped, priceImpact, fee, feePercent } = (0,
        curve_1.getCurveAmount)(
          amount,
          slot,
          amm,
          fees,
          coinBalance,
          pcBalance,
          config,
          pyth,
          pythPc,
          tradeDirection,
        );
        const slippagePercent = new decimal_js_1.default(slippage).div(100);
        const amountOutWithSlippage = new decimal_js_1.default(
          Math.floor(
            amountSwapped
              .times(new decimal_js_1.default(1).minus(slippagePercent))
              .toNumber(),
          ),
        );
        const amountOutWithSlippageTokenAmount = amountOutWithSlippage
          .div(new decimal_js_1.default(10).pow(outDecimal))
          .toNumber();
        const amountOutTokenAmount = amountSwapped
          .div(new decimal_js_1.default(10).pow(outDecimal))
          .toNumber();
        const feeTokenAmount = fee
          .div(new decimal_js_1.default(10).pow(inDecimal))
          .toNumber();
        return {
          amountIn,
          amountOut: amountOutTokenAmount,
          amountOutWithSlippage: amountOutWithSlippageTokenAmount,
          priceImpact: priceImpact.toNumber(),
          fee: feeTokenAmount,
          feePercent: feePercent.toNumber(),
        };
      } catch (error) {
        console.error(error);
        return {
          amountIn: 0,
          amountOut: 0,
          amountOutWithSlippage: 0,
          priceImpact: 0,
          fee: 0,
          feePercent: 0,
        };
      }
    }
  });
}
exports.getAmountOut = getAmountOut;
function getSwapInstruction(
  connection,
  ownerAccount,
  amountIn,
  minimumOut,
  fromMint,
  toMint,
  fromUserAccount,
  toTokenAccount,
  approve = true,
) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const poolInfo = (0, pool_1.getPool)(
        fromMint.toString(),
        toMint.toString(),
      );
      let amount = new decimal_js_1.default(amountIn);
      let amountOut = new decimal_js_1.default(minimumOut);
      let fromPoolAccount;
      let toPoolAccount;
      if (fromMint.toString() === poolInfo.poolCoinMint) {
        amount = amount.times(
          new decimal_js_1.default(10).pow(poolInfo.poolCoinDecimal),
        );
        amountOut = amountOut.times(
          new decimal_js_1.default(10).pow(poolInfo.poolPcDecimal),
        );
        fromPoolAccount = new web3_js_1.PublicKey(
          poolInfo.poolCoinTokenAccount,
        );
        toPoolAccount = new web3_js_1.PublicKey(poolInfo.poolPcTokenAccount);
      } else {
        amount = amount.times(
          new decimal_js_1.default(10).pow(poolInfo.poolPcDecimal),
        );
        amountOut = amountOut.times(
          new decimal_js_1.default(10).pow(poolInfo.poolCoinDecimal),
        );
        fromPoolAccount = new web3_js_1.PublicKey(poolInfo.poolPcTokenAccount);
        toPoolAccount = new web3_js_1.PublicKey(poolInfo.poolCoinTokenAccount);
      }
      // Dummy Wallet
      // @ts-ignore
      let wallet = web3_js_1.Keypair.generate();
      const programAddress = new web3_js_1.PublicKey(
        (0, network_1.getProgramAddress)(),
      );
      const provider = new anchor_1.Provider(
        connection,
        wallet,
        anchor_1.Provider.defaultOptions(),
      );
      const program = new anchor_1.Program(
        lifinity_amm_1.IDL,
        programAddress,
        provider,
      );
      const { approveInstruction, swapInstruction, signers } = yield (0,
      transaction_1.getInstruction)(
        program,
        poolInfo,
        amount,
        amountOut,
        ownerAccount,
        fromUserAccount,
        toTokenAccount,
        fromPoolAccount,
        toPoolAccount,
        approve,
      );
      return { approveInstruction, swapInstruction, signers };
    } catch (error) {
      console.warn(error);
      const approveInstruction = null;
      const swapInstruction = null;
      const signers = [];
      return { approveInstruction, swapInstruction, signers };
    }
  });
}
exports.getSwapInstruction = getSwapInstruction;
function getSwapTransactionWithAuthority(
  connection,
  ownerAccount,
  amountIn,
  minimumAmountOut,
  fromMint,
  toMint,
  fromUserAccount,
  toTokenAccount,
  authority,
) {
  const poolInfo = (0, pool_1.getPool)(fromMint.toString(), toMint.toString());
  // Dummy Wallet
  // @ts-ignore
  let wallet = web3_js_1.Keypair.generate();
  const programAddress = new web3_js_1.PublicKey(
    (0, network_1.getProgramAddress)(),
  );
  const provider = new anchor_1.Provider(
    connection,
    wallet,
    anchor_1.Provider.defaultOptions(),
  );
  const program = new anchor_1.Program(
    lifinity_amm_1.IDL,
    programAddress,
    provider,
  );
  return (0, transaction_1.makeSwapTransactionWithAuthority)(
    program,
    amountIn,
    minimumAmountOut,
    ownerAccount,
    fromUserAccount,
    toTokenAccount,
    fromMint,
    poolInfo,
    authority,
  );
}
exports.getSwapTransactionWithAuthority = getSwapTransactionWithAuthority;
