import { XIcon } from '@heroicons/react/solid';
import { Application } from '@verify-wallet/constants';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { SolanaLogo } from '@hub/components/branding/SolanaLogo';
import { LoadingDots } from '@hub/components/LoadingDots';
import { useMutation } from '@hub/hooks/useMutation';
import * as RE from '@hub/types/Result';

import * as gqlWallet from './gql';

const ConnectedDiscordIcon = () => (
  <img
    src="/verify-wallet/img/icon-discord-role.svg"
    alt="Discord"
    height="64px"
    width="64px"
  />
);

const ConnectedIcon = () => (
  <img
    src="/verify-wallet/img/icon-connected.svg"
    alt="Connected"
    height="24px"
    width="24px"
  />
);

const MatchdayLogo = () => (
  <img
    src="/verify-wallet/img/logo-matchday.png"
    alt="Matchday"
    height="64px"
    width="64px"
  />
);

enum VerifyWalletState {
  FAILED,
  VERIFYING,
  VERIFIED,
}

interface Props {
  application: Application;
}

export const StepThree = (props: Props) => {
  const [, verifyWallet] = useMutation(
    gqlWallet.verifyWalletResp,
    gqlWallet.verifyWallet,
  );
  const [status, setStatus] = useState(VerifyWalletState.VERIFYING);
  const parsedLocationHash = new URLSearchParams(
    window.location.search.substring(1),
  );

  const router = useRouter();

  useEffect(() => {
    const updateDiscordMetadata = async () => {
      try {
        const verifyWalletResult = await verifyWallet({
          code: parsedLocationHash.get('code'),
          application:
            props.application == Application.MATCHDAY ? 'MATCHDAY' : 'SOLANA',
        });

        if (RE.isFailed(verifyWalletResult)) {
          // Likely an issue like the Discord code has already been used
          setStatus(VerifyWalletState.FAILED);
          console.error(verifyWalletResult.error);
          setTimeout(() => {
            router.push(window.location.pathname);
          }, 5000);
          throw verifyWalletResult.error;
        }

        setStatus(VerifyWalletState.VERIFIED);
      } catch (e) {
        console.error(e);
      }
    };
    if (parsedLocationHash.get('code')) {
      updateDiscordMetadata();
    }
  }, [window.location.search]);

  if (status === VerifyWalletState.FAILED) {
    return (
      <>
        <XIcon height="48px" className="text-red" />
        <h1 className="text-3xl font-medium mt-8">Something went wrong!</h1>
        <p className="text-sm text-neutral-700 mt-4">
          Retrying the connection to Discord...
        </p>
      </>
    );
  } else if (status === VerifyWalletState.VERIFYING) {
    return (
      <>
        <LoadingDots />
        <h1 className="text-3xl font-medium mt-8">
          Linking this wallet to your Discord account...
        </h1>
      </>
    );
  } else {
    return (
      <>
        <div className="flex align-middle gap-2">
          {props.application === Application.MATCHDAY ? (
            <MatchdayLogo />
          ) : (
            <SolanaLogo height="64px" />
          )}
          <ConnectedIcon />
          <ConnectedDiscordIcon />
        </div>
        <h1 className="text-3xl font-medium mt-8">
          Your new role awaits in Discord!
        </h1>
        <p className="text-lg text-neutral-700 mt-4">
          You can safely close this tab and go back to Discord
        </p>
      </>
    );
  }
};
