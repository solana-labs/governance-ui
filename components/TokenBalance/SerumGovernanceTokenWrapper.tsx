import { FC, useEffect } from 'react'

import Ticket from '@components/SerumGov/Ticket'
import useSerumGovStore from 'stores/useSerumGovStore'
import useWalletStore from 'stores/useWalletStore'
import useWallet from '@hooks/useWallet'

const SerumGovernanceTokenWrapper: FC = () => {
  const { anchorProvider, wallet } = useWallet()
  const connection = useWalletStore((s) => s.connection.current)
  const actions = useSerumGovStore((s) => s.actions)
  const claimTickets = useSerumGovStore((s) => s.claimTickets)
  const gsrmBalance = useSerumGovStore((s) => s.gsrmBalance)
  const isLoading = useSerumGovStore((s) => s.isLoading)

  useEffect(() => {
    actions.load(connection)
  }, [])

  useEffect(() => {
    actions.getClaimTickets(anchorProvider, wallet?.publicKey)
    actions.getGsrmBalance(connection, wallet?.publicKey)
  }, [wallet?.publicKey])

  if (isLoading) {
    return <h3>Loading</h3>
  }

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
        {claimTickets &&
          claimTickets.map((ticket) => (
            <Ticket key={ticket.createdAt} ticket={ticket} />
          ))}
      </div>
    </div>
  )
}

export default SerumGovernanceTokenWrapper
