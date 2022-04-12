import { useEffect, useState } from 'react';

import useWalletStore from 'stores/useWalletStore';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '@tools/sdk/tribeca/ATribecaConfiguration';
import { getTribecaPrograms } from '@tools/sdk/tribeca/configurations';

export default function useTribecaPrograms(
  tribecaConfiguration: ATribecaConfiguration | null,
) {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);

  const [programs, setPrograms] = useState<TribecaPrograms | null>(null);

  useEffect(() => {
    if (!connection || !wallet || !tribecaConfiguration) {
      return;
    }

    setPrograms(
      getTribecaPrograms({
        connection: connection.current,
        wallet,
        config: tribecaConfiguration,
      }),
    );
  }, [connection, wallet, tribecaConfiguration]);

  return {
    programs,
  };
}
