import { SignInWithSolana as SignInWithSolanaButton } from '@verify-wallet/components/sign-in-with-solana';

const DiscordLogo = () => (
  <img src="/icons/discord.svg" alt="Discord" height="32px" width="32px" />
);

export const StepOne = () => (
  <>
    <DiscordLogo />
    <h1 className="text-3xl font-medium mt-8">
      Sign-in with Solana to get your role in Discord.
    </h1>
    <p className="text-sm text-neutral-700 mt-4">
      This role requires a Solana wallet to be connected to your Discord.
      account
    </p>
    <div className="mt-8">
      <SignInWithSolanaButton />
    </div>
  </>
);
