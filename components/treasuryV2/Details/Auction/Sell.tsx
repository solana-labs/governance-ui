import Button from '@components/Button'
import Input from '@components/inputs/Input'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import { useEffect, useState } from 'react'
import { Token, Sol } from '@models/treasury/Asset'

interface SizeForm {
  baseMint: string
  quoteMint: string
  areAsksEncrypted: boolean
  areBidsEncrypted: boolean
  minBaseOrderSize: number
  tickSize: number
  orderPhaseLength: number
  decryptionPhaseLength: number
  eventQueueBytes: number
  bidsBytes: number
  asksBytes: number
  maxOrders: number
}

interface Props {
  className?: string
  asset: Token | Sol
}

export default function Sell({ className, asset }: Props) {
  const [auctionSize, setAuctionSize] = useState<number>(ParticipantPreset.M)
  const [form, setForm] = useState<SizeForm>({
    baseMint: asset.raw.extensions.mint!.publicKey.toBase58(),
    quoteMint: '',
    areAsksEncrypted: false,
    areBidsEncrypted: true,
    maxOrders: 4,
    orderPhaseLength: 24 * 60 * 60,
    ...paramsForTokenSale(ParticipantPreset.M, 0, 0),
  })
  const [formErrors, setFormErrors] = useState({})
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const sizeBtnClass = (size: number) => {
    const classnames = `w-1/2 text-xs ${size === auctionSize ? 'bg-fgd-1' : ''}`
    return classnames
  }

  useEffect(() => {
    setFormErrors({})
    setForm({
      ...form,
      ...paramsForTokenSale(auctionSize, 0, 0),
    })
  }, [auctionSize])

  return (
    <>
      <section className={className}>
        <h4 className="mb-3">Size (number of participants)</h4>
        <div className="flex space-x-3">
          {Object.values(ParticipantPreset)
            .filter((x) => typeof x === 'string')
            .map((key) => (
              <Button
                key={key}
                onClick={() => setAuctionSize(ParticipantPreset[key])}
                className={sizeBtnClass(ParticipantPreset[key])}
              >
                {key} Auction ({ParticipantPreset[key]})
              </Button>
            ))}
        </div>
        <AdvancedOptionsDropdown className="my-5">
          <div className="space-y-3">
            <Input
              label="Min Base Order Size"
              value={form.minBaseOrderSize}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'minBaseOrderSize',
                })
              }
              error={formErrors['minBaseOrderSize']}
            />
            <Input
              label="Tick Size"
              value={form.tickSize}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'tickSize',
                })
              }
              error={formErrors['tickSize']}
            />
            <Input
              label="Decryption Phase Length"
              value={form.decryptionPhaseLength}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'decryptionPhaseLength',
                })
              }
              error={formErrors['decryptionPhaseLength']}
            />
            <Input
              label="Event Queue Bytes"
              value={form.eventQueueBytes}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'eventQueueBytes',
                })
              }
              error={formErrors['eventQueueBytes']}
            />
            <Input
              label="Bids Bytes"
              value={form.bidsBytes}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'bidsBytes',
                })
              }
              error={formErrors['bidsBytes']}
            />
            <Input
              label="Asks Bytes"
              value={form.asksBytes}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'asksBytes',
                })
              }
              error={formErrors['asksBytes']}
            />
          </div>
        </AdvancedOptionsDropdown>
      </section>
      <section className={className}>
        <h4 className="mb-3">Details</h4>
        Base mint: this token Quote mint: Encrypt bids Min order size Tick size
        Order phase duration Decryption phase duration Max orders per user
      </section>
    </>
  )
}

enum ParticipantPreset {
  S = 1000,
  M = 10_000,
  L = 100_000,
  XL = 1_000_000,
}

const paramsForTokenSale = function (
  participants: number,
  tokensForSale: number,
  reservePrice: number
) {
  return {
    minBaseOrderSize: tokensForSale / participants,
    tickSize: reservePrice / 10000,
    decryptionPhaseLength: 60 * 60 + participants / 10, // 15min + 10 participants per second
    eventQueueBytes: 1024 * 200, // 1024 events, 200 bytes per event
    bidsBytes: participants * 16, // 16 bytes per participant
    asksBytes: 64 * 16, // allow 64 asks for selling side
  }
  // TODO derive quote / base fee receiver from base mint and mango governance
  // TODO find a clean tick size?
  // TODO assign default program id
}
