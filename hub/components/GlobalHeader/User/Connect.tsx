import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as IT from 'io-ts';
import { gql } from 'urql';

import { SolanaLogo } from '@hub/components/branding/SolanaLogo';
import { useJWT } from '@hub/hooks/useJWT';
import { useMutation } from '@hub/hooks/useMutation';
import { useToast, ToastType } from '@hub/hooks/useToast';
import { useWallet } from '@hub/hooks/useWallet';
import cx from '@hub/lib/cx';
import * as sig from '@hub/lib/signature';
import * as RE from '@hub/types/Result';

const getClaim = gql`
  mutation getClaim($publicKey: PublicKey!) {
    createAuthenticationClaim(publicKey: $publicKey) {
      claim
    }
  }
`;

const getClaimResp = IT.type({
  createAuthenticationClaim: IT.type({
    claim: IT.string,
  }),
});

const getToken = gql`
  mutation getToken($claim: String!, $signature: Signature!) {
    createAuthenticationToken(claim: $claim, signature: $signature)
  }
`;

const getTokenResp = IT.type({
  createAuthenticationToken: IT.string,
});

interface Props {
  className?: string;
  compressed?: boolean;
  onConnected?(): void;
}

export function Connect(props: Props) {
  const { connect, signMessage, setSoftConnect } = useWallet();
  const [, createClaim] = useMutation(getClaimResp, getClaim);
  const [, createToken] = useMutation(getTokenResp, getToken);
  const [, setJwt] = useJWT();
  const { publish } = useToast();

  return (
    <NavigationMenu.Item>
      <button
        className={cx(
          'cursor-pointer',
          'flex',
          'items-center',
          'justify-center',
          'px-2',
          'py-2',
          'rounded',
          'space-x-1',
          'text-neutral-900',
          'text-sm',
          'transition-colors',
          'active:bg-black/20',
          'hover:bg-black/10',
          'dark:text-neutral-400',
          'dark:hover:text-neutral-200',
          'dark:active:bg-neutral-800',
          'dark:hover:bg-neutral-700',
          props.className,
        )}
        onClick={async () => {
          try {
            localStorage.removeItem('walletName');
            const publicKey = await connect();

            const claimResult = await createClaim({
              publicKey: publicKey.toBase58(),
            });

            if (RE.isFailed(claimResult)) {
              throw claimResult.error;
            }

            const {
              createAuthenticationClaim: { claim },
            } = claimResult.data;

            const claimBlob = sig.toUint8Array(claim);
            const signatureResp = await signMessage(claimBlob).catch(
              () => null,
            );

            if (!signatureResp) {
              setSoftConnect(true);
              return;
            }

            const signature = sig.toHex(signatureResp);
            const tokenResult = await createToken({ claim, signature });

            if (RE.isFailed(tokenResult)) {
              throw tokenResult.error;
            }

            const { createAuthenticationToken: token } = tokenResult.data;
            setJwt(token);
            props.onConnected?.();
          } catch (e) {
            publish({
              type: ToastType.Error,
              title: 'Could not connect to wallet',
              message: e instanceof Error ? e.message : 'Something went wrong',
            });
          }
        }}
      >
        <SolanaLogo className="h-4 w-4" />
        <div>{props.compressed ? 'Sign in' : 'Sign in with Solana'}</div>
      </button>
    </NavigationMenu.Item>
  );
}
