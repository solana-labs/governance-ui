import { SolanaLogo } from '@hub/components/branding/SolanaLogo';

const DISCORD_AUTHORIZE_URL = `https://discord.com/api/oauth2/authorize?${new URLSearchParams(
  {
    // Too lazy to figure out how to actually make this clean
    client_id: '1042836142560645130',
    redirect_uri: encodeURI('http://localhost:3000/verify-wallet'),
    response_type: 'code',
    scope: ['role_connections.write'].join(' '),
  },
)}`;

export const StepTwo = () => (
  <>
    <SolanaLogo height="32px" />
    <h1 className="text-3xl font-medium mt-8">
      Your wallet has been verified!
    </h1>
    <p className="text-sm text-neutral-700 mt-4">
      To continue, please link with Discord by clicking the button below.
    </p>
    <div className="mt-8">
      <a
        type="button"
        className="btn btn-primary text-white bg-[#7289da] hover:bg-[#7289da]/90 focus:ring-4 focus:outline-none focus:ring-[#7289da]/50 font-medium rounded-lg text-sm px-5 py-2.5 h-[40px] text-center inline-flex items-center dark:focus:ring-[#7289da]/55 mr-2 mb-2"
        href={DISCORD_AUTHORIZE_URL.toString()}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="/icons/discord.svg"
          alt="Discord"
          className="h-[18px] w-[18px]"
        />
        Link to Discord
      </a>
    </div>
    <p className="text-xs text-neutral-700 mt-4">
      (This will open a new window)
    </p>
  </>
);
