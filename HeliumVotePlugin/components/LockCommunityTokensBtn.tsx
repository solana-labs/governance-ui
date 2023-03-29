import React from 'react'
import { BN } from '@coral-xyz/anchor'
import { LockClosedIcon } from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import { SecondaryButton } from '@components/Button'
import useWalletStore from 'stores/useWalletStore'

export const LockCommunityTokensBtn: React.FC<{
  className?: string
  onClick: () => void
}> = ({ onClick, className = '' }) => {
  const { realmTokenAccount } = useRealm()
  const connected = useWalletStore((s) => s.connected)

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const tooltipContent = !connected
    ? 'Connect your wallet to lock'
    : !hasTokensInWallet
    ? "You don't have any governance tokens in your wallet to lock."
    : ''

  return (
    <SecondaryButton
      tooltipMessage={tooltipContent}
      className={className}
      disabled={!connected || !hasTokensInWallet}
      onClick={onClick}
    >
      <div className="flex items-center">
        <LockClosedIcon className="h-5 mr-1.5 w-5" />
        <span>Lock Tokens</span>
      </div>
    </SecondaryButton>
  )
}
