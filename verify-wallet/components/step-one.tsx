import { SignInWithSolana as SignInWithSolanaButton } from '@verify-wallet/components/sign-in-with-solana';

import { SolanaLogo } from '@hub/components/branding/SolanaLogo';

const DirectionRightIcon = () => (
  <img
    src="/verify-wallet/img/Direction--straight--right.svg"
    alt="Right arrow"
    height="24px"
    width="24px"
  />
);

const DiscordLogo = () => (
  <img
    src="/verify-wallet/img/logo-discord.svg"
    alt="Discord"
    height="64px"
    width="64px"
  />
);

export const StepOne = () => (
  <>
    <div className="flex align-middle gap-2">
      <SolanaLogo height="64px" />
      <DirectionRightIcon />
      <DiscordLogo />
    </div>
    <h1 className="text-3xl font-medium mt-8">
      Sign in with Solana to get your role in Discord.
    </h1>
    <p className="text-sm text-neutral-700 mt-4">
      In order to add this role, follow the steps below to connect a Solana
      wallet to your Discord account.
    </p>
    <div className="mt-8">
      <SignInWithSolanaButton />
    </div>
  </>
);
