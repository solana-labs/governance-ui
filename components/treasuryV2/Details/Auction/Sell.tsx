import Button from '@components/Button'
import Input from '@components/inputs/Input'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import { useEffect, useState } from 'react'
import { Token, Sol } from '@models/treasury/Asset'
import Checkbox from '@components/inputs/Checkbox'
import { ParticipantPreset, SellForm } from './models'
import { paramsForTokenSale } from './tools'
import TokenMintInput from '@components/inputs/TokenMintInput'
interface Props {
  className?: string
  asset: Token | Sol
}

const DEFAULT_TOKENS_FOR_SALE = 1
const DEFAULT_MIN_PRICE = 1

export default function Sell({ className, asset }: Props) {
  const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
  })
  const [auctionSize, setAuctionSize] = useState<number>(ParticipantPreset.M)
  const [form, setForm] = useState<SellForm>({
    baseMint: asset.raw.extensions.mint!.publicKey.toBase58(),
    quoteMint: '',
    areAsksEncrypted: false,
    areBidsEncrypted: true,
    maxOrders: 4,
    orderPhaseLength: 24 * 60 * 60,
    tokensForSale: DEFAULT_TOKENS_FOR_SALE,
    minPrice: DEFAULT_MIN_PRICE,
    ...paramsForTokenSale(
      ParticipantPreset.M,
      DEFAULT_TOKENS_FOR_SALE,
      DEFAULT_MIN_PRICE
    ),
  })
  const [formErrors, setFormErrors] = useState({})
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const sizeBtnClass = (size: number) => {
    const classnames = `text-xs ${size === auctionSize ? 'bg-fgd-1' : ''}`
    return classnames
  }

  useEffect(() => {
    setFormErrors({})
    const newFormValues = form.areBidsEncrypted
      ? {
          ...paramsForTokenSale(auctionSize, form.tokensForSale, form.minPrice),
        }
      : {
          ...paramsForTokenSale(auctionSize, form.tokensForSale, form.minPrice),
          decryptionPhaseLength: 0,
        }
    setForm({
      ...form,
      ...newFormValues,
    })
  }, [form.areBidsEncrypted, form.tokensForSale, form.minPrice, auctionSize])
  return (
    <>
      <section className={`${className} space-y-3`}>
        <h4>Size based on number of participants</h4>
        <div className="grid gap-4 grid-cols-2">
          {Object.values(ParticipantPreset)
            .filter((x) => typeof x === 'string')
            .map((key) => (
              <Button
                key={key}
                onClick={() => setAuctionSize(ParticipantPreset[key])}
                className={sizeBtnClass(ParticipantPreset[key])}
              >
                {key} Auction {formatter.format(ParticipantPreset[key])}
              </Button>
            ))}
        </div>
        <h4>Details</h4>
        <Input
          label="Tokens for sale"
          value={form.tokensForSale}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'tokensForSale',
            })
          }
          error={formErrors['tokensForSale']}
        />
        <Input
          label="Min price"
          value={form.minPrice}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'minPrice',
            })
          }
          error={formErrors['minPrice']}
        />
        <Input
          label="Max orders per users"
          value={form.maxOrders}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'maxOrders',
            })
          }
          error={formErrors['maxOrders']}
        />
        <Input
          label="Order phase length (sec)"
          value={form.orderPhaseLength}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'orderPhaseLength',
            })
          }
          error={formErrors['orderPhaseLength']}
        />
        <div className="mt-3 py-3">
          <Checkbox
            checked={form.areBidsEncrypted}
            label="Encrypt bids"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.checked,
                propertyName: 'areBidsEncrypted',
              })
            }
            error={formErrors['areBidsEncrypted']}
          />
        </div>
        <TokenMintInput
          label={'Quote mint'}
          onValidMintChange={(mintAddress, tokenInfo) => {
            console.log(tokenInfo)
          }}
        />
        <div>
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
          <div className="flex justify-end">
            <Button>Propose</Button>
          </div>
        </div>
      </section>
    </>
  )
}
