import LockedAccount from '@components/SerumGov/LockedAccount'
import Ticket from '@components/SerumGov/Ticket'
import VestAccount from '@components/SerumGov/VestAccount'
import useSerumGov from '@hooks/useSerumGov'
import { Wallet } from '@models/treasury/Wallet'
import { PublicKey } from '@solana/web3.js'

export default function SerumGovWallet({ wallet }: { wallet: Wallet }) {
  const {
    claimTickets,
    redeemTickets,
    vestAccounts,
    lockedAccounts,
    gsrmBalance,
  } = useSerumGov(wallet.address)

  return (
    <div className="">
      <div className="flex flex-col space-y-2 mt-2">
        {vestAccounts &&
          vestAccounts.map((account) => (
            <VestAccount
              key={account.address.toBase58()}
              account={account}
              gsrmBalance={gsrmBalance}
              createProposal={{
                governance: wallet.governanceAccount,
                owner: new PublicKey(wallet.address),
              }}
            />
          ))}
        {lockedAccounts &&
          lockedAccounts.map((account) => (
            <LockedAccount
              key={account.address.toBase58()}
              account={account}
              gsrmBalance={gsrmBalance}
              createProposal={{
                governance: wallet.governanceAccount,
                owner: new PublicKey(wallet.address),
              }}
            />
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
