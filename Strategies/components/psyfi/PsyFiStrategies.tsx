import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import Button, { LinkButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import Loading from '@components/Loading'
import Tooltip from '@components/Tooltip'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { BN } from '@project-serum/anchor'
import { RpcContext } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import {
  getMintDecimalAmount,
  getMintDecimalAmountFromNatural,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import tokenService from '@utils/services/token'
import { AssetAccount } from '@utils/uiTypes/assets'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import {
  Action,
  CreatePsyFiStrategy,
  PsyFiStrategyInfo,
} from 'Strategies/protocols/psyfi/types'
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
  createProposalFcn: CreatePsyFiStrategy
}> = ({
  createProposalFcn,
  handledMint,
  proposedInvestment,
  governedTokenAccount,
}) => {
  const {
    realmInfo,
    realm,
    ownVoterWeight,
    mint,
    councilMint,
    config,
  } = useRealm()
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const [ownedStrategyTokenAccount, setOwnedStrategyTokenAccount] = useState<
    AssetAccount | undefined
  >()
  const [underlyingDeposited, setUnderlyingDeposited] = useState<
    number | undefined
  >()
  const [isDepositing, setIsDepositing] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [form, setForm] = useState<PsyFiStrategyForm>({
    strategy: proposedInvestment,
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const {
    canUseTransferInstruction,
    governedTokenAccountsWithoutNfts,
  } = useGovernanceAssets()

  const tokenInfo = tokenService.getTokenInfo(handledMint)

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

  // Find the owned strategy token account, if one exists
  useEffect(() => {
    ;(async () => {
      const owner = governedTokenAccount.isSol
        ? governedTokenAccount!.pubkey
        : governedTokenAccount!.extensions!.token!.account.owner
      const tokenAddress = await getAssociatedTokenAddress(
        form.strategy.vaultAccounts.lpTokenMint,
        owner,
        true
      )

      // Cross ref with this governances' token accounts and pull holdings
      // NOTE: This knowingly restricts to ATAs.
      const existingStrategyTokenAccount = governedTokenAccountsWithoutNfts.find(
        (x) => x.pubkey.equals(tokenAddress)
      )
      setOwnedStrategyTokenAccount(existingStrategyTokenAccount)
      if (
        existingStrategyTokenAccount &&
        existingStrategyTokenAccount.extensions.amount!.gtn(0)
      ) {
        // Get the token supply
        const strategyTokenSupply = existingStrategyTokenAccount.extensions
          .mint!.account.supply
        const ownedAmount = existingStrategyTokenAccount.extensions.amount!
        // Get the amount of underlying represented by the vault
        const underlyingBn = getMintNaturalAmountFromDecimalAsBN(
          form.strategy.liquidity,
          governedTokenAccount.extensions.mint!.account.decimals
        )
        // Calculate ownership from ratio
        const amountOwned = underlyingBn
          .mul(ownedAmount)
          .div(strategyTokenSupply)
        const underlyingOwned = getMintDecimalAmountFromNatural(
          governedTokenAccount.extensions.mint!.account,
          amountOwned
        ).toNumber()
        setUnderlyingDeposited(underlyingOwned)
      }
    })()
  }, [form.strategy, governedTokenAccount, governedTokenAccountsWithoutNfts])

  const handleDeposit = useCallback(() => {
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
        config?.account.communityTokenConfig.maxVoterWeightAddin
      ? realm!.account.communityMint
      : !councilMint?.supply.isZero()
      ? realm!.account.config.councilMint
      : undefined
    const strategyInfo: PsyFiStrategyInfo = {
      ownedStrategyTokenAccount: ownedStrategyTokenAccount,
    }
    createProposalFcn(
      rpcContext,
      {
        ...form,
        action: Action.Deposit,
        bnAmount: getMintNaturalAmountFromDecimalAsBN(
          form.amount as number,
          governedTokenAccount.extensions.mint!.account.decimals
        ),
      },
      strategyInfo,
      realm!,
      governedTokenAccount!,
      ownTokenRecord,
      defaultProposalMint!,
      governedTokenAccount!.governance!.account!.proposalCount,
      false,
      connection,
      client
    )
    setIsDepositing(false)
  }, [
    client,
    config,
    connection,
    councilMint,
    form,
    governedTokenAccount,
    mint,
    ownedStrategyTokenAccount,
    ownVoterWeight,
    realm,
    realmInfo,
    voteByCouncil,
    wallet,
  ])

  return (
    <div>
      {/* 
            TODO: Add a higher level selector that determines the action (Deposit, 
            Withdraw, Cancel pending deposit, etc) 
        */}
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
      <div className="border border-fgd-4 p-4 rounded-md mb-6 mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-fgd-3">Pending Deposits</span>
          <span className="font-bold text-fgd-1">
            ToDo{' '}
            <span className="font-normal text-fgd-3">{tokenInfo?.symbol}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-fgd-3">Current Deposit</span>
          <span className="font-bold text-fgd-1">
            {underlyingDeposited?.toLocaleString() || 0}{' '}
            <span className="font-normal text-fgd-3">{tokenInfo?.symbol}</span>
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
