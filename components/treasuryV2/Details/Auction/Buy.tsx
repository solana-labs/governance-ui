// import Button from '@components/Button'
// import Input from '@components/inputs/Input'
// import { useEffect, useState } from 'react'
// import { Token } from '@models/treasury/Asset'
// import { BuyForm } from './models'
// import { MANGO_AUCTION_PROGRAM_ID } from './tools'
// import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
// import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
// import useWalletStore from 'stores/useWalletStore'
// import {
//   createInitOpenOrdersInstructions,
//   createNewOrderInstructions,
//   getOpenOrdersPk,
//   getOrderHistoryPk,
//   getCreateDefaultFeeAtas,
//   AuctionObj,
//   fetchAuction,
//   toNumberFromFp32,
//   createNewEncryptedOrderInstructions,
// } from 'auction-house-sdk/sdk'
// import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
// import {
//   ASSOCIATED_TOKEN_PROGRAM_ID,
//   Token as SPL_TOKEN,
//   TOKEN_PROGRAM_ID,
// } from '@solana/spl-token'
// import useCreateProposal from '@hooks/useCreateProposal'
// import useQueryContext from '@hooks/useQueryContext'
// import useRealm from '@hooks/useRealm'
// import { useRouter } from 'next/router'
// import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
// import { serializeInstructionToBase64 } from '@solana/spl-governance'
// import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
// import { notify } from '@utils/notifications'
// import { Auction, OpenOrders } from 'auction-house-sdk/generated/accounts'
// import { tryParseKey } from '@tools/validators/pubkey'
// import Slider from '@components/Slider'
// import { tryGetMint } from '@utils/tokens'
// // import * as nacl from 'tweetnacl'
// interface Props {
//   className?: string
//   asset: Token
// }

