import { createContext } from 'react';

import { ClusterType, useCluster } from '@hub/hooks/useCluster';
import { useToast, ToastType } from '@hub/hooks/useToast';
import { useWallet } from '@hub/hooks/useWallet';

import { createProposal } from './createProposal';

type CreateProposalsArgs = Omit<
  Parameters<typeof createProposal>[0],
  | 'connection'
  | 'cluster'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'requestingUserPublicKey'
>;

interface Value {
  createProposal(
    args: CreateProposalsArgs,
  ): Promise<Awaited<ReturnType<typeof createProposal>> | null>;
}

export const DEFAULT: Value = {
  createProposal: async () => {
    throw new Error('Not implemented');
  },
};

export const context = createContext(DEFAULT);

interface Props {
  children?: React.ReactNode;
}

export function ProposalProvider(props: Props) {
  const [cluster] = useCluster();
  const { connect, signTransaction, signAllTransactions } = useWallet();
  const { publish } = useToast();

  return (
    <context.Provider
      value={{
        createProposal: async (args) => {
          try {
            const publicKey = await connect();

            if (!publicKey) {
              throw new Error('User must be signed in');
            }

            return createProposal({
              ...args,
              cluster:
                cluster.type === ClusterType.Devnet
                  ? 'devnet'
                  : cluster.type === ClusterType.Mainnet
                  ? 'mainnet'
                  : 'localnet',
              connection: cluster.connection,
              requestingUserPublicKey: publicKey,
              signAllTransactions,
              signTransaction,
            });
          } catch (e) {
            const message =
              e instanceof Error ? e.message : 'Something went wrong';

            publish({
              message,
              type: ToastType.Error,
              title: 'Couuld not create a proposal',
            });

            return null;
          }
        },
      }}
    >
      {props.children}
    </context.Provider>
  );
}
