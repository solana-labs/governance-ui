import { XIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { SolanaLogo } from '@hub/components/branding/SolanaLogo';
import { LoadingDots } from '@hub/components/LoadingDots';
import { useMutation } from '@hub/hooks/useMutation';
import * as RE from '@hub/types/Result';

import * as gqlWallet from './gql';

const DiscordLogo = () => (
  <img src="/icons/discord.svg" alt="Discord" height="32px" width="32px" />
);

const STATES = {
  FAILED: 'FAILED',
  VERIFYING: 'VERIFYING',
  VERIFIED: 'VERIFIED',
};

const Prompt = () => {
  const [, verifyWallet] = useMutation(
    gqlWallet.verifyWalletResp,
    gqlWallet.verifyWallet,
  );
  const [status, setStatus] = useState(STATES.VERIFYING);
  const parsedLocationHash = new URLSearchParams(
    window.location.search.substring(1),
  );

  const router = useRouter();

  useEffect(() => {
    const updateDiscordMetadata = async () => {
      try {
        const verifyWalletResult = await verifyWallet({
          code: parsedLocationHash.get('code'),
        });

        if (RE.isFailed(verifyWalletResult)) {
          // Likely an issue like the Discord code has already been used
          // Probably should redirect to `verify-wallet`
          setStatus(STATES.FAILED);
          console.error(verifyWalletResult.error);
          setTimeout(() => {
            router.push('/verify-wallet');
          }, 5000);
          throw verifyWalletResult.error;
        }

        setStatus(STATES.VERIFIED);
      } catch (e) {
        console.error(e);
      }
    };
    if (parsedLocationHash.get('code')) {
      updateDiscordMetadata();
    }
  }, [window.location.search]);

  if (status === STATES.FAILED) {
    return (
      <>
        <XIcon height="48px" className="text-red" />
        <h1 className="text-3xl font-medium mt-8">Something went wrong!</h1>
        <p className="text-sm text-neutral-700 mt-4">
          Retrying the connection to Discord...
        </p>
      </>
    );
  } else if (status === STATES.VERIFYING) {
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
        <div className="flex align-middle gap-1">
          <SolanaLogo height="32px" />
          <XIcon height="14px" className="my-auto" />
          <DiscordLogo />
        </div>
        <h1 className="text-3xl font-medium mt-8">
          Your new role awaits in Discord!
        </h1>
        {/* <div className="mt-8">
          <a
            type="button"
            className="btn btn-primary text-white bg-[#7289da] hover:bg-[#7289da]/90 focus:ring-4 focus:outline-none focus:ring-[#7289da]/50 font-medium rounded-lg text-sm px-5 py-2.5 h-[40px] text-center inline-flex items-center dark:focus:ring-[#7289da]/55 mr-2 mb-2"
            href={'discord://'}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/icons/discord.svg"
              alt="Discord"
              className="h-[18px] w-[18px] mr-2"
            />
            Return to Discord
          </a>
        </div> */}
        <p className="text-lg text-neutral-700 mt-4">
          You can safely close this tab and go back to Discord
        </p>
      </>
    );
  }
};

export const StepThree = () => {
  return <Prompt />;
};
