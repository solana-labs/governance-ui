import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { MapleFinance } from '@tools/sdk/mapleFinance/configuration';
import { tryGetMint } from '@utils/tokens';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';

export const MAPLE_FINANCE_PROGRAM_INSTRUCTIONS = {
  [MapleFinance.SyrupProgramId.toBase58()]: {
    [MapleFinance.syrupProgramInstructions.lenderDeposit]: {
      name: 'Maple Finance - Lender Deposit',
      accounts: [
        'Lender',
        'Lender User',
        'Pool',
        'Globals',
        'Base Mint',
        'Pool Locker',
        'Shares Mint',
        'Locked Shares',
        'Lender Shares',
        'Lender Locker',
        'System Program',
        'Token Program',
        'Rent',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const baseMint = accounts[4].pubkey;

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('depositAmount'),
        ]);

        const { depositAmount } = dataLayout.decode(Buffer.from(data)) as any;

        const mintInfo = await tryGetMint(connection, baseMint);

        if (!mintInfo) throw new Error('Cannot load mint info');

        const uiAmount = nativeAmountToFormattedUiAmount(
          depositAmount,
          mintInfo.account.decimals,
        );

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Ui amount to deposit:</span>
              <span>{uiAmount}</span>
            </div>
          </div>
        );
      },
    },
  },
};
