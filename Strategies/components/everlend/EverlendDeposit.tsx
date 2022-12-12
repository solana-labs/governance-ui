import Button, { LinkButton } from '@components/Button'
import Tooltip from '@components/Tooltip'
import Input from '@components/inputs/Input'
import { useState } from 'react'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import tokenPriceService from '@utils/services/tokenPrice'

import {
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { RpcContext } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { getProgramVersionForRealm } from '@models/registry/api'
import { AssetAccount } from '@utils/uiTypes/assets'
import { CreateEverlendProposal } from '../../protocols/everlend/tools'
import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import * as yup from 'yup'
import { precision } from '@utils/formatting'
import { validateInstruction } from '@utils/instructionTools'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Loading from '@components/Loading'

interface IProps {
  proposedInvestment
  handledMint: string
  createProposalFcn: CreateEverlendProposal
  governedTokenAccount: AssetAccount
  depositedAmount: number
  maxDepositAmount: number
}

const EverlendDeposit = ({
  proposedInvestment,
  createProposalFcn,
  governedTokenAccount,
  depositedAmount,
  maxDepositAmount,
}: IProps) => {
  const [amount, setAmount] = useState(0)
  const tokenSymbol = tokenPriceService.getTokenInfo(
    governedTokenAccount.extensions.mint!.publicKey.toBase58()
  )?.symbol

  const proposalTitle = `Deposit ${amount} ${
    tokenSymbol || 'tokens'
  } to the Everlend  pool`

  const [proposalInfo, setProposalInfo] = useState({
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [isDepositing, setIsDepositing] = useState(false)
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const {
    realmInfo,
    realm,
    mint,
    councilMint,
    ownVoterWeight,
    symbol,
    config,
  } = useRealm()
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const { canUseTransferInstruction } = useGovernanceAssets()

  const mintInfo = governedTokenAccount.extensions?.mint?.account

  const mintMinAmount = mintInfo ? getMintMinAmountAsDecimal(mintInfo) : 1
  const currentPrecision = precision(mintMinAmount)
  const maxAmountFormatted = maxDepositAmount.toFixed(4)

  const handleDeposit = async () => {
    const isValid = await validateInstruction({
      schema,
      form: { amount },
      setFormErrors,
    })
    if (!isValid) {
      return
    }
    try {
      setIsDepositing(true)
      const rpcContext = new RpcContext(
        new PublicKey(realm!.owner),
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

      const proposalAddress = await createProposalFcn(
        rpcContext,
        {
          title: proposalInfo.title || proposalTitle,
          description: proposalInfo.description,
          amountFmt: String(amount),
          bnAmount: getMintNaturalAmountFromDecimalAsBN(
            amount,
            governedTokenAccount.extensions.mint!.account.decimals
          ),
          action: 'Deposit',
          poolPubKey: proposedInvestment.poolPubKey,
          tokenMint: proposedInvestment.handledMint,
          poolMint: proposedInvestment.poolMint,
        },
        realm!,
        governedTokenAccount!,
        ownTokenRecord,
        defaultProposalMint!,
        governedTokenAccount!.governance!.account!.proposalCount,
        false,
        connection,
        wallet!,
        client
      )
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress[0]}`
      )
      router.push(url)
    } catch (e) {
      console.error(e)
    }
    setIsDepositing(false)
  }

  const schema = yup.object().shape({
    amount: yup
      .number()
      .required('Amount is required')
      .max(Number(maxAmountFormatted)),
  })

  const validateAmountOnBlur = () => {
    setAmount(
      parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(amount))
        ).toFixed(currentPrecision)
      )
    )
  }

  return (
    <div>
      <div className="flex my-1.5 text-sm">
        Amount
        <div className="ml-auto flex items-center text-xs">
          <span className="text-fgd-3 mr-1">Bal:</span>{' '}
          {Number(maxAmountFormatted)}
          <LinkButton
            onClick={() => {
              setAmount(Number(maxAmountFormatted))
            }}
            className="font-bold ml-2 text-primary-light"
          >
            Max
          </LinkButton>
        </div>
      </div>
      <Input
        type="number"
        onChange={(e) => setAmount(e.target.value as any)}
        value={amount}
        onBlur={validateAmountOnBlur}
        error={formErrors['amount']}
      />
      <AdditionalProposalOptions
        title={proposalInfo.title}
        description={proposalInfo.description}
        defaultTitle={proposalTitle}
        defaultDescription={`Deposit ${tokenSymbol} into Everlend to mint cTokens and earn interest`}
        setTitle={(evt) => {
          setProposalInfo((prev) => ({ ...prev, title: evt.target.value }))
        }}
        setDescription={(evt) =>
          setProposalInfo((prev) => ({
            ...prev,
            description: evt.target.value,
          }))
        }
        voteByCouncil={voteByCouncil}
        setVoteByCouncil={setVoteByCouncil}
      />
      <div className="border border-fgd-4 p-4 rounded-md mb-6 mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-fgd-3">Current Deposits</span>
          <span className="font-bold text-fgd-1">
            {depositedAmount}{' '}
            <span className="font-normal text-fgd-3">{tokenSymbol}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-fgd-3">Proposed Deposit</span>
          <span className="font-bold text-fgd-1">
            {amount?.toLocaleString() || (
              <span className="font-normal text-red">Enter an amount</span>
            )}{' '}
            <span className="font-normal text-fgd-3">
              {amount && tokenSymbol}
            </span>
          </span>
        </div>
      </div>
      <div className="mt-4">
        <Button
          disabled={!amount || !canUseTransferInstruction || isDepositing}
          onClick={() => handleDeposit()}
          className="w-full"
        >
          <Tooltip content={''}>
            {' '}
            {!isDepositing ? 'Propose deposit' : <Loading></Loading>}
          </Tooltip>
        </Button>
      </div>
    </div>
  )
}

export default EverlendDeposit
