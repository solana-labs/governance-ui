import Button from '@components/Button'
import Input from '@components/inputs/Input'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import { useEffect, useState } from 'react'
import { Token } from '@models/treasury/Asset'
import Checkbox from '@components/inputs/Checkbox'
import { ParticipantPreset, SellForm } from './models'
import { paramsForTokenSale } from './tools'
import TokenMintInput from '@components/inputs/TokenMintInput'
import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import { abbreviateAddress } from '@utils/formatting'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  createAuctionInstructions,
  AuctionObj,
} from 'auction-house/sdk/auction'
import useWalletStore from 'stores/useWalletStore'
import Modal from '@components/Modal'
import dayjs from 'dayjs'
interface Props {
  className?: string
  asset: Token
}

const MANGO_AUCTION_PROGRAM_ID = 'AReGQtE8e1WC1ztXXq5edtBBPngicGLfLnWeMP7E5WXq'
const DEFAULT_TOKENS_FOR_SALE = 1
const DEFAULT_MIN_PRICE = 1

export default function Sell({ className, asset }: Props) {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
  })
  const [openSaveBackupKeyModal, setOpenSaveBackupKeyModal] = useState(false)
  const [auctionObj, setAuctionObj] = useState<AuctionObj | null>(null)
  const [fileDownloaded, setFileDownloaded] = useState(false)
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
  const DEFAULT_TITLE = `Sell ${form.tokensForSale} ${
    asset.name ? asset.name : abbreviateAddress(asset.id)
  } on auction`
  const DEFAULT_DESCRIPTION = `Sell ${form.tokensForSale} ${
    asset.name ? asset.name : abbreviateAddress(asset.id)
  } on auction for min price: ${form.minPrice}`
  const [proposalInfo, setProposalInfo] = useState({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    voteByCouncil: false,
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
  const closeSaveKeyPrompt = () => {
    setOpenSaveBackupKeyModal(false)
    setAuctionObj(null)
    setFileDownloaded(false)
  }
  const downloadBackupFile = async () => {
    // Create blob link to download
    const url = window.URL.createObjectURL(
      new Blob([JSON.stringify(auctionObj!.localAuctionKey)])
    )
    const link = document.createElement('a')
    link.href = url
    const timestamp = dayjs().unix()
    link.setAttribute(
      'download',
      `keypair-backup-${auctionObj?.auctionPk.toBase58()}-${timestamp}.json`
    )

    // Append to html link element page
    document.body.appendChild(link)

    // Start download
    link.click()

    // Clean up and remove the link
    link.parentNode!.removeChild(link)
    setFileDownloaded(true)
  }
  const promptSaveKey = async (data: SellForm) => {
    const baseMintPk = tryParsePublicKey(data.baseMint)
    const quoteMintPk = tryParsePublicKey(data.quoteMint)
    if (!baseMintPk) {
      throw 'No baseMintPk'
    }
    if (!quoteMintPk) {
      throw 'No quoteMintPk'
    }
    const transactionInstructions: TransactionInstruction[] = []
    const auctionObj = await createAuctionInstructions({
      ...data,
      connection: connection.current,
      wallet: wallet!.publicKey!,
      programId: new PublicKey(MANGO_AUCTION_PROGRAM_ID),
      baseMint: new PublicKey(data.baseMint),
      quoteMint: new PublicKey(data.quoteMint),
    })
    auctionObj.transactionInstructions.unshift(...transactionInstructions)
    setAuctionObj(auctionObj)
    setOpenSaveBackupKeyModal(true)
  }
  const handlePropose = async (auctionObj: any) => {
    console.log(auctionObj)
    closeSaveKeyPrompt()
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
            handleSetForm({
              value: tokenInfo?.address,
              propertyName: 'quoteMint',
            })
          }}
        />
        <div>
          <AdvancedOptionsDropdown
            title="Advanced auction options"
            className="my-5"
          >
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

          <AdditionalProposalOptions
            title={proposalInfo.title}
            description={proposalInfo.description}
            defaultTitle={DEFAULT_TITLE}
            defaultDescription={DEFAULT_DESCRIPTION}
            setTitle={(evt) =>
              setProposalInfo((prev) => ({ ...prev, title: evt.target.value }))
            }
            setDescription={(evt) =>
              setProposalInfo((prev) => ({
                ...prev,
                description: evt.target.value,
              }))
            }
            voteByCouncil={proposalInfo.voteByCouncil}
            setVoteByCouncil={(val) =>
              setProposalInfo((prev) => ({
                ...prev,
                voteByCouncil: val,
              }))
            }
          />
          <div className="flex justify-end">
            <Button onClick={() => promptSaveKey(form)}>Propose</Button>
          </div>
        </div>
      </section>
      {openSaveBackupKeyModal && (
        <Modal onClose={closeSaveKeyPrompt} isOpen={openSaveBackupKeyModal}>
          <div className="mb-1.5 flex flex-col text-th-fgd-2 items-center">
            <div className="mb-3">
              Please save your keypair backup file and do not share it with
              anyone it will be needed to finish the auction
            </div>
            <div>
              <Button className="mb-5" onClick={downloadBackupFile}>
                Download backup file
              </Button>
            </div>

            <Button
              disabled={!fileDownloaded}
              tooltipMessage={
                !fileDownloaded ? 'Download file to start auction' : ''
              }
              onClick={() => handlePropose(auctionObj!)}
            >
              Create auction
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
