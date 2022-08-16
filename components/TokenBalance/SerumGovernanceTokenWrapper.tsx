import { FC, useEffect } from 'react'

import Ticket from '@components/SerumGov/Ticket'
import useSerumGovStore from 'stores/useSerumGovStore'
import useWalletStore from 'stores/useWalletStore'
import useWallet from '@hooks/useWallet'
import LockedAccount from '@components/SerumGov/LockedAccount'

const SerumGovernanceTokenWrapper: FC = () => {
  const { anchorProvider, wallet } = useWallet()
  const connection = useWalletStore((s) => s.connection.current)
  const actions = useSerumGovStore((s) => s.actions)
  const claimTickets = useSerumGovStore((s) => s.claimTickets)
  const redeemTickets = useSerumGovStore((s) => s.redeemTickets)
  const lockedAccounts = useSerumGovStore((s) => s.lockedAccounts)
  const gsrmBalance = useSerumGovStore((s) => s.gsrmBalance)

  useEffect(() => {
    actions.load(connection)
  }, [])

  useEffect(() => {
    actions.getLockedAccounts(anchorProvider, wallet?.publicKey)
    actions.getClaimTickets(anchorProvider, wallet?.publicKey)
    actions.getGsrmBalance(connection, wallet?.publicKey)
    actions.getRedeemTickets(anchorProvider, wallet?.publicKey)
  }, [wallet?.publicKey])

  return (
    <div>
      {/* <p>{wallet?.publicKey?.toBase58()}</p> */}
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
        {lockedAccounts &&
          lockedAccounts.map((account) => (
            <LockedAccount key={account.address.toBase58()} account={account} />
          ))}
        {claimTickets.length > 0 || redeemTickets.length > 0 ? (
          <div className="flex flex-col space-y-2 mt-2">
            <p className="text-md text-fgd-2">Tickets</p>
            {claimTickets &&
              claimTickets.map((ticket) => (
                <Ticket key={ticket.createdAt} ticket={ticket} />
              ))}
            {redeemTickets &&
              redeemTickets.map((ticket) => (
                <Ticket key={ticket.createdAt} ticket={ticket} />
              ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SerumGovernanceTokenWrapper
