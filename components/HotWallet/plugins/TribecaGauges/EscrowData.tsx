import { BN } from '@project-serum/anchor';
import type { EscrowData } from '@tools/sdk/tribeca/programs';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';
import { tryGetTokenMint } from '@utils/tokens';
import { useCallback, useEffect, useState } from 'react';
import useWalletStore from 'stores/useWalletStore';

function formatDate(dateInSec: BN): string {
  if (dateInSec.isZero()) {
    return '-';
  }

  // mul by 1000 to get ms
  return new Date(dateInSec.mul(new BN(1000)).toNumber()).toUTCString();
}

const EscrowDataBloc = ({ escrowData }: { escrowData?: EscrowData }) => {
  const connection = useWalletStore((s) => s.connection);
  const [uiAmount, setUiAmount] = useState<string>('-');

  const loadUiAmount = useCallback(async (): Promise<string> => {
    if (!escrowData) return '-';

    const tokenInfo = await tryGetTokenMint(
      connection.current,
      escrowData.tokens,
    );

    if (!tokenInfo) {
      console.error(
        'Cannot load information about token mint related to escrow data (tribeca gauges)',
        escrowData.tokens,
      );
      return '-';
    }

    return nativeAmountToFormattedUiAmount(
      escrowData.amount,
      tokenInfo.account.decimals,
    );
  }, [connection, escrowData]);

  useEffect(() => {
    loadUiAmount().then(setUiAmount);
  }, [loadUiAmount]);

  return (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full relative">
      <p className="text-fgd-1 text-sm underline">Escrow Data</p>

      {escrowData ? (
        <div className="flex flex-col">
          <span className="flex flex-col">
            <span className="text-fgd-3 text-xs mt-3">
              Number of Locked Tokens
            </span>{' '}
            <span className="text-sm">{uiAmount}</span>
          </span>

          <span className="flex flex-col">
            <span className="text-fgd-3 text-xs mt-3">Lock Date</span>{' '}
            <span className="text-sm">
              {formatDate(escrowData.escrowStartedAt)}
            </span>
          </span>

          <span className="flex flex-col">
            <span className="text-fgd-3 text-xs mt-3">Unlocking Date</span>{' '}
            <span className="text-sm">
              {formatDate(escrowData.escrowEndsAt)}
            </span>
          </span>
        </div>
      ) : (
        <span>-</span>
      )}
    </div>
  );
};

export default EscrowDataBloc;
