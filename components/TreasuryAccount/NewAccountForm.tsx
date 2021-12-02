import Button from '@components/Button'
import Input from '@components/inputs/Input'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import Tooltip from '@components/Tooltip'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { RpcContext } from '@models/core/api'
import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import {
  formatPercentage,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimal,
  getMintSupplyAsDecimal,
  getMintSupplyFractionAsDecimalPercentage,
  getMintSupplyPercentageAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { tryParseKey } from '@tools/validators/pubkey'
import { debounce } from '@utils/debounce'
import { isFormValid } from '@utils/formValidation'
import { getGovernanceConfig } from '@utils/GovernanceTools'
import { notify } from '@utils/notifications'
import tokenService, { TokenRecord } from '@utils/services/token'
import { ProgramAccount, tryGetMint } from '@utils/tokens'
import { createTreasuryAccount } from 'actions/createTreasuryAccount'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import * as yup from 'yup'
interface NewTreasuryAccountForm {
  mintAddress: string
  minCommunityTokensToCreateProposal: number
  minInstructionHoldUpTime: number
  maxVotingTime: number
  voteThreshold: number
}
const defaultFormValues = {
  mintAddress: '',
  minCommunityTokensToCreateProposal: 100,
  minInstructionHoldUpTime: 0,
  maxVotingTime: 3,
  voteThreshold: 60,
}
const NewAccountForm = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const {
    realmInfo,
    realm,
    ownCouncilTokenRecord,
    ownTokenRecord,
    mint: realmMint,
    symbol,
  } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const { fetchRealm } = useWalletStore((s) => s.actions)
  const [form, setForm] = useState<NewTreasuryAccountForm>({
    ...defaultFormValues,
  })
  const [tokenInfo, setTokenInfo] = useState<TokenRecord | undefined>(undefined)
  const [mint, setMint] = useState<ProgramAccount<MintInfo> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [minTokensPercentage, setMinTokensPercentage] = useState<
    number | undefined
  >()

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const validateMinMax = (e) => {
    const fieldName = e.target.name
    const min = e.target.min || 0
    const max = e.target.max || Number.MAX_SAFE_INTEGER
    const value = form[fieldName]
    const currentPrecision = new BigNumber(min).decimalPlaces()

    handleSetForm({
      value: parseFloat(
        Math.max(Number(min), Math.min(Number(max), Number(value))).toFixed(
          currentPrecision
        )
      ),
      propertyName: fieldName,
    })
  }
  const canCreateGovernanceUsingCommunityTokens = ownTokenRecord

  const canCreateGovernanceUsingCouncilTokens =
    ownCouncilTokenRecord &&
    !ownCouncilTokenRecord.info.governingTokenDepositAmount.isZero()

  const tokenOwnerRecord = canCreateGovernanceUsingCouncilTokens
    ? ownCouncilTokenRecord
    : canCreateGovernanceUsingCommunityTokens
    ? ownTokenRecord
    : undefined

  const handleCreate = async () => {
    try {
      if (!realm) {
        throw 'No realm selected'
      }
      if (!connected) {
        throw 'Please connect your wallet'
      }
      const { isValid, validationErrors } = await isFormValid(schema, form)
      setFormErrors(validationErrors)
      if (isValid) {
        setIsLoading(true)
        const rpcContext = new RpcContext(
          new PublicKey(realm.account.owner.toString()),
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        const governanceConfigValues = {
          minTokensToCreateProposal: form.minCommunityTokensToCreateProposal,
          minInstructionHoldUpTime: form.minInstructionHoldUpTime,
          maxVotingTime: form.maxVotingTime,
          voteThresholdPercentage: form.voteThreshold,
          mintDecimals: realmMint!.decimals,
        }
        const governanceConfig = getGovernanceConfig(governanceConfigValues)
        await createTreasuryAccount(
          rpcContext,
          realm.pubkey,
          new PublicKey(form.mintAddress),
          governanceConfig,
          tokenOwnerRecord!.pubkey
        )
        setIsLoading(false)
        fetchRealm(realmInfo!.programId, realmInfo!.realmId)
        router.push(fmtUrlWithCluster(`/dao/${symbol}/`))
      }
    } catch (e) {
      //TODO maybe some generic inside sendTransaction?
      notify({
        type: 'error',
        message: `Can't create governance`,
        description: 'Unauthorized to create governance',
      })
      setIsLoading(false)
    }
  }
  const schema = yup.object().shape({
    mintAddress: yup
      .string()
      .test(
        'mintAddressTest',
        'Mint address validation error',
        async function (val: string) {
          if (val) {
            try {
              const mint = new PublicKey(val)
              const mintAccount = await tryGetMint(connection.current, mint)
              if (!mintAccount) {
                return this.createError({
                  message: `Invalid mint address`,
                })
              }
              return true
            } catch (e) {
              return this.createError({
                message: `Invalid mint address`,
              })
            }
          } else {
            return this.createError({
              message: `Mint address is required`,
            })
          }
        }
      ),
  })
  function parseMinTokensToCreateProposal(
    value: string | number,
    mintDecimals: number
  ) {
    return typeof value === 'string'
      ? parseMintNaturalAmountFromDecimal(value, mintDecimals)
      : getMintNaturalAmountFromDecimal(value, mintDecimals)
  }
  // Use 1% of mint supply as the default value for minTokensToCreateProposal and the default increment step in the input editor
  const mintSupply1Percent = realmMint
    ? getMintSupplyPercentageAsDecimal(realmMint, 1)
    : 100
  const minTokenAmount = realmMint
    ? getMintMinAmountAsDecimal(realmMint)
    : 0.0001
  // If the supply is small and 1% is below the minimum mint amount then coerce to the minimum value
  const minTokenStep = Math.max(mintSupply1Percent, minTokenAmount)

  const maxTokenAmount = !realmMint?.supply.isZero()
    ? getMintSupplyAsDecimal(realmMint!)
    : undefined

  const getMinTokensPercentage = (amount: number) =>
    getMintSupplyFractionAsDecimalPercentage(realmMint!, amount)

  const onMinTokensChange = (minTokensToCreateProposal: number | string) => {
    const minTokens = parseMinTokensToCreateProposal(
      minTokensToCreateProposal,
      realmMint!.decimals
    )
    setMinTokensPercentage(getMinTokensPercentage(minTokens))
  }
  useEffect(() => {
    onMinTokensChange(form.minCommunityTokensToCreateProposal)
  }, [form.minCommunityTokensToCreateProposal])
  const handleSetDefaultMintError = () => {
    const mintError = { mintAddress: 'Invalid mint address' }
    setFormErrors(mintError)
    setMint(null)
    setTokenInfo(undefined)
  }
  useEffect(() => {
    if (form.mintAddress) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.mintAddress)
        if (pubKey) {
          const mintAccount = await tryGetMint(connection.current, pubKey)
          if (mintAccount) {
            setMint(mintAccount)
            const info = tokenService.getTokenInfo(form.mintAddress)
            setTokenInfo(info)
          } else {
            handleSetDefaultMintError()
          }
        } else {
          handleSetDefaultMintError()
        }
      })
    } else {
      setMint(null)
      setTokenInfo(undefined)
    }
  }, [form.mintAddress])

  return (
    <div className="space-y-3">
      <PreviousRouteBtn />
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Create new treasury account</h1>
        </div>
      </div>
      <Input
        label="Mint address"
        value={form.mintAddress}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mintAddress',
          })
        }
        error={formErrors['mintAddress']}
      />
      {tokenInfo ? (
        <div className="flex items-center">
          {tokenInfo?.logoURI && (
            <img
              className="flex-shrink-0 h-6 w-6 mr-2.5"
              src={tokenInfo.logoURI}
            />
          )}
          <div>
            {tokenInfo.name}
            <p className="text-fgd-3 text-xs">{tokenInfo?.symbol}</p>
          </div>
        </div>
      ) : mint ? (
        <div>Mint found</div>
      ) : null}
      <Input
        label="Min community tokens to create proposal"
        value={form.minCommunityTokensToCreateProposal}
        type="number"
        name="minCommunityTokensToCreateProposal"
        min={minTokenAmount}
        max={maxTokenAmount}
        step={minTokenStep}
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'minCommunityTokensToCreateProposal',
          })
        }
        error={formErrors['minCommunityTokensToCreateProposal']}
      />
      {maxTokenAmount && minTokensPercentage && (
        <div>{`${formatPercentage(minTokensPercentage)} of token supply`}</div>
      )}
      <Input
        label="min instruction hold up time (days)"
        value={form.minInstructionHoldUpTime}
        type="number"
        min={0}
        name="minInstructionHoldUpTime"
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'minInstructionHoldUpTime',
          })
        }
        error={formErrors['minInstructionHoldUpTime']}
      />
      <Input
        label="Max voting time (days)"
        value={form.maxVotingTime}
        name="maxVotingTime"
        type="number"
        min={1}
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maxVotingTime',
          })
        }
        error={formErrors['maxVotingTime']}
      />
      <Input
        label="Yes vote threshold (%)"
        value={form.voteThreshold}
        max={100}
        min={1}
        name="voteThreshold"
        type="number"
        onBlur={validateMinMax}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'voteThreshold',
          })
        }
        error={formErrors['voteThreshold']}
      />
      <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
        <Tooltip content={!connected && 'Please connect your wallet'}>
          <Button
            disabled={!connected}
            isLoading={isLoading}
            onClick={handleCreate}
          >
            Create
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}

export default NewAccountForm
