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
