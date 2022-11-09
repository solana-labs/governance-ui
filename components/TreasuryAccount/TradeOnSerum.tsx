import * as yup from 'yup'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useTotalTokenValue from '@hooks/useTotalTokenValue'
import {
  fmtTokenInfoWithMint,
  getMintDecimalAmountFromNatural,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { Market as SerumMarket } from '@project-serum/serum'
import tokenService from '@utils/services/token'
import React, { useCallback, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import AccountLabel from './BaseAccountHeader'
import {
  Bound,
  boundOptions,
  OrderSide,
  orderSideOptions,
  getProgramId,
  instructions as serumRemoteInstructions,
  getDexId,
  IDL as SerumRemoteIDL,
  SerumRemote,
} from '@mithraic-labs/serum-remote'
import useWalletStore from 'stores/useWalletStore'
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  ExternalLinkIcon,
} from '@heroicons/react/solid'
import ProposalOptions from './ProposalOptions'
import useRealm from '@hooks/useRealm'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  BN,
  Program,
  AnchorProvider,
  Wallet,
  web3,
} from '@project-serum/anchor'
import { getValidatedPublickKey } from '@utils/validations'
import { validateInstruction } from '@utils/instructionTools'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { notify } from '@utils/notifications'
import { useRouter } from 'next/router'
import useCreateProposal from '@hooks/useCreateProposal'
import useQueryContext from '@hooks/useQueryContext'
import {
  AccountInfo,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintInfo,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { AssetAccount } from '@utils/uiTypes/assets'
import { TokenProgramAccount } from '@utils/tokens'
import { Keypair } from '@solana/web3.js'
import useWallet from '@hooks/useWallet'

export type TradeOnSerumProps = { tokenAccount: AssetAccount }

type TradeOnSerumForm = {
  amount: number
  boundedPrice: number
  serumRemoteProgramId: string
  serumProgramId: string
  serumMarketId: string
  assetMint: string
  reclaimDate: Date
  reclaimAddress: string
  orderSide: number
  bound: Bound
  description: string
  title: string
}

const formSchema = (
  mintInfo: TokenProgramAccount<MintInfo>,
  token: TokenProgramAccount<AccountInfo>
) => {
  return (
    yup
      .object()
      .shape({
        title: yup.string(),
        description: yup.string(),
        amount: yup
          .number()
          .typeError('Amount is required')
          .test(
            'amount',
            "Transfer amount must be less than the source account's available amount",
            function (val: number) {
              const mintValue = getMintNaturalAmountFromDecimalAsBN(
                val,
                mintInfo.account.decimals
              )
              return token.account.amount.gte(mintValue)
            }
          )
          .test(
            'amount',
            'Transfer amount must be greater than 0',
            function (val: number) {
              return val > 0
            }
          ),
        boundedPrice: yup
          .number()
          .typeError('boundedPrice is required')
          .test(
            'boundedPrice',
            'Bounded price must be greater than 0',
            function (val: number) {
              return val > 0
            }
          ),
        serumRemoteProgramId: yup
          .string()
          .test(
            'serumRemoteProgramId',
            'serumRemoteProgramId must be valid PublicKey',
            function (serumRemoteProgramId: string) {
              try {
                getValidatedPublickKey(serumRemoteProgramId)
              } catch (err) {
                return false
              }
              return true
            }
          ),
        serumProgramId: yup
          .string()
          .test(
            'serumProgramId',
            'serumProgramId must be valid PublicKey',
            function (serumProgramId: string) {
              try {
                getValidatedPublickKey(serumProgramId)
              } catch (err) {
                return false
              }
              return true
            }
          ),
        serumMarketId: yup
          .string()
          .test(
            'serumMarketId',
            'serumMarketId must be valid PublicKey',
            function (serumMarketId: string) {
              try {
                getValidatedPublickKey(serumMarketId)
              } catch (err) {
                return false
              }
              return true
            }
          ),
        assetMint: yup
          .string()
          .test(
            'assetMint',
            'assetMint must be valid PublicKey',
            function (assetMint: string) {
              try {
                getValidatedPublickKey(assetMint)
              } catch (err) {
                return false
              }
              return true
            }
          ),
        // TODO: [nice to have] Validate the date is at least min voting period ahead
        reclaimDate: yup.date().typeError('reclaimDate must be a valid date'),
        reclaimAddress: yup
          .string()
          .test(
            'reclaimAddress',
            'reclaimAddress must be valid PublicKey',
            function (reclaimAddress: string) {
              try {
                getValidatedPublickKey(reclaimAddress)
              } catch (err) {
                return false
              }
              return true
            }
          ),
        orderSide: yup
          .number()
          .typeError('orderSide is required')
          .test(
            'orderSide',
            'orderSide must be 0 (Bid) or 1 (Ask)',
            function (orderSide: number) {
              return orderSide === 0 || orderSide === 1
            }
          ),
        bound: yup
          .number()
          .typeError('bound is required')
          .test(
            'bound',
            'bound must be 0 (Lower) or 1 (Upper)',
            function (bound: number) {
              return bound === 0 || bound === 1
            }
          ),
      })
      // Check the Bound and Order Side are viable
      .test('bound', 'Some check against other values', function (val) {
        if (!val.bound) {
          return true
        }
        if (val.bound === val.orderSide) {
          return new yup.ValidationError(
            `Bound cannot be ${Bound[val.bound]} when Order Side is ${
              OrderSide[val.orderSide]
            }`,
            undefined,
            'bound'
          )
        }
        return true
      })
  )
}

const TradeOnSerum: React.FC<TradeOnSerumProps> = ({ tokenAccount }) => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const { wallet, anchorProvider } = useWallet()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { handleCreateProposal } = useCreateProposal()
  const serumRemoteProgramId = getProgramId(connection.cluster)
  const serumProgramKey = getDexId(connection.cluster)
  const { canUseTransferInstruction } = useGovernanceAssets()
  const { canChooseWhoVote, symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const [form, setForm] = useState<TradeOnSerumForm>({
    amount: 0,
    boundedPrice: 0,
    title: 'Diversify treasury with Serum',
    description:
      'A proposal to trade some asset for another using Serum. PLEASE EXPLAIN IN MORE DETAIL',
    serumRemoteProgramId: serumRemoteProgramId.toString(),
    serumProgramId: serumProgramKey.toString(),
    serumMarketId: '',
    assetMint: tokenAccount.extensions.mint!.publicKey.toString(),
    orderSide: 0,
    bound: 1,
    // Default reclaim date of 10 days
    reclaimDate: new Date(new Date().getTime() + 1_000 * 3600 * 24 * 10),
    // The reclaim address must be the same account where the initial assets come from
    reclaimAddress: tokenAccount.pubkey.toString(),
  })
  const [formErrors, setFormErrors] = useState({})
  const [showOptions, setShowOptions] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!tokenAccount.extensions.mint || !tokenAccount.extensions.token) {
    throw new Error('No mint information on the tokenAccount')
  }
  const mintAccount = tokenAccount.extensions.mint
  const token = tokenAccount.extensions.token
  const schema = formSchema(mintAccount, token)

  const tokenInfo = tokenService.getTokenInfo(mintAccount.publicKey.toString())

  const totalValue = useTotalTokenValue({
    amount: getMintDecimalAmountFromNatural(
      mintAccount.account,
      token.account.amount
    ).toNumber(),
    mintAddress: mintAccount.publicKey.toString(),
  })

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const handlePropose = useCallback(async () => {
    setIsLoading(true)
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    if (!currentAccount || !currentAccount!.extensions!.token!.account.owner) {
      throw new Error('currentAccount is null or undefined')
    }
    if (wallet && wallet.publicKey && anchorProvider && isValid) {
      const program = new Program<SerumRemote>(
        SerumRemoteIDL,
        serumRemoteProgramId,
        anchorProvider
      )
      // convert amount to mintAmount
      const mintValue = getMintNaturalAmountFromDecimalAsBN(
        form.amount,
        mintAccount.account.decimals
      )
      const dexProgramId = new web3.PublicKey(form.serumProgramId)
      const serumMarketId = new web3.PublicKey(form.serumMarketId)
      // Load the serumMarket
      let market: SerumMarket
      try {
        market = await SerumMarket.load(
          connection.current,
          serumMarketId,
          {},
          dexProgramId
        )
      } catch (err) {
        setFormErrors((e) => ({
          ...e,
          serumMarketId: 'Error loading the SerumMarket',
        }))
        setIsLoading(false)
        return
      }
      // Convert the form's numerical bounded price to market lots
      const boundPrice = market.priceNumberToLots(form.boundedPrice)
      // Validate the market and information
      if (
        form.assetMint !== market.quoteMintAddress.toString() &&
        form.assetMint !== market.baseMintAddress.toString()
      ) {
        setFormErrors((e) => ({
          ...e,
          serumMarketId:
            "The asset you're looking to trade with does not exist on this Serum Market",
        }))
        setIsLoading(false)
        return
      }
      if (
        (form.orderSide === 0 &&
          form.assetMint !== market.quoteMintAddress.toString()) ||
        (form.orderSide === 1 &&
          form.assetMint !== market.baseMintAddress.toString())
      ) {
        setFormErrors((e) => ({
          ...e,
          orderSide: `order side of ${
            OrderSide[form.orderSide]
          } does not match the expected serum market mint`,
        }))
        setIsLoading(false)
        return
      }

      const proposalInstructions: InstructionDataWithHoldUpTime[] = []
      const prerequisiteInstructions: web3.TransactionInstruction[] = []
      // Check if an associated token account for the other side of the
      //  market is required. If so, add the create associated token account ix
      const aTADepositAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        form.orderSide === 0 ? market.baseMintAddress : market.quoteMintAddress,
        currentAccount!.extensions!.token!.account.owner,
        true
      )
      const depositAccountInfo = await connection.current.getAccountInfo(
        aTADepositAddress
      )
      if (!depositAccountInfo) {
        // generate the instruction for creating the ATA
        const createAtaIx = Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          form.orderSide === 0
            ? market.baseMintAddress
            : market.quoteMintAddress,
          aTADepositAddress,
          currentAccount!.extensions!.token!.account.owner,
          wallet.publicKey
        )
        prerequisiteInstructions.push(createAtaIx)
      }

      const instruction = await serumRemoteInstructions.initBoundedStrategyIx(
        //@ts-ignore: differing anchor versions
        program,
        dexProgramId,
        serumMarketId,
        new web3.PublicKey(form.assetMint),
        {
          transferAmount: mintValue,
          boundPrice,
          reclaimDate: new BN(form.reclaimDate.getTime() / 1_000),
          reclaimAddress: new web3.PublicKey(form.reclaimAddress),
          depositAddress: aTADepositAddress,
          orderSide: form.orderSide,
          bound: form.bound,
        },
        { owner: currentAccount!.extensions!.token!.account.owner }
      )

      const serializedIx = serializeInstructionToBase64(instruction)

      const instructionData = {
        data: getInstructionDataFromBase64(serializedIx),
        holdUpTime:
          currentAccount?.governance?.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions,
        shouldSplitIntoSeparateTxs: true,
      }
      proposalInstructions.push(instructionData)

      try {
        // Fetch governance to get up to date proposalCount
        const selectedGovernance = (await fetchRealmGovernance(
          currentAccount?.governance?.pubkey
        )) as ProgramAccount<Governance>

        const proposalAddress = await handleCreateProposal({
          title: form.title,
          description: form.description,
          governance: selectedGovernance,
          instructionsData: proposalInstructions,
          voteByCouncil,
          isDraft: false,
        })
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )

        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    }

    setIsLoading(false)
  }, [schema, form, setFormErrors, connection, currentAccount, symbol, wallet])
  return (
    <>
      <div>
        <h3 className="mb-4 flex items-center">Trade on Serum!</h3>
        <h6 className="mb-4 flex items-center">
          <a
            href="https://github.com/mithraiclabs/serum-remote"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center">
              Serum Remote{' '}
              <ExternalLinkIcon className="flex-shrink-0 h-3.5 ml-1 text-primary-light w-3.5" />
            </div>
          </a>
          &nbsp;is open sourced, yet unaudited. Do your own research.
        </h6>
        <AccountLabel
          mintAddress={mintAccount.publicKey.toBase58()}
          isNFT={false}
          tokenInfo={tokenInfo}
          amountFormatted={fmtTokenInfoWithMint(
            token.account.amount,
            mintAccount,
            tokenInfo
          )}
          totalPrice={totalValue}
        />
        {/* Add Serum Remote form */}
        <div className="space-y-4 w-full pb-4">
          <Input
            label="Serum Market"
            value={form.serumMarketId}
            type="text"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'serumMarketId',
              })
            }
            noMaxWidth={true}
            error={formErrors['serumMarketId']}
          />
          <Input
            label={`Amount of ${
              tokenInfo?.symbol
                ? tokenInfo?.symbol
                : `${mintAccount.publicKey.toString().substring(0, 6)}...`
            } to trade with`}
            value={form.amount}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'amount',
              })
            }
            error={formErrors['amount']}
            noMaxWidth={true}
          />
          <Select
            label={'Order Side'}
            value={OrderSide[form.orderSide]}
            onChange={(value) =>
              handleSetForm({
                value: value,
                propertyName: 'orderSide',
              })
            }
            error={formErrors['orderSide']}
            noMaxWidth={true}
          >
            {orderSideOptions.map((option) => (
              <Select.Option key={option} value={OrderSide[option]}>
                {option}
              </Select.Option>
            ))}
          </Select>
          <Select
            label={'Bound'}
            value={Bound[form.bound]}
            onChange={(value) =>
              handleSetForm({
                value: value,
                propertyName: 'bound',
              })
            }
            error={formErrors['bound']}
            noMaxWidth={true}
          >
            {boundOptions.map((option) => (
              <Select.Option key={option} value={Bound[option]}>
                {option}
              </Select.Option>
            ))}
          </Select>
          {/* TODO: Add reclaim date picker */}
          <Input
            label={'Bounded Price'}
            value={form.boundedPrice}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'boundedPrice',
              })
            }
            error={formErrors['boundedPrice']}
            noMaxWidth={true}
          />
        </div>

        <div
          className={'flex items-center hover:cursor-pointer w-24'}
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? (
            <ArrowCircleUpIcon className="h-4 w-4 mr-1 text-primary-light" />
          ) : (
            <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
          )}
          <small className="text-fgd-3">Options</small>
        </div>
        {showOptions && (
          <ProposalOptions
            handleSetForm={handleSetForm}
            form={form}
            canChooseWhoVote={canChooseWhoVote}
            voteByCouncil={voteByCouncil}
            setVoteByCouncil={setVoteByCouncil}
          />
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <Button
          disabled={!canUseTransferInstruction || isLoading}
          className="ml-auto"
          onClick={handlePropose}
          isLoading={isLoading}
        >
          <Tooltip
            content={
              !canUseTransferInstruction
                ? 'You need to have connected wallet with ability to create token transfer proposals'
                : ''
            }
          >
            <div>Propose</div>
          </Tooltip>
        </Button>
      </div>
    </>
  )
}

export default TradeOnSerum
