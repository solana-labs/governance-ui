import { useEffect, useState } from 'react';
import useWalletStore from 'stores/useWalletStore';
import {
  buildWhirlpoolClient,
  WhirlpoolClient,
  WhirlpoolContext,
} from '@orca-so/whirlpools-sdk';
import { OrcaConfiguration } from '@tools/sdk/orca/configuration';

// target the same wallet as orca
import { Wallet } from '@project-serum/anchor/dist/cjs/provider';

export default function useOrcaWhirlpoolClient() {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);

  const [
    whirlpoolClient,
    setWhirlpoolClient,
  ] = useState<WhirlpoolClient | null>(null);

  useEffect(() => {
    if (!connection || !wallet || !wallet.publicKey) {
      return;
    }

    setWhirlpoolClient(
      buildWhirlpoolClient(
        WhirlpoolContext.from(
          connection.current,
          wallet as Wallet,
          OrcaConfiguration.WhirlpoolProgramId,
        ),
      ),
    );
  }, [connection]);

  return whirlpoolClient;
}
