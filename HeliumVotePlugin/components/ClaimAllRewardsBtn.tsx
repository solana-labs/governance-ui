import React, { useMemo } from 'react'
import { SecondaryButton } from '@components/Button'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'

export const ClaimAllRewardsBtn: React.FC<{
  className?: string
  onClick: () => void
}> = ({ className = '', onClick }) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const [loading, positions] = useHeliumVsrStore((s) => [
    s.state.isLoading,
    s.state.positions,
  ])

  const positionsWithRewards = useMemo(
    () => positions.filter((p) => p.hasRewards),
    [positions]
  )

  const tooltipContent = !connected
    ? 'Connect your wallet to claim'
    : !positionsWithRewards.length
    ? "You don't have any positions with claimable rewards."
    : ''

  return (
    <SecondaryButton
      tooltipMessage={tooltipContent}
      className={className}
      disabled={!connected || loading || !positionsWithRewards.length}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span>Claim Rewards</span>
      </div>
    </SecondaryButton>
  )
}
