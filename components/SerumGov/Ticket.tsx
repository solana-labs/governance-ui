import { fmtMintAmount } from '@tools/sdk/units'
import { FC, useEffect, useState } from 'react'
import useSerumGovStore, {
  ClaimTicketType,
  RedeemTicketType,
} from 'stores/useSerumGovStore'

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
  ticket: ClaimTicketType
}
const Ticket: FC<Props> = ({ ticket }) => {
  const gsrmMint = useSerumGovStore((s) => s.gsrmMint)
  const [currentTimestamp, setCurrentTimestamp] = useState(0)

  useEffect(() => {
    const timestampInterval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timestampInterval)
  })

  useEffect(() => {
    console.log(gsrmMint)
  }, [gsrmMint])

  return (
    <div className="p-3 text-xs rounded-md bg-bkg-3">
      <p className="text-xs text-fgd-3 mb-1">
        {isClaimTicket(ticket) ? 'Claim Ticket' : 'Redeem Ticket'}
      </p>
      <div className="w-full flex items-center justify-between">
        {gsrmMint && (
          <p className="text-fgd-1 text-xl font-semibold">
            {fmtMintAmount(gsrmMint, ticket.gsrmAmount)} gSRM
          </p>
        )}

        <button
          className={`py-2 px-4 rounded-md ${
            ticket.createdAt + ticket.claimDelay > currentTimestamp
              ? 'bg-fgd-4 text-gray-500'
              : 'bg-green text-fgd-4'
          }`}
        >
          Claim
        </button>
      </div>
    </div>
  )
}

export default Ticket
