const SolanaConnectedIcon = () => (
  <img
    src="/verify-wallet/img/icon-solana-connected.svg"
    alt="Connected"
    height="64px"
    width="64px"
  />
);

export const StepTwo = () => {
  const DISCORD_AUTHORIZE_URL = `https://discord.com/api/oauth2/authorize?${new URLSearchParams(
    {
      client_id: process.env.DISCORD_APPLICATION_CLIENT_ID!,
      redirect_uri: encodeURI(
        `${window.location.protocol}//${window.location.host}/verify-wallet`,
      ),
      response_type: 'code',
      scope: ['role_connections.write'].join(' '),
    },
  )}`;

  return (
    <>
      <SolanaConnectedIcon />
      <h1 className="text-3xl font-medium mt-8">
        Your wallet has been verified!
      </h1>
      <p className="text-sm text-neutral-700 mt-4">
        To continue, please link with Discord by clicking the button below.
      </p>
      <div className="mt-8">
        <a
          type="button"
          className="btn btn-primary text-white bg-discord hover:bg-discord/90 focus:ring-4 focus:outline-none focus:ring-discord/50 font-medium rounded-lg text-sm px-5 py-2.5 h-[40px] text-center inline-flex items-center dark:focus:ring-discord/55 mr-2 mb-2"
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
};
