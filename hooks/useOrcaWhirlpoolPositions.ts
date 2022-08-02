import { useEffect, useState } from 'react';
import useWalletStore from 'stores/useWalletStore';
import orcaConfiguration, {
  WhirlpoolPositionInfo,
} from '@tools/sdk/orca/configuration';
import { PublicKey } from '@solana/web3.js';
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';

export default function useOrcaWhirlpoolPositions({
  whirlpool,
  authority,
}: {
  whirlpool?: WhirlpoolImpl;
  authority?: PublicKey;
}) {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);

  const [positionsInfo, setPositionsInfo] = useState<
    WhirlpoolPositionInfo[] | null
  >(null);

  useEffect(() => {
    (async () => {
      if (
        !connection ||
        !wallet ||
        !wallet.publicKey ||
        !whirlpool ||
        !authority
      ) {
        return;
      }

      const positionsInfo = await orcaConfiguration.getAuthorityWhirlpoolPositions(
        {
          connection: connection.current,
          whirlpool,
          authority,
        },
      );

      setPositionsInfo(positionsInfo);
    })();
  }, [connection, authority, whirlpool]);

  return positionsInfo;
}
