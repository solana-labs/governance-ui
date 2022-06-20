import { PublicKey } from '@blockworks-foundation/mango-client'
import Button, { LinkButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Loading from '@components/Loading'
import Tooltip from '@components/Tooltip'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { BN } from '@project-serum/anchor'
import { RpcContext } from '@solana/spl-governance'
import {
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { SolendStrategy } from 'Strategies/types/types'
import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import { validateInstruction } from '@utils/instructionTools'
import * as yup from 'yup'
import { AssetAccount } from '@utils/uiTypes/assets'
import Select from '@components/inputs/Select'
import {
  CreateSolendStrategyParams,
  cTokenExchangeRate,
  getReserveData,
  SolendSubStrategy,
} from 'Strategies/protocols/solend'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

const SOL_BUFFER = 0.02

const SolendDeposit = ({
  proposedInvestment,
  handledMint,
  createProposalFcn,
  governedTokenAccount,
}: {
  proposedInvestment: SolendStrategy
  handledMint: string
  createProposalFcn: CreateSolendStrategyParams
  governedTokenAccount: AssetAccount
}) => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const {
    proposals,
    realmInfo,
    realm,
    ownVoterWeight,
    mint,
    councilMint,
    symbol,
  } = useRealm()
  const [isDepositing, setIsDepositing] = useState(false)
  const [deposits, setDeposits] = useState<{
    [reserveAddress: string]: number
  }>({})
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const tokenInfo = tokenService.getTokenInfo(handledMint)
  const {
    governedTokenAccountsWithoutNfts,
    auxiliaryTokenAccounts,
    canUseTransferInstruction,
  } = useGovernanceAssets()

  const treasuryAmount = new BN(
    governedTokenAccount.isSol
      ? governedTokenAccount.extensions.amount!.toNumber()
      : governedTokenAccount.extensions.token!.account.amount
  )
  const mintInfo = governedTokenAccount.extensions?.mint?.account
  const tokenSymbol = tokenService.getTokenInfo(
    governedTokenAccount.extensions.mint!.publicKey.toBase58()
  )?.symbol
  const [form, setForm] = useState<{
    title: string
    description: string
    amount?: number
    reserve: SolendSubStrategy
  }>({
    title: '',
    description: '',
    amount: undefined,
    reserve:
      proposedInvestment.reserves.find((reserve) => reserve.isPrimary) ??
      proposedInvestment.reserves[0]!,
  })
  const [formErrors, setFormErrors] = useState({})
  const proposalTitle = `Deposit ${form.amount} ${
    tokenSymbol || 'tokens'
  } to the Solend ${form.reserve.marketName} pool`
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const mintMinAmount = mintInfo ? getMintMinAmountAsDecimal(mintInfo) : 1
  let maxAmount = mintInfo
    ? getMintDecimalAmount(mintInfo, treasuryAmount)
    : new BigNumber(0)
  if (governedTokenAccount.isSol) {
    maxAmount = maxAmount.minus(SOL_BUFFER)
  }
  const maxAmountFtm = maxAmount.toNumber().toFixed(4)
  const currentPrecision = precision(mintMinAmount)

  const validateAmountOnBlur = () => {
    handleSetForm({
      propertyName: 'amount',
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(form.amount))
        ).toFixed(currentPrecision)
      ),
    })
  }

  // Solend
  useEffect(() => {
    const getSlndCTokens = async () => {
      const accounts = [
        ...governedTokenAccountsWithoutNfts,
        ...auxiliaryTokenAccounts,
      ]

      const relevantAccs = accounts
        .map((acc) => {
          const reserve = (proposedInvestment as SolendStrategy)?.reserves.find(
            (reserve) =>
              reserve.mintAddress === handledMint &&
              reserve.collateralMintAddress ===
                acc.extensions.mint?.publicKey.toBase58()
          )
          if (!reserve || !proposedInvestment) return null

          return {
            acc,
            reserve,
          }
        })
        .filter(Boolean)

      const reserveStats = await getReserveData(
        relevantAccs.map((data) => data!.reserve.reserveAddress)
      )

      const results = Object.fromEntries(
        relevantAccs.map((data) => {
          const reserve = data!.reserve
          const account = data!.acc

          const stat = reserveStats.find(
            (stat) => stat.reserve.lendingMarket === reserve.marketAddress
          )!

          return [
            reserve.reserveAddress,
            ((account.extensions.amount?.toNumber() ?? 0) *
              cTokenExchangeRate(stat)) /
              10 ** reserve.decimals,
          ]
        })
      )
      setDeposits(results)
    }
    getSlndCTokens()
  }, [])

  const handleDeposit = async () => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    if (!isValid) {
      return
    }
    try {
      setIsDepositing(true)
      const rpcContext = new RpcContext(
        new PublicKey(realm!.owner.toString()),
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint
      )
      const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
        governedTokenAccount!.governance!.account.config,
        voteByCouncil
      )
      const defaultProposalMint = voteByCouncil
        ? realm?.account.config.councilMint
        : !mint?.supply.isZero() ||
          realm?.account.config.useMaxCommunityVoterWeightAddin
        ? realm!.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm!.account.config.councilMint
        : undefined

      const proposalAddress = await createProposalFcn(
        rpcContext,
        {
          ...form,
          amountFmt: form.amount!.toFixed(4),
          bnAmount: getMintNaturalAmountFromDecimalAsBN(
            form.amount as number,
            governedTokenAccount.extensions.mint!.account.decimals
          ),
          proposalCount: Object.keys(proposals).length,
          action: 'Deposit',
        },
        realm!,
        governedTokenAccount!,
        ownTokenRecord,
        defaultProposalMint!,
        governedTokenAccount!.governance!.account!.proposalCount,
        false,
        connection,
        client
      )
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      router.push(url)
    } catch (e) {
      console.log(e)
      throw e
    }
    setIsDepositing(false)
  }
  const schema = yup.object().shape({
    amount: yup
      .number()
      .required('Amount is required')
      .min(mintMinAmount)
      .max(maxAmount.toNumber()),
    reserve: yup.object().required('Lending market address is required'),
  })

  return (
    <div>
      <Select
        className="mb-3"
        label="Pool"
        value={`${
          form.reserve?.marketName
        } - APY: ${form.reserve?.supplyApy.toFixed(2)}%`}
        placeholder="Please select..."
        onChange={(val) =>
          handleSetForm({
            propertyName: 'reserve',
            value: proposedInvestment.reserves.find(
              (reserve) => reserve.marketName === val
            ),
          })
        }
      >
        {proposedInvestment.reserves.map((reserve) => (
          <Select.Option
            key={reserve.reserveAddress}
            value={reserve.marketName}
          >
            <div className="d-flex">
              <div>
                {reserve.marketName} - APY: {reserve.supplyApy.toFixed(2)}%
              </div>
              <div>
                Current deposits:{' '}
                {deposits[reserve.reserveAddress]?.toFixed(4) ?? '0'}{' '}
                {tokenInfo?.symbol}
              </div>
            </div>
          </Select.Option>
        ))}
        <Select.Option key={null} value={null}>
          <div>Create new account</div>
        </Select.Option>
      </Select>
      <div className="flex mb-1.5 text-sm">
        Amount
        <div className="ml-auto flex items-center text-xs">
          <span className="text-fgd-3 mr-1">Bal:</span> {maxAmountFtm}
          <LinkButton
            onClick={() =>
              handleSetForm({
                propertyName: 'amount',
                value: maxAmount.toNumber(),
              })
            }
            className="font-bold ml-2 text-primary-light"
          >
            Max
          </LinkButton>
        </div>
      </div>
      <Input
        error={formErrors['amount']}
        min={mintMinAmount}
        value={form.amount}
        type="number"
        onChange={(e) =>
          handleSetForm({ propertyName: 'amount', value: e.target.value })
        }
        step={mintMinAmount}
        onBlur={validateAmountOnBlur}
      />
      <AdditionalProposalOptions
        title={form.title}
        description={form.description}
        defaultTitle={proposalTitle}
        defaultDescription={`Deposit ${tokenSymbol} into Solend to mint cTokens and earn interest`}
        setTitle={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'title',
          })
        }
        setDescription={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'description',
          })
        }
        voteByCouncil={voteByCouncil}
        setVoteByCouncil={setVoteByCouncil}
      />
      <div className="border border-fgd-4 p-4 rounded-md mb-6 mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-fgd-3">Current Deposits</span>
          <span className="font-bold text-fgd-1">
            {deposits[form.reserve.reserveAddress]?.toFixed(4) || 0}{' '}
            <span className="font-normal text-fgd-3">{tokenInfo?.symbol}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-fgd-3">Proposed Deposit</span>
          <span className="font-bold text-fgd-1">
            {form.amount?.toLocaleString() || (
              <span className="font-normal text-red">Enter an amount</span>
            )}{' '}
            <span className="font-normal text-fgd-3">
              {form.amount && tokenInfo?.symbol}
            </span>
          </span>
        </div>
      </div>
      <Button
        className="w-full"
        onClick={handleDeposit}
        disabled={!form.amount || !canUseTransferInstruction || isDepositing}
      >
        <Tooltip
          content={
            !canUseTransferInstruction
              ? 'Please connect wallet with enough voting power to create treasury proposals'
              : !form.amount
              ? 'Please input the amount'
              : ''
          }
        >
          {!isDepositing ? 'Propose deposit' : <Loading></Loading>}
        </Tooltip>
      </Button>
    </div>
  )
}
SolendDeposit.whyDidYouRender = true

export default SolendDeposit
