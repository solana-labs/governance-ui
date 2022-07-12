import { SingleSideStakingClient } from '@uxdprotocol/uxd-staking-client';
import { useEffect, useState } from 'react';
import configuration from '@tools/sdk/uxdProtocolStaking/configuration';
import useWalletStore from 'stores/useWalletStore';

export default function useSingleSideStakingClient(): {
  client: SingleSideStakingClient | null;
} {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);

  const [client, setClient] = useState<SingleSideStakingClient | null>(null);

  useEffect(() => {
    if (!connection || !wallet) {
      return;
    }

    if (connection.cluster === 'localnet') {
      throw new Error('unsupported cluster for Socean programs loading');
    }

    const programId = configuration.programId[connection.cluster];

    if (!programId) {
      throw new Error('UXD Staking program id not found');
    }

    setClient(
      SingleSideStakingClient.load({
        connection: connection.current,
        programId,
      }),
    );
  }, [connection, wallet]);

  return {
    client,
  };
}
