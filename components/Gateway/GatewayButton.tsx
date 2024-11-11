import { IdentityButton } from '@civic/solana-gateway-react'
import { FC } from 'react'

export const GatewayButton: FC = () => {
  return (
    <IdentityButton className="gatewayButton sm:w-1/2 max-w-[200px] hover:!border-fgd-1 hover:!text-fgd-1 focus:outline-none disabled:border-fgd-4 disabled:text-fgd-3 disabled:cursor-not-allowed !border !border-primary-light font-bold default-transition rounded-full px-4 py-2.5 !text-primary-light text-sm" />
  )
}
