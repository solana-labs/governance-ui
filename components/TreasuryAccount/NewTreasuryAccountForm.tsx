import BaseGovernanceForm, {
  BaseGovernanceFormFields,
} from 'components/AssetsList/BaseGovernanceForm'
import Button from 'components/Button'
import Input from 'components/inputs/Input'
import PreviousRouteBtn from 'components/PreviousRouteBtn'
import useQueryContext from 'hooks/useQueryContext'
import useRealm from 'hooks/useRealm'
import { RpcContext } from 'models/core/api'
import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { tryParseKey } from 'tools/validators/pubkey'
import { debounce } from 'utils/debounce'
import { isFormValid } from 'utils/formValidation'
import { getGovernanceConfig } from '@utils/GovernanceTools'
import { notify } from 'utils/notifications'
import tokenService, { TokenRecord } from 'utils/services/token'
import { ProgramAccount, tryGetMint } from 'utils/tokens'
import { createTreasuryAccount } from 'actions/createTreasuryAccount'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import * as yup from 'yup'
import Switch from '@components/Switch'
import { DEFAULT_NFT_TREASURY_MINT } from '@components/instructions/tools'
import { MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY } from '@tools/constants'

interface NewTreasuryAccountForm extends BaseGovernanceFormFields {
  mintAddress: string
}
const defaultFormValues = {
  mintAddress: '',
  // TODO: This is temp. fix to avoid wrong default for Multisig DAOs
  // This should be dynamic and set to 1% of the community mint supply or
  // MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY when supply is 0
  minCommunityTokensToCreateProposal: MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY,
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
    mint: realmMint,
    symbol,
    ownVoterWeight,
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
  const [isNFT, setIsNFT] = useState(false)
  const tokenOwnerRecord = ownVoterWeight.canCreateGovernanceUsingCouncilTokens()
    ? ownVoterWeight.councilTokenRecord
    : realm && ownVoterWeight.canCreateGovernanceUsingCommunityTokens(realm)
    ? ownVoterWeight.communityTokenRecord
    : undefined

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const handleCreate = async () => {
    try {
      if (!realm) {
        throw 'No realm selected'
      }
      if (!connected) {
        throw 'Please connect your wallet'
      }
      if (!tokenOwnerRecord) {
        throw "You don't have enough governance power to create a new treasury account"
      }
      const { isValid, validationErrors } = await isFormValid(schema, form)
      setFormErrors(validationErrors)
      if (isValid && realmMint) {
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
          mintDecimals: realmMint.decimals,
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
      //TODO how do we present errors maybe something more generic ?
      notify({
        type: 'error',
        message: `Can't create governance`,
        description: `Transaction error ${e}`,
      })
      setIsLoading(false)
    }
  }
  const handleSetDefaultMintError = () => {
    const mintError = { mintAddress: 'Invalid mint address' }
    setFormErrors(mintError)
    setMint(null)
    setTokenInfo(undefined)
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
              const pubKey = tryParseKey(val)
              if (!pubKey) {
                return this.createError({
                  message: `Invalid mint address`,
                })
              }

              const accountData = await connection.current.getAccountInfo(
                pubKey
              )
              if (!accountData) {
                return this.createError({
                  message: `Account not found`,
                })
              }
              const mint = tryGetMint(connection.current, pubKey)
              if (!mint) {
                return this.createError({
                  message: `Account is not a valid mint`,
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

  useEffect(() => {
    handleSetForm({
      value: isNFT ? DEFAULT_NFT_TREASURY_MINT : '',
      propertyName: 'mintAddress',
    })
  }, [isNFT])

  return (
    <div className="space-y-3">
      <PreviousRouteBtn />
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Create new treasury account</h1>
        </div>
      </div>
      <div className="text-sm mb-3">
        <div className="mb-2">NFT Treasury</div>
        <div className="flex flex-row text-xs items-center">
          <Switch checked={isNFT} onChange={() => setIsNFT(!isNFT)} />
        </div>
      </div>
      {!isNFT && (
        <>
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
        </>
      )}
      <BaseGovernanceForm
        formErrors={formErrors}
        form={form}
        setForm={setForm}
        setFormErrors={setFormErrors}
      ></BaseGovernanceForm>
      <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
        <Button
          tooltipMessage={!connected ? 'Please connect your wallet' : ''}
          disabled={!connected || isLoading}
          isLoading={isLoading}
          onClick={handleCreate}
        >
          Create
        </Button>
      </div>
    </div>
  )
}

export default NewAccountForm
