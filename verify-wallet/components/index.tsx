import { GlobalFooter } from '@verify-wallet/components/footer';
import { StepOne } from '@verify-wallet/components/step-one';
import { StepThree } from '@verify-wallet/components/step-three';
import { StepTwo } from '@verify-wallet/components/step-two';
import { Application } from '@verify-wallet/constants';

import { useJWT } from '@hub/hooks/useJWT';
import cx from '@hub/lib/cx';

enum VerifyWalletSteps {
  SIGN_IN_WITH_SOLANA, // Step one
  AUTHORIZE_DISCORD_OAUTH, // Step two
  UPDATE_DISCORD_METADATA, // Step three
}

const getCurrentStep = (jwt: string | null, oauthCode: string | null) => {
  if (jwt) {
    if (oauthCode) {
      return VerifyWalletSteps.UPDATE_DISCORD_METADATA;
    } else {
      return VerifyWalletSteps.AUTHORIZE_DISCORD_OAUTH;
    }
  }
  return VerifyWalletSteps.SIGN_IN_WITH_SOLANA;
};

interface Props {
  application: Application;
  discordCode: string | null;
}

const VerifyWallet = (props: Props) => {
  const [jwt] = useJWT();

  const currentStep = getCurrentStep(jwt, props.discordCode);

  return (
    <>
      <div
        className={cx('grid', 'overflow-x-visible', 'pt-14', 'min-h-screen')}
      >
        <div className={cx('overflow-hidden', 'w-full', 'py-8')}>
          <div className="grid justify-items-center">
            {currentStep === VerifyWalletSteps.SIGN_IN_WITH_SOLANA && (
              <StepOne application={props.application} />
            )}
            {currentStep === VerifyWalletSteps.AUTHORIZE_DISCORD_OAUTH && (
              <StepTwo application={props.application} />
            )}
            {currentStep === VerifyWalletSteps.UPDATE_DISCORD_METADATA && (
              <StepThree application={props.application} />
            )}
          </div>
        </div>
      </div>
      <GlobalFooter className="absolute bottom-0 w-full mx-auto pt-8 bg-white h-[138px]" />
    </>
  );
};

export default VerifyWallet;