export default function Buy() {
  //   const DEFAULT_TITLE = `Buy tokens on auction`
  //   const DEFAULT_DESCRIPTION = `Buy tokens on auction`
  //   const wallet = useWalletStore((s) => s.current)
  //   const connection = useWalletStore((s) => s.connection)
  //   const { symbol } = useRealm()
  //   const router = useRouter()
  //   const { handleCreateProposal } = useCreateProposal()
  //   const { fmtUrlWithCluster } = useQueryContext()
  //   const [currentAuction, setCurrentAuction] = useState<Auction | null>()
  //   const [form, setForm] = useState<BuyForm>({
  //     amount: 0,
  //     deposit: 0,
  //     price: 0,
  //     auctionPk: '',
  //   })
  //   const [formErrors, setFormErrors] = useState({})
  //   const [proposalInfo, setProposalInfo] = useState({
  //     title: '',
  //     description: '',
  //     voteByCouncil: false,
  //   })
  //   useEffect(() => {
  //     const pubkey = tryParseKey(form.auctionPk)
  //     const getAuction = async () => {
  //       const auction = await fetchAuction(connection.current, pubkey!)
  //       if (auction.quoteMint.toBase58() !== asset.mintAddress) {
  //         notify({
  //           type: 'error',
  //           message: 'Selected token does not match auction quote token',
  //         })
  //       }
  //       setCurrentAuction(auction)
  //     }
  //     if (pubkey) {
  //       getAuction()
  //     } else {
  //       setCurrentAuction(null)
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  //   }, [form.auctionPk])

  //   const handleSetForm = ({ propertyName, value }) => {
  //     setFormErrors({})
  //     setForm({ ...form, [propertyName]: value })
  //   }

  //   const handlePropose = async (newAuctionObj: AuctionObj | null) => {
  //     const auctionPk = new PublicKey(form.auctionPk)
  //     const auction = await fetchAuction(connection.current, auctionPk)

  //     const assetExtenstions = asset.raw.extensions
  //     const governance = asset.raw.governance
  //     const authority = assetExtenstions.token?.account.owner

  //     const auctionId = auction!.auctionId
  //     const auctionAuthroity = auction!.authority
  //     const quoteMint = auction!.quoteMint
  //     const tickSize = auction!.tickSize
  //     const quoteVault = auction!.quoteVault
  //     const eventQueue = auction!.eventQueue
  //     const bids = auction!.bids
  //     const asks = auction!.asks
  //     const baseMint = auction!.baseMint
  //     const baseVault = auction!.baseVault

  //     const perquisiteInstructions: TransactionInstruction[] = newAuctionObj
  //       ? [...newAuctionObj.transactionInstructions]
  //       : []
  //     const perquisiteSingers: Keypair[] = newAuctionObj
  //       ? [...newAuctionObj.signers]
  //       : []

  //     const transactionInstructions: TransactionInstruction[] = []

  //     const openOrdersPk = await getOpenOrdersPk(
  //       authority!,
  //       auctionId,
  //       auctionAuthroity,
  //       MANGO_AUCTION_PROGRAM_ID
  //     )

  //     const openOrders = await OpenOrders.fetch(connection.current, openOrdersPk)
  //     if (!openOrders) {
  //       const {
  //         quoteFeeAta,
  //         baseFeeAta,
  //         instructions,
  //       } = await getCreateDefaultFeeAtas({
  //         wallet: wallet!,
  //         connection: connection.current,
  //         baseMint: auction.baseMint,
  //         quoteMint: auction.quoteMint,
  //         cluster: connection.cluster,
  //       })
  //       perquisiteInstructions.push(...instructions)
  //       const orderHistoryPk = await getOrderHistoryPk(
  //         assetExtenstions.token!.account.owner,
  //         auctionId,
  //         auctionAuthroity,
  //         MANGO_AUCTION_PROGRAM_ID
  //       )
  //       transactionInstructions.push(
  //         ...createInitOpenOrdersInstructions({
  //           authority: authority!,
  //           auctionPk: auctionPk,
  //           openOrdersPk: openOrdersPk,
  //           orderHistoryPk: orderHistoryPk,
  //           baseFeePk: baseFeeAta,
  //           quoteFeePk: quoteFeeAta,
  //           side: 'Bid',
  //         })
  //       )
  //     }

  //     const baseAta = await getAssociatedTokenAddress(
  //       baseMint, // mint
  //       assetExtenstions.token!.account.owner, // owner
  //       true
  //     )
  //     const baseAtaAcc = await connection.current.getParsedAccountInfo(baseAta)
  //     if (!baseAtaAcc?.value) {
  //       const ataCreateionIx = SPL_TOKEN.createAssociatedTokenAccountInstruction(
  //         ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
  //         TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
  //         baseMint, // mint
  //         baseAta, // ata
  //         assetExtenstions.token!.account.owner, // owner of token account
  //         wallet!.publicKey! // fee payer
  //       )
  //       perquisiteInstructions.push(ataCreateionIx)
  //     }
  //     const localOrderKey = nacl.box.keyPair()
  //     const baseMintAcc = await tryGetMint(
  //       connection.current,
  //       currentAuction!.baseMint
  //     )
  //     transactionInstructions.push(
  //       ...(!currentAuction?.areBidsEncrypted
  //         ? createNewOrderInstructions({
  //             price: Number(form.price),
  //             amount: Number(form.amount),
  //             baseDecimals: assetExtenstions.mint!.account.decimals,
  //             authority: authority!,
  //             auctionPk: auctionPk,
  //             openOrdersPk: openOrdersPk,
  //             quoteToken: assetExtenstions.token!.publicKey,
  //             baseToken: baseAta,
  //             tickSize: tickSize,
  //             quoteMint: quoteMint,
  //             quoteVault: quoteVault,
  //             eventQueue: eventQueue,
  //             bids: bids,
  //             asks: asks,
  //             baseMint: baseMint,
  //             baseVault: baseVault,
  //           })
  //         : createNewEncryptedOrderInstructions({
  //             price: Number(form.price),
  //             amount: Number(form.amount),
  //             baseDecimals: baseMintAcc!.account.decimals,
  //             quoteDecimals: assetExtenstions.mint!.account.decimals,
  //             deposit: form.deposit,
  //             openOrdersPk: openOrdersPk,
  //             authority: authority!,
  //             localOrderKey: localOrderKey,
  //             quoteToken: assetExtenstions.token!.publicKey,
  //             baseToken: baseAta,
  //             auctionPk,
  //             tickSize,
  //             naclPubkey: currentAuction.naclPubkey,
  //             quoteMint,
  //             quoteVault,
  //             baseMint,
  //             baseVault,
  //           }))
  //     )
  //     const instructionsData = transactionInstructions.map((x, idx) => {
  //       const obj: UiInstruction = {
  //         serializedInstruction: serializeInstructionToBase64(x),
  //         isValid: true,
  //         governance,
  //         prerequisiteInstructions: idx === 0 ? perquisiteInstructions : [],
  //         prerequisiteInstructionsSigners: idx === 0 ? perquisiteSingers : [],
  //         chunkBy: 1,
  //         chunkSplitByDefault: true,
  //       }
  //       return new InstructionDataWithHoldUpTime({
  //         instruction: obj,
  //         governance,
  //       })
  //     })

  //     try {
  //       const proposalAddress = await handleCreateProposal({
  //         title: proposalInfo.title ? proposalInfo.title : DEFAULT_TITLE,
  //         description: proposalInfo.description
  //           ? proposalInfo.description
  //           : DEFAULT_DESCRIPTION,
  //         voteByCouncil: proposalInfo.voteByCouncil,
  //         instructionsData: instructionsData,
  //         governance: governance,
  //       })
  //       const url = fmtUrlWithCluster(
  //         `/dao/${symbol}/proposal/${proposalAddress}`
  //       )
  //       router.push(url)
  //     } catch (ex) {
  //       notify({ type: 'error', message: `${ex}` })
  //     }
  //   }

  return (
    <>
      {/* <section className={`${className} space-y-3`}>
        <h4>Details</h4>
        <Input
          label="Auction Pk"
          value={form.auctionPk}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'auctionPk',
            })
          }
          error={formErrors['auctionPk']}
        />
        <Input
          label="Amount"
          value={form.amount}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'amount',
            })
          }
          error={formErrors['amount']}
        />
        <Input
          label="Price"
          value={form.price}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'price',
            })
          }
          error={formErrors['price']}
        />
        {currentAuction?.areBidsEncrypted && (
          <div className="pb-6 pt-3">
            <div className="text-xs">
              Deposit more to hide your actual bid: {form.deposit}
            </div>
            <Slider
              disabled={false}
              step={toNumberFromFp32(currentAuction.tickSize)}
              min={Number(form.amount) * Number(form.price)}
              max={
                Number(asset.raw.extensions.amount?.toNumber()) /
                10 ** asset.raw.extensions.mint!.account.decimals
              }
              value={form.deposit}
              onChange={(d) =>
                handleSetForm({
                  value: Number(d),
                  propertyName: 'deposit',
                })
              }
            />
          </div>
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
          <Button onClick={() => handlePropose(null)}>Propose</Button>
        </div>
      </section> */}
    </>
  )
}
