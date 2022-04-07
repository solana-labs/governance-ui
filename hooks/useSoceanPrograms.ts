import { useEffect, useState } from 'react';
import soceanConfiguration, {
  SoceanPrograms,
} from '@tools/sdk/socean/configuration';
import useWalletStore from 'stores/useWalletStore';

export default function useSoceanPrograms() {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);

  const [programs, setPrograms] = useState<SoceanPrograms | null>(null);

  useEffect(() => {
    if (!connection || !wallet) {
      return;
    }

    if (connection.cluster === 'localnet') {
      throw new Error('unsupported cluster for Socean programs loading');
    }

    setPrograms(
      soceanConfiguration.getSoceanPrograms({
        connection: connection.current,
        wallet,
        cluster: connection.cluster,
      }),
    );
  }, [connection, wallet]);

  return {
    programs,
  };
}
