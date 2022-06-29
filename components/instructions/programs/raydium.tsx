import { Connection } from '@solana/web3.js';
import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { fmtMintAmount } from '../../../tools/sdk/units';
import { tryGetTokenMint } from '../../../utils/tokens';

const RAYDIUM_AMM_INSTRUCTIONS = {
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': {
    3: {
      name: 'Raydium: Add Liquidity',
      accounts: [
        { name: 'Token Program' },
        { name: 'Amm Id' },
        { name: 'Amm Authority' },
        { name: 'Amm Open Orders' },
        { name: 'Amm Target Orders' },
        { name: 'Lp Mint Address' },
        { name: 'Pool Coin Token Account' },
        { name: 'Pool Pc Token Account' },
        { name: 'Serum Market' },
        { name: 'User Coin Token Account' },
        { name: 'User Pc Token Account' },
        { name: 'User Lp Token Account' },
        { name: 'User Owner' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const poolCoinMint = await tryGetTokenMint(
          connection,
          accounts[6].pubkey, // Pool Coin Token Account
        );

        const poolPcMint = await tryGetTokenMint(
          connection,
          accounts[7].pubkey, // Pool Pc Token Account
        );

        const dataLayout = struct([
          u8('instruction'),
          nu64('maxCoinAmount'),
          nu64('maxPcAmount'),
          nu64('fixedFromCoin'),
        ]);
        console.debug('buffer', Buffer.from(data));

        const args = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>
              maxCoinAmount:{' '}
              {fmtMintAmount(poolCoinMint?.account, args.maxCoinAmount)}
            </p>
            <p>
              maxPcAmount:{' '}
              {fmtMintAmount(poolPcMint?.account, args.maxPcAmount)}
            </p>
            <p>fixedFromCoin: {args.fixedFromCoin}</p>
          </>
        );
      },
    },
  },
};
const RAYDIUM_STAKING_INSTRUCTIONS = {
  EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q: {
    1: {
      name: 'Raydium: Deposit',
      accounts: [
        { name: 'Pool Id' },
        { name: 'Pool Authority' },
        { name: 'User Info Account' },
        { name: 'User Owner' },
        { name: 'User Lp Token Account' },
        { name: 'Pool Lp Token Account' },
        { name: 'User Reward Token Account' },
        { name: 'Pool Reward Token Account' },
        { name: 'Sysvar: Clock' },
        { name: 'Token Program' },
        { name: 'User Reward Token Account B' },
        { name: 'Pool Reward Token Account B' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const lpTokenMint = await tryGetTokenMint(
          connection,
          accounts[4].pubkey, // User Lp Token Account
        );
        const dataLayout = struct([u8('instruction'), nu64('amount')]);

        const args = dataLayout.decode(Buffer.from(data)) as any;

        return (
          <>
            <p>amount: {fmtMintAmount(lpTokenMint?.account, args.amount)}</p>
          </>
        );
      },
    },
  },
};

export const RAYDIUM_INSTRUCTIONS = {
  ...RAYDIUM_STAKING_INSTRUCTIONS,
  ...RAYDIUM_AMM_INSTRUCTIONS,
};
