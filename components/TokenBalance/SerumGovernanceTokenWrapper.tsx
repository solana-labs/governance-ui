import { FC } from 'react'

import Ticket from '@components/SerumGov/Ticket'
import useWallet from '@hooks/useWallet'
import LockedAccount from '@components/SerumGov/LockedAccount'
import VestAccount from '@components/SerumGov/VestAccount'
import useSerumGov from '@hooks/useSerumGov'

const SerumGovernanceTokenWrapper: FC = () => {
  const { wallet } = useWallet()

  const {
    claimTickets,
    redeemTickets,
    lockedAccounts,
    vestAccounts,
    gsrmBalance,
    refreshRedeemTickets,
    refreshVestAccounts,
    refreshLockedAccounts,
    refreshClaimTickets,
    refreshGsrmBalance,
  } = useSerumGov(wallet?.publicKey)

  return (
    <div>
      <div className="flex items-center mt-4 space-x-4">
        <div className="w-full px-4 py-2 rounded-md bg-bkg-1 flex flex-row items-center justify-between">
          <div>
            <p className="text-xs text-fgd-3">gSRM Tokens</p>
            <p className="mb-0 text-xl font-bold text-fgd-1 hero-text">
              {gsrmBalance && gsrmBalance.uiAmount ? gsrmBalance?.uiAmount : 0}
            </p>
          </div>
        </div>
      </div>
      <div className="py-2">
        <div className="flex flex-col space-y-2 mt-2">
          {vestAccounts &&
            vestAccounts.map((account) => (
              <VestAccount
                key={account.address.toBase58()}
                account={account}
                gsrmBalance={gsrmBalance}
                callback={async () => {
                  await refreshGsrmBalance()
                  await refreshVestAccounts()
                  await refreshRedeemTickets()
                }}
              />
            ))}
          {lockedAccounts &&
            lockedAccounts.map((account) => (
              <LockedAccount
                key={account.address.toBase58()}
                account={account}
                gsrmBalance={gsrmBalance}
                callback={async () => {
                  await refreshGsrmBalance()
                  await refreshLockedAccounts()
                  await refreshRedeemTickets()
                }}
              />
            ))}
        </div>

        {claimTickets.length > 0 || redeemTickets.length > 0 ? (
          <div className="flex flex-col space-y-2 mt-2">
            <p className="text-md text-fgd-2">Tickets</p>
            {claimTickets &&
              claimTickets.map((ticket) => (
                <Ticket
                  key={ticket.createdAt}
                  ticket={ticket}
                  callback={async () => {
                    await refreshGsrmBalance()
                    await refreshClaimTickets()
                  }}
                />
              ))}
            {redeemTickets &&
              redeemTickets.map((ticket) => (
                <Ticket
                  key={ticket.createdAt}
                  ticket={ticket}
                  callback={refreshRedeemTickets}
                />
              ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SerumGovernanceTokenWrapper
