import { XIcon } from '@heroicons/react/solid';
import type { PublicKey } from '@solana/web3.js';
import { pipe } from 'fp-ts/function';
import { useEffect, useState } from 'react';

import { SolanaLogo } from '@hub/components/branding/SolanaLogo';
import * as gql from '@hub/components/GlobalHeader/User/gql';
import { LoadingDots } from '@hub/components/LoadingDots';
import { useMutation } from '@hub/hooks/useMutation';
import { useQuery } from '@hub/hooks/useQuery';
import * as RE from '@hub/types/Result';

import * as gqlWallet from './gql';

const DiscordLogo = () => (
  <img src="/icons/discord.svg" alt="Discord" height="32px" width="32px" />
);

const STATES = {
  VERIFYING: 'VERIFYING',
  VERIFIED: 'VERIFIED',
};

const Prompt = ({ publicKey }: { publicKey: PublicKey }) => {
  const [, verifyWallet] = useMutation(
    gqlWallet.verifyWalletResp,
    gqlWallet.verifyWallet,
  );
  const [status, setStatus] = useState(STATES.VERIFYING);
  const parsedLocationHash = new URLSearchParams(
    window.location.hash.substring(1),
  );

  useEffect(() => {
    const updateDiscordMetadata = async () => {
      console.info('updating!', publicKey.toBase58());
      try {
        const response = await verifyWallet({
          code: parsedLocationHash.get('code'),
        });

        const responseJson = await response.json();
        // TODO(jon): Actually check the status of the response
        setStatus(STATES.VERIFIED);
        console.info({ responseJson });
      } catch (e) {
        console.error(e);
      }
    };
    if (parsedLocationHash.get('access_token')) {
      updateDiscordMetadata();
    }
  }, [parsedLocationHash]);

  if (status === STATES.VERIFYING) {
    // TODO(jon): Add intermediary state
    return (
      <>
        <LoadingDots />
        <h1 className="text-3xl font-medium mt-8">
          Your new role awaits in Discord!
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
        <div className="mt-8">
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
        </div>
        <p className="text-xs text-neutral-700 mt-4">
          (This will open the Discord app)
        </p>
      </>
    );
  }
};

export const StepThree = () => {
  const [result] = useQuery(gql.getUserResp, { query: gql.getUser });

  return pipe(
    result,
    RE.match(
      () => <></>,
      () => <></>,
      ({ me }) => <Prompt publicKey={me.publicKey} />,
    ),
  );
};
