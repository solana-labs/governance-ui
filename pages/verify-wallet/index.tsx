import { GlobalFooter } from '@hub/components/GlobalFooter'
import { useJWT } from '@hub/hooks/useJWT'
import cx from '@hub/lib/cx'

import React from 'react'
import { SignInWithSolana } from './sign-in-with-solana'

// interface Props {
//   className?: string
// }

// Two step process:
// - OAuth with Discord
// - Sign-in with wallet

const DISCORD_BASE_URL = new URL('https://discord.com/api/oauth2/authorize')

// Too lazy to figure out how to actually make this clean
DISCORD_BASE_URL.searchParams.append('client_id', '1041465587202805801')
DISCORD_BASE_URL.searchParams.append(
  'redirect_uri',
  encodeURI('http://localhost:3000/verify-wallet')
)
// We're going to return to the `redirect_uri` with an `access_token` that we can use in the next step
DISCORD_BASE_URL.searchParams.append('response_type', 'token')
DISCORD_BASE_URL.searchParams.append(
  'scope',
  ['role_connections.write'].join(' ')
)
// This is missing the `state` parameter

// We're using an "implicit grant" flow: https://discord.com/developers/docs/topics/oauth2#implicit-grant
// There are tradeoffs in using the implicit grant flow.
// It is both quicker and easier to implement, but rather than exchanging a code and getting a token returned in a secure HTTP body, the access token is returned in the URI fragment, which makes it possibly exposed to unauthorized parties.
// You also are not returned a refresh token, so the user must explicitly re-authorize once their token expires.

const LinkToDiscord = () => (
  <a
    type="button"
    className="btn btn-primary text-white bg-[#7289da] hover:bg-[#7289da]/90 focus:ring-4 focus:outline-none focus:ring-[#7289da]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#7289da]/55 mr-2 mb-2"
    href={DISCORD_BASE_URL.toString()}
    target="_blank"
    rel="noreferrer"
  >
    <img src="/icons/discord.svg" alt="Discord" />
    Link to Discord
  </a>
)

const VerifyAddress = (/* props: Props */) => {
  console.info({ hash: window.location.hash })

  const parsedLocationHash = new URLSearchParams(
    window.location.hash.substring(1)
  )
  for (const [key, value] of parsedLocationHash.entries()) {
    console.log({ key, value })
  }

  const [jwt] = useJWT()

  console.info({ jwt })

  // With both the jwt and the Discord access token, we can hit our backend API to connect everything
  // Maybe that's another button that keeps track of the process and redirects the user back to the Discord app

  return (
    <div
      className={cx(
        'gap-x-12',
        'xl:grid-cols-[418px,1fr]',
        'grid',
        '2xl:ml-[calc((100vw-1536px)/2)]',
        'overflow-x-visible',
        'pt-14'
      )}
    >
      <div
        className={cx(
          'overflow-hidden',
          'pl-3',
          'pr-3',
          'py-8',
          'w-full',
          'md:pl-16',
          'md:pr-0',
          'xl:pl-0'
        )}
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6 bg-bkg-3 h-64 rounded-lg w-full">
            <SignInWithSolana />
          </div>
          <div className="col-span-6 bg-bkg-3 h-64 rounded-lg w-full">
            <LinkToDiscord />
          </div>
        </div>
        <GlobalFooter className="max-w-3xl mx-auto mt-12" />
      </div>
    </div>
  )
}

export default VerifyAddress
