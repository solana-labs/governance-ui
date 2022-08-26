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
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import Modal from '@components/Modal'
import dayjs from 'dayjs'
import {
  createInitOpenOrdersInstructions,
  createNewOrderInstructions,
  getOpenOrdersPk,
  getOrderHistoryPk,
  getCreateDefaultFeeAtas,
  createAuctionInstructions,
  AuctionObj,
} from 'auction-house-sdk/sdk'
import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token as SPL_TOKEN,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import useCreateProposal from '@hooks/useCreateProposal'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { notify } from '@utils/notifications'
import Switch from '@components/Switch'
interface Props {
  className?: string
  asset: Token
}

const MANGO_AUCTION_PROGRAM_ID = new PublicKey(
  'AReGQtE8e1WC1ztXXq5edtBBPngicGLfLnWeMP7E5WXq'
)
const DEFAULT_TOKENS_FOR_SALE = 1
const DEFAULT_MIN_PRICE = 1

export default function Sell({ className, asset }: Props) {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
  })
  const { symbol } = useRealm()
  const router = useRouter()
  const { handleCreateProposal } = useCreateProposal()
  const { fmtUrlWithCluster } = useQueryContext()
  const [openSaveBackupKeyModal, setOpenSaveBackupKeyModal] = useState(false)
  const [auctionObj, setAuctionObj] = useState<AuctionObj | null>(null)
  const [fileDownloaded, setFileDownloaded] = useState(false)
  const [auctionSize, setAuctionSize] = useState<number>(ParticipantPreset.M)
  const [withCreateAuction, setWithCreateAuction] = useState(true)
  const [form, setForm] = useState<SellForm>({
    baseMint: asset.raw.extensions.mint!.publicKey.toBase58(),
    quoteMint: '',
    areAsksEncrypted: false,
    areBidsEncrypted: true,
    maxOrders: 4,
    orderPhaseLength: 900, //24 * 60 * 60,
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
    title: '',
    description: '',
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
      programId: MANGO_AUCTION_PROGRAM_ID,
      baseMint: new PublicKey(data.baseMint),
      quoteMint: new PublicKey(data.quoteMint),
      baseDecimals: asset.raw.extensions.mint!.account.decimals,
    })
    auctionObj.transactionInstructions.unshift(...transactionInstructions)
    setAuctionObj(auctionObj)
    setOpenSaveBackupKeyModal(true)
  }
  const handlePropose = async (auctionObj: AuctionObj) => {
    const perquisiteInstructions: TransactionInstruction[] = [
      ...auctionObj.transactionInstructions,
    ]
    const perquisiteSingers: Keypair[] = [...auctionObj.signers]

    const transactionInstructions: TransactionInstruction[] = []

    const assetExtenstions = asset.raw.extensions
    const auctionPk = auctionObj.auctionPk
    const auctionArgs = auctionObj.auctionParams.args
    const auctionAccounts = auctionObj.auctionParams.accounts
    const governance = asset.raw.governance
    const authority = assetExtenstions.token?.account.owner

    const openOrdersPk = await getOpenOrdersPk(
      authority!,
      auctionArgs.auctionId,
      auctionAccounts.authority,
      MANGO_AUCTION_PROGRAM_ID
    )

    const {
      quoteFeeAta,
      baseFeeAta,
      instructions,
    } = await getCreateDefaultFeeAtas({
      wallet: wallet!,
      connection: connection.current,
      baseMint: new PublicKey(form.baseMint),
      quoteMint: new PublicKey(form.quoteMint),
      cluster: connection.cluster,
    })
    perquisiteInstructions.push(...instructions)
    const orderHistoryPk = await getOrderHistoryPk(
      assetExtenstions.token!.account.owner,
      auctionArgs.auctionId,
      auctionAccounts.authority,
      MANGO_AUCTION_PROGRAM_ID
    )
    transactionInstructions.push(
      ...createInitOpenOrdersInstructions({
        authority: authority!,
        auctionPk: auctionPk,
        openOrdersPk: openOrdersPk,
        orderHistoryPk: orderHistoryPk,
        baseFeePk: baseFeeAta,
        quoteFeePk: quoteFeeAta,
        side: 'Ask',
      })
    )
    const quoteAta = await getAssociatedTokenAddress(
      auctionAccounts.quoteMint, // mint
      assetExtenstions.token!.account.owner, // owner
      true
    )
    const quoteAtaAcc = await connection.current.getParsedAccountInfo(quoteAta)
    if (!quoteAtaAcc?.value) {
      const ataCreateionIx = SPL_TOKEN.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        auctionAccounts.quoteMint, // mint
        quoteAta, // ata
        assetExtenstions.token!.account.owner, // owner of token account
        wallet!.publicKey! // fee payer
      )
      perquisiteInstructions.push(ataCreateionIx)
    }
    transactionInstructions.push(
      ...createNewOrderInstructions({
        price: form.minPrice,
        amount: form.tokensForSale,
        baseDecimals: assetExtenstions.mint!.account.decimals,
        authority: authority!,
        auctionPk: auctionPk,
        openOrdersPk: openOrdersPk,
        quoteToken: quoteAta,
        baseToken: assetExtenstions.token!.publicKey,
        tickSize: auctionArgs.tickSize,
        quoteMint: auctionAccounts.quoteMint,
        quoteVault: auctionAccounts.quoteVault,
        eventQueue: auctionAccounts.eventQueue,
        bids: auctionAccounts.bids,
        asks: auctionAccounts.asks,
        baseMint: auctionAccounts.baseMint,
        baseVault: auctionAccounts.baseVault,
      })
    )
    const instructionsData = transactionInstructions.map((x, idx) => {
      const obj: UiInstruction = {
        serializedInstruction: serializeInstructionToBase64(x),
        isValid: true,
        governance,
        prerequisiteInstructions: idx === 0 ? perquisiteInstructions : [],
        prerequisiteInstructionsSigners: idx === 0 ? perquisiteSingers : [],
        chunkBy: 1,
        chunkSplitByDefault: true,
      }
      return new InstructionDataWithHoldUpTime({
        instruction: obj,
        governance,
      })
    })

    try {
      const proposalAddress = await handleCreateProposal({
        title: proposalInfo.title ? proposalInfo.title : DEFAULT_TITLE,
        description: proposalInfo.description
          ? proposalInfo.description
          : DEFAULT_DESCRIPTION,
        voteByCouncil: proposalInfo.voteByCouncil,
        instructionsData: instructionsData,
        governance: governance,
      })
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      router.push(url)
    } catch (ex) {
      notify({ type: 'error', message: `${ex}` })
    }
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
        <h4>Witch create auction</h4>
        <div className="flex flex-row text-xs items-center">
          <Switch
            checked={withCreateAuction}
            onChange={(checked) => setWithCreateAuction(checked)}
          />
        </div>
        {withCreateAuction && (
          <>
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
          </>
        )}
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
        {withCreateAuction && (
          <>
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
                if (mintAddress) {
                  handleSetForm({
                    value: mintAddress,
                    propertyName: 'quoteMint',
                  })
                }
                if (tokenInfo) {
                  handleSetForm({
                    value: tokenInfo.address,
                    propertyName: 'quoteMint',
                  })
                }
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
            </div>
          </>
        )}
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
