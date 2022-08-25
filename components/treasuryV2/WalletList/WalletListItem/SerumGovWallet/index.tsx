import LockedAccount from '@components/SerumGov/LockedAccount'
import Ticket from '@components/SerumGov/Ticket'
import VestAccount from '@components/SerumGov/VestAccount'
import useWallet from '@hooks/useWallet'
import { Wallet } from '@models/treasury/Wallet'
import { PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'
import useSerumGovStore from 'stores/useSerumGovStore'

export default function SerumGovWallet({
  wallet,
  isOpen,
}: {
  wallet: Wallet
  isOpen: boolean
}) {
  const { anchorProvider } = useWallet()
  const actions = useSerumGovStore((s) => s.actions)
  const claimTickets = useSerumGovStore((s) => s.claimTickets)
  const redeemTickets = useSerumGovStore((s) => s.redeemTickets)
  const lockedAccounts = useSerumGovStore((s) => s.lockedAccounts)
  const vestAccounts = useSerumGovStore((s) => s.vestAccounts)
  // const gsrmBalance = useSerumGovStore((s) => s.gsrmBalance)

  useEffect(() => {
    if (isOpen) {
      actions.getLockedAccounts(anchorProvider, new PublicKey(wallet.address))
      actions.getVestAccounts(anchorProvider, new PublicKey(wallet.address))
      actions.getClaimTickets(anchorProvider, new PublicKey(wallet.address))
      actions.getRedeemTickets(anchorProvider, new PublicKey(wallet.address))
    }
  }, [wallet.address])

  return (
    <div className="">
      <div className="flex flex-col space-y-2 mt-2">
        {vestAccounts &&
          vestAccounts.map((account) => (
            <VestAccount
              key={account.address.toBase58()}
              account={account}
              createProposal={{
                governance: wallet.governanceAccount,
                owner: new PublicKey(wallet.address),
              }}
            />
          ))}
        {lockedAccounts &&
          lockedAccounts.map((account) => (
            <LockedAccount key={account.address.toBase58()} account={account} />
          ))}
      </div>
      <div>
        {claimTickets.length > 0 || redeemTickets.length > 0 ? (
          <div className="flex flex-col space-y-2 mt-2">
            {claimTickets &&
              claimTickets.map((ticket) => (
                <Ticket
                  key={ticket.createdAt}
                  ticket={ticket}
                  createProposal={{
                    governance: wallet.governanceAccount,
                    owner: new PublicKey(wallet.address),
                  }}
                />
              ))}
            {redeemTickets &&
              redeemTickets.map((ticket) => (
                <Ticket
                  key={ticket.createdAt}
                  ticket={ticket}
                  createProposal={{
                    governance: wallet.governanceAccount,
                    owner: new PublicKey(wallet.address),
                  }}
                />
              ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
