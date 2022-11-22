import { GlobalFooter } from '@verify-wallet/components/footer'
import { useJWT } from '@hub/hooks/useJWT'
import cx from '@hub/lib/cx'

import React from 'react'
import { StepOne } from 'verify-wallet/components/step-one'
import { StepTwo } from 'verify-wallet/components/step-two'
import { StepThree } from 'verify-wallet/components/step-three'

const STEPS = {
  STEP_ONE: 0,
  STEP_TWO: 1,
  STEP_THREE: 2,
}

const getCurrentStep = (jwt, accessToken) => {
  if (jwt) {
    if (accessToken) {
      return STEPS.STEP_THREE
    } else {
      return STEPS.STEP_TWO
    }
  }
  return STEPS.STEP_ONE
}

const VerifyWallet = (/* props: Props */) => {
  const parsedLocationHash = new URLSearchParams(
    window.location.search.substring(1)
  )
  const [jwt] = useJWT()

  const currentStep = getCurrentStep(jwt, parsedLocationHash.get('code'))

  return (
    <>
      <div className={cx('grid', 'overflow-x-visible', 'pt-14')}>
        <div className={cx('overflow-hidden', 'w-full', 'py-8')}>
          <div className="grid justify-items-center">
            {currentStep === STEPS.STEP_ONE && <StepOne />}
            {currentStep === STEPS.STEP_TWO && <StepTwo />}
            {currentStep === STEPS.STEP_THREE && <StepThree />}
          </div>
        </div>
      </div>
      <GlobalFooter className="absolute bottom-0 max-w-3xl mx-auto pt-8 bg-white h-[138px]" />
    </>
  )
}

export default VerifyWallet
