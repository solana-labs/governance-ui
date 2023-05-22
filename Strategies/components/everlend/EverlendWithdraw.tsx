import { useState } from 'react'
import Button, { LinkButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import { RpcContext } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { getProgramVersionForRealm } from '@models/registry/api'
import {
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { CreateEverlendProposal } from '../../protocols/everlend/tools'
import { AssetAccount } from '@utils/uiTypes/assets'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import AdditionalProposalOptions from '@components/AdditionalProposalOptions'
import tokenPriceService from '@utils/services/tokenPrice'
import * as yup from 'yup'
import { precision } from '@utils/formatting'
import { validateInstruction } from '@utils/instructionTools'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Loading from '@components/Loading'
import { TreasuryStrategy } from '../../types/types'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

interface IProps {
  proposedInvestment: TreasuryStrategy & {
    poolMint: string
    rateEToken: number
    decimals: number
    poolPubKey: string
  }
  handledMint: string
  createProposalFcn: CreateEverlendProposal
  governedTokenAccount: AssetAccount
  depositedAmount: number
}

const EverlendWithdraw = ({
  proposedInvestment,
  createProposalFcn,
  governedTokenAccount,
  depositedAmount,
}: IProps) => {
  const [amount, setAmount] = useState(0)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [proposalInfo, setProposalInfo] = useState({
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const { realmInfo, ownVoterWeight } = useRealm()
  const { canUseTransferInstruction } = useGovernanceAssets()
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const { fmtUrlWithCluster } = useQueryContext()
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const router = useRouter()
  const { symbol } = router.query

  const tokenSymbol = tokenPriceService.getTokenInfo(
    governedTokenAccount.extensions.mint!.publicKey.toBase58()
  )?.symbol

  const proposalTitle = `Withdraw ${amount} ${
    tokenSymbol || 'tokens'
  } from the Everlend  pool`

  const mintInfo = governedTokenAccount.extensions?.mint?.account
  const mintMinAmount = mintInfo ? getMintMinAmountAsDecimal(mintInfo) : 1
  const currentPrecision = precision(mintMinAmount)

  const handleWithdraw = async () => {
    const isValid = await validateInstruction({
      schema,
      form: { amount },
      setFormErrors,
    })
    if (!isValid) {
      return
    }
    try {
      setIsWithdrawing(true)
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

      const amountToRate = Number(
        (amount * proposedInvestment.rateEToken).toFixed(
          proposedInvestment.decimals
        )
      )

      const proposalAddress = await createProposalFcn(
        rpcContext,
        {
          title: proposalInfo.title || proposalTitle,
          description: proposalInfo.description,
          amountFmt: String(amount),
          bnAmount: getMintNaturalAmountFromDecimalAsBN(
            amountToRate,
            governedTokenAccount.extensions.mint!.account.decimals
          ),
          action: 'Withdraw',
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
    setIsWithdrawing(false)
  }

  const schema = yup.object().shape({
    amount: yup.number().required('Amount is required').max(depositedAmount),
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
          <span className="text-fgd-3 mr-1">Bal:</span> {depositedAmount}
          <LinkButton
            onClick={() => setAmount(depositedAmount)}
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
        defaultDescription={`Withdraw ${tokenSymbol} from Everlend`}
        setTitle={(evt) =>
          setProposalInfo((prev) => ({ ...prev, title: evt.target.value }))
        }
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
          <span className="text-fgd-3">Proposed Withdraw</span>
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
          disabled={!amount || !canUseTransferInstruction || isWithdrawing}
          onClick={() => handleWithdraw()}
          className="w-full"
        >
          <Tooltip content={''}>
            {' '}
            {!isWithdrawing ? 'Propose withdraw' : <Loading></Loading>}
          </Tooltip>
        </Button>
      </div>
    </div>
  )
}

export default EverlendWithdraw
