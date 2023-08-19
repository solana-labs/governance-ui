/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Button from 'components/Button'
import Input from 'components/inputs/Input'
import PreviousRouteBtn from 'components/PreviousRouteBtn'
import Tooltip from 'components/Tooltip'
import useQueryContext from 'hooks/useQueryContext'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { tryParseKey } from 'tools/validators/pubkey'
import { isFormValid } from 'utils/formValidation'
import { notify } from 'utils/notifications'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as yup from 'yup'
import { debounce } from '@utils/debounce'
import { createSetUpgradeAuthority } from '@tools/sdk/bpfUpgradeableLoader/createSetUpgradeAuthority'
import { AssetAccount } from '@utils/uiTypes/assets'
import { sendTransaction } from '@utils/send'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import GovernedAccountSelect from 'pages/dao/[symbol]/proposal/components/GovernedAccountSelect'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { usePrevious } from '@hooks/usePrevious'
import { useLegacyVoterWeight } from '@hooks/queries/governancePower'
interface NewProgramForm {
  programId: string
  authority: null | AssetAccount
}

const defaultFormValues = {
  programId: '',
  authority: null,
} as const

const NewProgramForm = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()

  const realm = useRealmQuery().data?.result
  const realmMint = useRealmCommunityMintInfoQuery().data?.result
  const { symbol } = router.query
  const { result: ownVoterWeight } = useLegacyVoterWeight()
  const { assetAccounts } = useGovernanceAssetsStore()

  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const connected = !!wallet?.connected
  const [form, setForm] = useState<NewProgramForm>({
    ...defaultFormValues,
  })
  const prevFormProgramId = usePrevious(form.programId)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const tokenOwnerRecord = ownVoterWeight?.canCreateGovernanceUsingCouncilTokens()
    ? ownVoterWeight.councilTokenRecord
    : realm && ownVoterWeight?.canCreateGovernanceUsingCommunityTokens(realm)
    ? ownVoterWeight.communityTokenRecord
    : undefined

  const handleSetForm = useCallback(({ propertyName, value }) => {
    setFormErrors({})
    setForm((prevForm) => ({ ...prevForm, [propertyName]: value }))
  }, [])
  const handleCreate = async () => {
    try {
      if (!realm) {
        throw 'No realm selected'
      }
      if (!connected) {
        throw 'Please connect your wallet'
      }
      if (!tokenOwnerRecord) {
        throw "You don't have enough governance power to create a new program governance"
      }
      const { isValid, validationErrors } = await isFormValid(schema, form)
      setFormErrors(validationErrors)
      if (isValid && realmMint) {
        setIsLoading(true)

        const transferUpgradeAuthIx = await createSetUpgradeAuthority(
          new PublicKey(form.programId),
          wallet!.publicKey!,
          form.authority!.governance.nativeTreasuryAddress!
        )
        const transaction = new Transaction()
        transaction.add(transferUpgradeAuthIx)
        const signers: Keypair[] = []
        await sendTransaction({
          transaction,
          wallet: wallet!,
          connection: connection.current,
          signers,
          sendingMessage: 'Transferring authority',
          successMessage: 'Authority has been transferred',
        })
        setIsLoading(false)
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

  const schema = useMemo(() => {
    return yup.object().shape({
      programId: yup
        .string()
        .test(
          'programIdTest',
          'program id validation error',
          async function (val: string) {
            if (val) {
              try {
                const pubKey = tryParseKey(val)
                if (!pubKey) {
                  return this.createError({
                    message: `Invalid account address`,
                  })
                }

                const accountData = await connection.current.getParsedAccountInfo(
                  pubKey
                )
                if (!accountData || !accountData.value) {
                  return this.createError({
                    message: `Account not found`,
                  })
                }
                return true
              } catch (e) {
                return this.createError({
                  message: `Invalid account address`,
                })
              }
            } else {
              return this.createError({
                message: `Program id is required`,
              })
            }
          }
        ),
    })
  }, [connection])

  useEffect(() => {
    if (form.programId && form.programId !== prevFormProgramId) {
      //now validation contains only programId if more fields come it would be good to reconsider this method.
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form, form.programId, schema, prevFormProgramId])

  useEffect(() => {
    const wallet = assetAccounts.find(
      (x) =>
        x.governance.nativeTreasuryAddress?.toBase58() === router.query?.wallet
    )
    if (wallet && router.query?.wallet) {
      handleSetForm({ value: wallet, propertyName: 'authority' })
    }
  }, [router.query, assetAccounts, handleSetForm])

  return (
    <div className="space-y-3">
      <PreviousRouteBtn />
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Add program to wallet</h1>
        </div>
      </div>
      <Input
        label="Program id"
        value={form.programId}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'programId',
          })
        }
        error={formErrors['programId']}
      />
      <GovernedAccountSelect
        label="Wallet"
        governedAccounts={assetAccounts.filter((x) => x.governance.pubkey)}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'authority' })
        }}
        value={form.authority}
        error={formErrors['authority']}
        type="wallet"
      ></GovernedAccountSelect>
      <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
        <Tooltip content={!connected && 'Please connect your wallet'}>
          <Button
            disabled={!connected || isLoading}
            isLoading={isLoading}
            onClick={handleCreate}
          >
            Add
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}

export default NewProgramForm
