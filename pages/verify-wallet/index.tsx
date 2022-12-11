import { GlobalFooter } from '@verify-wallet/components/footer'
import cx from '@hub/lib/cx'

import React from 'react'
import { StepOne } from '@verify-wallet/components/step-one'
import { StepTwo } from '@verify-wallet/components/step-two'
import { StepThree } from '@verify-wallet/components/step-three'
import { useQuery } from '@hub/hooks/useQuery'
import * as gql from '@hub/components/GlobalHeader/User/gql'

enum VerifyWalletSteps {
  SIGN_IN_WITH_SOLANA, // Step one
  AUTHORIZE_DISCORD_OAUTH, // Step two
  UPDATE_DISCORD_METADATA, // Step three
}

const getCurrentStep = ({ user }, accessToken) => {
  if (user && !user.error) {
    if (accessToken) {
      return VerifyWalletSteps.UPDATE_DISCORD_METADATA
    } else {
      return VerifyWalletSteps.AUTHORIZE_DISCORD_OAUTH
    }
  }
  return VerifyWalletSteps.SIGN_IN_WITH_SOLANA
}

const VerifyWallet = (/* props: Props */) => {
  const parsedLocationHash = new URLSearchParams(
    window.location.search.substring(1)
  )
  const [user] = useQuery(gql.getUserResp, { query: gql.getUser })

  const currentStep = getCurrentStep({ user }, parsedLocationHash.get('code'))

  return (
    <>
      <div
        className={cx('grid', 'overflow-x-visible', 'pt-14', 'min-h-screen')}
      >
        <div className={cx('overflow-hidden', 'w-full', 'py-8')}>
          <div className="grid justify-items-center">
            {currentStep === VerifyWalletSteps.SIGN_IN_WITH_SOLANA && (
              <StepOne />
            )}
            {currentStep === VerifyWalletSteps.AUTHORIZE_DISCORD_OAUTH && (
              <StepTwo />
            )}
            {currentStep === VerifyWalletSteps.UPDATE_DISCORD_METADATA && (
              <StepThree />
            )}
          </div>
        </div>
      </div>
      <GlobalFooter className="absolute bottom-0 w-full mx-auto pt-8 bg-white h-[138px]" />
    </>
  )
}

export default VerifyWallet
