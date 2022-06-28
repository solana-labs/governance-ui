import { useEffect, useState } from 'react';

import useWalletStore from 'stores/useWalletStore';
import deltafiConfiguration from '@tools/sdk/deltafi/configuration';
import { DeltafiProgram } from '@tools/sdk/deltafi/program/deltafi';

export default function useDeltafiProgram() {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);

  const [program, setProgram] = useState<DeltafiProgram | null>(null);

  useEffect(() => {
    if (!connection || !wallet) {
      return;
    }

    setProgram(
      deltafiConfiguration.getDeltafiProgram({
        connection: connection.current,
        wallet,
      }),
    );
  }, [connection, wallet]);

  return program;
}
