import * as yup from 'yup'
import Input from '@components/inputs/Input'
import useTotalTokenValue from '@hooks/useTotalTokenValue'
import {
  fmtTokenInfoWithMint,
  getMintDecimalAmountFromNatural,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import tokenPriceService from '@utils/services/tokenPrice'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import AccountLabel from './BaseAccountHeader'
import {
  Bound,
  getProgramId,
  IDL as SerumRemoteIDL,
  pdas,
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
import { BN, Program, web3 } from '@project-serum/anchor'
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
import useWallet from '@hooks/useWallet'
import TokenSelect from '@components/inputs/TokenSelect'
import { TokenInfo } from '@solana/spl-token-registry'
import DateTimePicker from '@components/inputs/DateTimePicker'

export type TradeOnSerumProps = { tokenAccount: AssetAccount }

export const SUPPORTED_TRADE_PLATFORMS = ['Raydium', 'Openbook']

type TradeOnSerumForm = {
  amount: number
  limitPrice: number
  serumRemoteProgramId: string
  assetMint: string
  reclaimDate: Date
  reclaimAddress: string
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
        limitPrice: yup
          .number()
          .typeError('limitPrice is required')
          .test(
            'limitPrice',
            'limitPrice must be greater than 0',
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
      })
      // Check the Bound and Order Side are viable
      .test('bound', 'Some check against other values', function (val) {
        if (!val.bound) {
          return true
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
  const { canUseTransferInstruction } = useGovernanceAssets()
  const { canChooseWhoVote, symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const [form, setForm] = useState<TradeOnSerumForm>({
    amount: 0,
    limitPrice: 0,
    title: 'Diversify treasury with Serum',
    description:
      'A proposal to trade some asset for another using Serum. PLEASE EXPLAIN IN MORE DETAIL',
    serumRemoteProgramId: serumRemoteProgramId.toString(),
    assetMint: tokenAccount.extensions.mint!.publicKey.toString(),
    // Default reclaim date of 10 days
    reclaimDate: new Date(new Date().getTime() + 1_000 * 3600 * 24 * 10),
    // The reclaim address must be the same account where the initial assets come from
    reclaimAddress: tokenAccount.pubkey.toString(),
  })
  const [formErrors, setFormErrors] = useState({})
  const [showOptions, setShowOptions] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [destinationToken, setDestinationToken] = useState<TokenInfo>()

  if (!tokenAccount.extensions.mint || !tokenAccount.extensions.token) {
    throw new Error('No mint information on the tokenAccount')
  }
  const mintAccount = tokenAccount.extensions.mint
  const token = tokenAccount.extensions.token
  const schema = formSchema(mintAccount, token)

  const tokenInfo = tokenPriceService.getTokenInfo(
    mintAccount.publicKey.toString()
  )
  const inputTokenSym = tokenInfo?.symbol
    ? tokenInfo?.symbol
    : `${mintAccount.publicKey.toString().substring(0, 6)}...`

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
    if (!destinationToken || !destinationToken.decimals) {
      throw new Error('destinationToken must have decimals')
    }
    if (wallet && wallet.publicKey && anchorProvider && isValid) {
      const program = new Program<SerumRemote>(
        SerumRemoteIDL,
        serumRemoteProgramId,
        anchorProvider
      )
      // The minimum expected output amount
      const expectedOutput = form.amount * form.limitPrice
      // convert amount to mintAmount
      const inputAmount = getMintNaturalAmountFromDecimalAsBN(
        form.amount,
        mintAccount.account.decimals
      )

      const boundedPriceDenominator = getMintNaturalAmountFromDecimalAsBN(
        expectedOutput,
        destinationToken.decimals
      )
      const reclaimDate = new BN(form.reclaimDate.getTime() / 1_000)

      // Derive the BoundedStrategyV2 PDA
      const {
        collateralAccount,
        boundedStrategy: boundedStrategyKey,
      } = pdas.deriveAllBoundedStrategyKeysV2(
        program,
        new web3.PublicKey(form.assetMint),
        {
          boundPriceNumerator: inputAmount,
          boundPriceDenominator: boundedPriceDenominator,
          reclaimDate,
        }
      )

      const proposalInstructions: InstructionDataWithHoldUpTime[] = []
      const prerequisiteInstructions: web3.TransactionInstruction[] = []
      // Check if an associated token account for the destination mint
      // is required. If so, add the create associated token account ix
      const aTADepositAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new web3.PublicKey(destinationToken.address),
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
          new web3.PublicKey(destinationToken.address),
          aTADepositAddress,
          currentAccount!.extensions!.token!.account.owner,
          wallet.publicKey
        )
        prerequisiteInstructions.push(createAtaIx)
      }

      // Implement the instruction
      const instruction = await program.methods
        .initBoundedStrategyV2(
          inputAmount,
          inputAmount,
          boundedPriceDenominator,
          reclaimDate
        )
        .accounts({
          payer: currentAccount!.extensions!.token!.account.owner,
          collateralAccount,
          mint: new web3.PublicKey(form.assetMint),
          strategy: boundedStrategyKey,
          reclaimAccount: tokenAccount.pubkey,
          depositAccount: aTADepositAddress,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .instruction()

      const serializedIx = serializeInstructionToBase64(instruction)

      const instructionData: InstructionDataWithHoldUpTime = {
        data: getInstructionDataFromBase64(serializedIx),
        holdUpTime:
          currentAccount?.governance?.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions,
        shouldSplitIntoSeparateTxs: true,
        chunkSplitByDefault: true,
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
  }, [
    schema,
    form,
    setFormErrors,
    connection,
    currentAccount,
    destinationToken,
    symbol,
    wallet,
  ])

  const minReclaimDate = useMemo(() => {
    const date = new Date()
    let currentSeconds = date.getSeconds()
    currentSeconds += currentAccount?.governance?.account?.config
      .minInstructionHoldUpTime
      ? currentAccount?.governance?.account?.config.minInstructionHoldUpTime +
        5 * 60
      : 60 * 60 * 24 * 5
    date.setSeconds(currentSeconds)
    return date
  }, [currentAccount])

  return (
    <>
      <div>
        <h3 className="mb-4 flex items-center">Trade</h3>
        <h6 className="mb-4 flex items-center">
          <a
            href="https://github.com/mithraiclabs/poseidon"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center">
              Poseidon{' '}
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
        <div className="space-y-4 w-full pb-4">
          <TokenSelect
            label="Destination Token"
            onSelect={(_destinationToken) =>
              setDestinationToken(_destinationToken)
            }
          />
          <Input
            label={`Amount of ${inputTokenSym} to trade with`}
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

          <DateTimePicker
            label={'Trade expiration'}
            onChange={(value) => setForm((f) => ({ ...f, reclaimDate: value }))}
            value={form.reclaimDate}
            disableClock={true}
            minDate={minReclaimDate}
            required={true}
            clearIcon={null}
            calendarIcon={null}
          />
          <Input
            label={`Limit Price (${destinationToken?.symbol} per ${inputTokenSym})`}
            value={form.limitPrice}
            type="number"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'limitPrice',
              })
            }
            error={formErrors['limitPrice']}
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
