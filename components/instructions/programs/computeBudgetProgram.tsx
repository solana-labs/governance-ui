// The ComputeBudgetProgram.requestUnits function
// is available starting at @solana/web3.js v1.41.0 and it's not possible for now
// to update the main solana/web3.js package as it requires to update also governance related package
// @ts-ignore
import { ComputeBudgetProgram } from '@solana/web3.js-1.41.0';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { u32, u8, struct } from 'buffer-layout';

export const COMPUTE_BUDGET_INSTRUCTIONS = {
  [ComputeBudgetProgram.programId]: {
    0: {
      name: 'Request Units',
      accounts: [],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u32('requestedUnits'),
          u32('additionalFee'),
        ]);

        const { requestedUnits, additionalFee } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <div className="flex flex-col">
            <div>
              <span>Requested Units:</span>
              <span>{Number(requestedUnits).toLocaleString()}</span>
            </div>

            <div>
              <span>Additional Fee:</span>
              <span>{Number(additionalFee).toLocaleString()}</span>
            </div>
          </div>
        );
      },
    },
  },
};
