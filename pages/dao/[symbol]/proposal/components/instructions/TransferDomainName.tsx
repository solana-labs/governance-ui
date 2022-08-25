import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import useWalletStore from 'stores/useWalletStore'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { validateInstruction } from '@utils/instructionTools'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  DomainNameTransferForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import {
  performReverseLookup,
  transferInstruction,
} from '@bonfida/spl-name-service'
import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useRealm from '@hooks/useRealm'

import { LoadingDots } from '@components/Loading'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Select from '@components/inputs/Select'
import Input from '@components/inputs/Input'

const TransferDomainName = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realmInfo } = useRealm()
  const connection = useWalletStore((s) => s.connection.current)
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const [domains, setDomains] = useState<
    { domainName: string; domainAddress: PublicKey | undefined }[]
  >([{ domainName: '', domainAddress: undefined }])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchedDomains, setFetchedDomains] = useState(false)
  const [form, setForm] = useState<DomainNameTransferForm>({
    destinationAccount: '',
    governedAccount: undefined,

    domainAddress: undefined,
    programId: 'namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX',
  })
  const governedAccount = assetAccounts.filter((acc) => acc.isSol)[0]
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    console.log({ propertyName, value })

    setForm({ ...form, [propertyName]: value })
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    const obj: UiInstruction = {
      serializedInstruction: '',
      isValid,
      governance: governedAccount?.governance,
    }

    if (
      isValid &&
      form.programId &&
      form.governedAccount &&
      form.destinationAccount &&
      form.domainAddress
    ) {
      const nameProgramId = new PublicKey(
        'namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX'
      )
      const nameAccountKey = new PublicKey(form.domainAddress)
      const nameOwner = governedAccount.pubkey
      const newOwnerKey = new PublicKey(form.destinationAccount)

      const transferIx = transferInstruction(
        nameProgramId,
        nameAccountKey,
        newOwnerKey,
        nameOwner
      )

      obj.serializedInstruction = serializeInstructionToBase64(transferIx)
    }
    return obj
  }

  const getDomains = async (accounts: AssetAccount[]) => {
    if (fetchedDomains) return
    setIsLoading(true)
    const solAccounts = accounts.filter((acc) => acc.isSol)
    for (let i = 0; i < solAccounts.length; i++) {
      try {
        const startTime = Date.now()
        const domainsForAccount = await connection
          .getProgramAccounts(
            new PublicKey('namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX'),
            {
              encoding: 'base64',
              commitment: 'confirmed',
              filters: [
                {
                  memcmp: {
                    offset: 0,
                    bytes: '58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx',
                  },
                },
                {
                  memcmp: {
                    offset: 32,
                    bytes: 'BHyNLKxKKKqjQV21Z6CTJCRS1YKSLgbKRqoQGzoGo5mo',
                  },
                },
              ],
            }
          )
          .then((d) => {
            console.log(
              `🚨 Get All Domains Time Elapsed: ${Date.now() - startTime}ms`
            )
            setIsLoading(false)
            return d
          })
          .catch((e) => console.log(e))

        if (domainsForAccount && domainsForAccount.length > 0) {
          for (let n = 0; n < domainsForAccount.length; n++) {
            const startTime = Date.now()
            const domainAsString = await performReverseLookup(
              connection,
              domainsForAccount[n].pubkey
            ).then((d) => {
              console.log(
                `🏁 Reverse Lookup Time Elapsed: ${Date.now() - startTime}ms`
              )
              setIsLoading(false)
              return d
            })

            setDomains((d) => [
              ...d,
              {
                domainName: domainAsString.toString(),
                domainAddress: domainsForAccount[n].pubkey,
              },
            ])
          }
        }
        setFetchedDomains(true)
      } catch (e) {
        console.log(
          '🚀 ~ file: SnsDomainNameTransfer.tsx ~ line 44 ~ getDomains ~ e',
          e
        )
      }
    }
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount?.governance, getInstruction },
      index
    )
  }, [form])

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: realmInfo?.programId?.toString(),
    })
  }, [])

  // useEffect(() => {
  //   ;(async () => {
  //     if (domains.length < 1) return await getDomains(assetAccounts)
  //   })()
  // }, [])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    destinationAccount: yup
      .string()
      .required('Please provide a destination account'),
    domainAddress: yup.object(),
    // domainAddress: yup
    //   .string()
    //   .required('Please provide a destination account'),
    programId: yup.string().required('ProgramId is not defined'),
  })
  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={[governedAccount]}
        onChange={(value) => {
          getDomains(assetAccounts)
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        label="Destination Account"
        value={form.destinationAccount}
        type="text"
        onChange={(element) =>
          handleSetForm({
            propertyName: 'destinationAccount',
            value: element.target.value,
          })
        }
        error={formErrors['destinationAccount']}
        // onBlur={validateAmountOnBlur}
      />
      {isLoading ? (
        <div className="mt-5">
          <div>Looking up domains...</div>
          <LoadingDots />
        </div>
      ) : (
        <Select
          className=""
          label="Domain"
          value={
            form.domainAddress
              ? domains.find((d) => d.domainAddress === form.domainAddress)
                  ?.domainName + '.sol'
              : ''
          }
          placeholder="Please select..."
          error={formErrors['domainAddress']}
          onChange={(value) => {
            handleSetForm({
              value: domains.find((d) => d.domainName === value)?.domainAddress,
              propertyName: 'domainAddress',
            })
          }}
        >
          {domains.map(
            (domain, index) =>
              // dont render default value
              domain.domainAddress && (
                <Select.Option
                  key={domain.domainName + index}
                  value={domain.domainName}
                >
                  <div className="text-fgd-1 mb-2">{domain.domainName}.sol</div>
                  <div className="">{domain.domainAddress?.toString()}</div>
                </Select.Option>
              )
          )}
        </Select>
      )}
    </>
  )
}

export default TransferDomainName
