import useWallet from '@hooks/useWallet'
import { fmtMintAmount } from '@tools/sdk/units'
import { notify } from '@utils/notifications'
import { BigNumber } from 'bignumber.js'
import { FC, useEffect, useState } from 'react'
import useSerumGovStore, {
  ClaimTicketType,
  MSRM_DECIMALS,
  RedeemTicketType,
  SRM_DECIMALS,
} from 'stores/useSerumGovStore'
import useWalletStore from 'stores/useWalletStore'

type TicketType = ClaimTicketType | RedeemTicketType

function isClaimTicket(
  toBeDetermined: TicketType
): toBeDetermined is ClaimTicketType {
  if ((toBeDetermined as ClaimTicketType).claimDelay) {
    return true
  }
  return false
}

type Props = {
  ticket: TicketType
}
const Ticket: FC<Props> = ({ ticket }) => {
  const connection = useWalletStore((s) => s.connection.current)
  const { anchorProvider, wallet } = useWallet()
  const actions = useSerumGovStore((s) => s.actions)
  const gsrmMint = useSerumGovStore((s) => s.gsrmMint)
  const [currentTimestamp, setCurrentTimestamp] = useState(0)

  useEffect(() => {
    const timestampInterval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timestampInterval)
  })

  const handleButton = async (ticket: TicketType) => {
    if (wallet && wallet.publicKey) {
      if (isClaimTicket(ticket)) {
        await actions.claim(connection, anchorProvider, ticket, wallet)
      } else {
        await actions.redeem(connection, anchorProvider, ticket, wallet)
      }
    } else {
      notify({ type: 'error', message: 'Wallet not connected.' })
    }
  }

  return (
    <div className="p-3 text-xs rounded-md bg-bkg-3">
      <p className="text-xs text-fgd-3 mb-1">
        {isClaimTicket(ticket) ? 'Claim Ticket' : 'Redeem Ticket'}
      </p>
      <div className="w-full flex items-center justify-between">
        {gsrmMint && (
          <p className="text-fgd-1 text-xl font-semibold">
            {isClaimTicket(ticket)
              ? `${fmtMintAmount(gsrmMint, ticket.gsrmAmount)}`
              : `${new BigNumber(ticket.amount.toString())
                  .shiftedBy(
                    -1 * (ticket.isMsrm ? MSRM_DECIMALS : SRM_DECIMALS)
                  )
                  .toFormat()}`}{' '}
            {isClaimTicket(ticket) ? 'gSRM' : ticket.isMsrm ? 'MSRM' : 'SRM'}
          </p>
        )}
        <button
          className={`py-2 px-4 rounded-md bg-green text-fgd-4 disabled:bg-fgd-4 disabled:text-gray-500`}
          onClick={async () => await handleButton(ticket)}
          disabled={
            ticket.createdAt +
              (isClaimTicket(ticket) ? ticket.claimDelay : ticket.redeemDelay) >
            currentTimestamp
          }
        >
          {isClaimTicket(ticket) ? 'Claim' : 'Redeem'}
        </button>
      </div>
    </div>
  )
}

export default Ticket
