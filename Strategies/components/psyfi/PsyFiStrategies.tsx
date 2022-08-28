import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import Button, { LinkButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import Loading from '@components/Loading'
import Tooltip from '@components/Tooltip'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { BN } from '@project-serum/anchor'
import {
  getMintDecimalAmount,
  getMintMinAmountAsDecimal,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import tokenService from '@utils/services/token'
import { AssetAccount } from '@utils/uiTypes/assets'
import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import { PsyFiStrategy } from 'Strategies/types/types'

type PsyFiStrategyForm = {
  strategy: PsyFiStrategy
  title: string
  description: string
  amount?: number
}

const SOL_BUFFER = 0.02

export const PsyFiStrategies: React.FC<{
  proposedInvestment: PsyFiStrategy
  governedTokenAccount: AssetAccount
  handledMint: string
  createProposalFcn: any
}> = ({ proposedInvestment, governedTokenAccount }) => {
  console.log('*** proposed investment', proposedInvestment)

  const [isDepositing, setIsDepositing] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [form, setForm] = useState<PsyFiStrategyForm>({
    strategy: proposedInvestment,
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const { canUseTransferInstruction } = useGovernanceAssets()

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const tokenSymbol = tokenService.getTokenInfo(
    governedTokenAccount.extensions.mint!.publicKey.toBase58()
  )?.symbol
  const mintInfo = governedTokenAccount.extensions?.mint?.account
  const treasuryAmount = new BN(
    governedTokenAccount.isSol
      ? governedTokenAccount.extensions.amount!.toNumber()
      : governedTokenAccount.extensions.token!.account.amount
  )
  const mintMinAmount = mintInfo ? getMintMinAmountAsDecimal(mintInfo) : 1
  let maxAmount = mintInfo
    ? getMintDecimalAmount(mintInfo, treasuryAmount)
    : new BigNumber(0)
  if (governedTokenAccount.isSol) {
    maxAmount = maxAmount.minus(SOL_BUFFER)
  }
  const maxAmountFtm = maxAmount.toNumber().toFixed(4)
  const currentPrecision = precision(mintMinAmount)

  const validateAmountOnBlur = useCallback(() => {
    handleSetForm({
      propertyName: 'amount',
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(form.amount))
        ).toFixed(currentPrecision)
      ),
    })
  }, [handleSetForm, mintMinAmount, form.amount, currentPrecision])

  const handleDeposit = useCallback(() => {
    // TODO: Write the handle deposit implementation for creating a proposal
    setIsDepositing(true)
    console.log('*** HANDLE DEPOSIT!!')
    setIsDepositing(false)
  }, [])

  return (
    <div>
      <Select
        className="mb-3"
        label="Strategy"
        value={`${form.strategy.strategyName}`}
        placeholder="Please select"
        onChange={(val) => {
          console.log('User selected', val)
        }}
      >
        {proposedInvestment.otherStrategies.map((strategy) => (
          <Select.Option
            key={strategy.strategyName}
            value={strategy.strategyName}
          >
            <div className="d-flex">
              <div>
                {strategy.strategyName} - {strategy.apy}
              </div>
            </div>
          </Select.Option>
        ))}
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
        defaultTitle={`Deposit ${tokenSymbol} into ${form.strategy.strategyName}`}
        defaultDescription={`Deposit ${tokenSymbol} into strategy: ${form.strategy.strategyName}`}
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

      {/* TODO: Add useful pending deposits, current deposits, etc information */}
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
