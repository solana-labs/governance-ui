/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Button from 'components/Button'
import Input from 'components/inputs/Input'
import PreviousRouteBtn from 'components/PreviousRouteBtn'
import Tooltip from 'components/Tooltip'
import useQueryContext from 'hooks/useQueryContext'
import useRealm from 'hooks/useRealm'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { tryParseKey } from 'tools/validators/pubkey'
import { isFormValid } from 'utils/formValidation'
import { notify } from 'utils/notifications'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import * as yup from 'yup'
import { debounce } from '@utils/debounce'
import { createSetUpgradeAuthority } from '@tools/sdk/bpfUpgradeableLoader/createSetUpgradeAuthority'
import { AssetAccount } from '@utils/uiTypes/assets'
import { sendTransaction } from '@utils/send'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import GovernedAccountSelect from 'pages/dao/[symbol]/proposal/components/GovernedAccountSelect'
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
  const { assetAccounts } = useGovernanceAssetsStore()
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
  const [form, setForm] = useState<NewProgramForm>({
    ...defaultFormValues,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
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
        throw "You don't have enough governance power to create a new program governance"
      }
      const { isValid, validationErrors } = await isFormValid(schema, form)
      setFormErrors(validationErrors)
      if (isValid && realmMint) {
        setIsLoading(true)

        const transferUpgradeAuthIx = await createSetUpgradeAuthority(
          new PublicKey(form.programId),
          wallet!.publicKey!,
          form.authority!.governance.nativeTreasuryAddress
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
  //if you altering this look at useEffect for form.programId
  const schema = yup.object().shape({
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
  useEffect(() => {
    if (form.programId) {
      //now validation contains only programId if more fields come it would be good to reconsider this method.
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.programId])
  useEffect(() => {
    const wallet = assetAccounts.find(
      (x) =>
        x.governance.nativeTreasuryAddress.toBase58() === router.query?.wallet
    )
    if (wallet) {
      handleSetForm({ value: wallet, propertyName: 'authority' })
    }
  }, [router.query, assetAccounts])
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
            Transfer
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}

export default NewProgramForm
