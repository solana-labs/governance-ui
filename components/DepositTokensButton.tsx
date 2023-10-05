import { BigNumber } from 'bignumber.js'
import Button, { ButtonProps, SecondaryButton } from '@components/Button'
import BN from 'bn.js'
import useUserGovTokenAccountQuery from '@hooks/useUserGovTokenAccount'
import { useDepositCallback } from './GovernancePower/Vanilla/useDepositCallback'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

export const DepositTokensButton = ({
  role,
  as = 'secondary',
  ...props
}: { role: 'community' | 'council'; as?: 'primary' | 'secondary' } & Omit<
  ButtonProps,
  'onClick' | 'tooltipMessage'
>) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const userAta = useUserGovTokenAccountQuery(role).data?.result
  const depositAmount = userAta?.amount
    ? new BigNumber(userAta.amount.toString())
    : new BigNumber(0)

  const hasTokensInWallet = depositAmount.isGreaterThan(0)
  const depositTooltipContent = !connected
    ? 'Connect your wallet to deposit'
    : !hasTokensInWallet
    ? "You don't have any governance tokens in your wallet to deposit."
    : undefined

  const ButtonToUse = as === 'primary' ? Button : SecondaryButton

  const deposit = useDepositCallback(role)
  return (
    <ButtonToUse
      {...props}
      onClick={() => deposit(new BN(depositAmount.toString()))}
      tooltipMessage={depositTooltipContent}
      disabled={!connected || !hasTokensInWallet || props.disabled}
    >
      Deposit
    </ButtonToUse>
  )
}
