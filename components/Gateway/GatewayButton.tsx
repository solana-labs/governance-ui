import { IdentityButton } from '@civic/solana-gateway-react'
import { FC } from 'react'

export const GatewayButton: FC = () => (
  <IdentityButton className="gatewayButton !w-1/2 default-transition !font-bold !px-4 !rounded-full !py-2.5 !text-sm focus:!outline-none !bg-primary-light !text-bkg-2 hover:!bg-primary-dark" />
)
