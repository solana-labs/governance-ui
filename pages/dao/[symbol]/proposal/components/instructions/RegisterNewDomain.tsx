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
import {
  RegisterNewDomainForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import {
  getDomainKey,
  NameRegistryState,
  createNameRegistry,
} from '@bonfida/spl-name-service'
import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'

import { LoadingDots } from '@components/Loading'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Select from '@components/inputs/Select'
import Input from '@components/inputs/Input'
import { debounce } from '@utils/debounce'
import UnselectedWalletIcon from '@components/treasuryV2/icons/UnselectedWalletIcon'
import { abbreviateAddress } from '@utils/formatting'
import Link from 'next/link'
import { serialize } from 'borsh'

const RegisterNewDomain = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { current: connection } = useWalletStore((s) => s.connection)
  const { handleSetInstructions } = useContext(NewProposalContext)

  const { assetAccounts } = useGovernanceAssets()
  const governedAccount = assetAccounts.filter((acc) => acc.isSol)[0]

  const [isDomainLoading, setIsDomainLoading] = useState(false)
  const [isDomainAvailable, setIsDomainAvailable] = useState(false)
  const [domain, setDomain] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState<RegisterNewDomainForm>({
    destinationAccount: '',
    governedAccount: undefined,
    domain: undefined,
    storage: null,
  })

  const isDomainTaken = async (domain: string) => {
    setIsDomainLoading(true)
    try {
      const { pubkey } = await getDomainKey(
        domain.trim().toLowerCase().replace('.sol', '')
      )

      const { registry, nftOwner } = await NameRegistryState.retrieve(
        connection,
        pubkey
      )

      if (registry.owner || nftOwner) return true
      else return false
    } catch (error) {
      if (error.message === 'Invalid name account provided') return false
      console.log(error)
    } finally {
      setIsDomainLoading(false)
    }
  }

  useEffect(() => {
    setFormErrors({})
    setForm((f) => ({ ...f, domain: '' }))
    setIsDomainAvailable(false)
    debounce.debounceFcn(async () => {
      if (domain && (await isDomainTaken(domain))) {
        setFormErrors((f) => ({
          ...f,
          domain: `${domain.toLowerCase()} is not available. Try a different domain name. `,
        }))
      } else {
        setForm((f) => ({ ...f, domain: domain }))
        setIsDomainAvailable(true)
      }
    })
  }, [domain])

  const calcDomainPrice = (domain: string) => {
    const length = domain.trim().replace('.sol', '').length

    switch (length) {
      case 0:
        return 0
      case 1:
        return 750
      case 2:
        return 700
      case 3:
        return 640
      case 4:
        return 160
      default:
        return 20
    }
  }

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  async function getInstruction(): Promise<UiInstruction> {
    // Input validation
    const isValid = await validateInstruction({
      schema,
      form,
      setFormErrors,
    })

    const obj: UiInstruction = {
      serializedInstruction: '',
      isValid,
      governance: governedAccount?.governance,
    }

    if (
      isValid &&
      form.destinationAccount &&
      form.domain &&
      form.governedAccount
    ) {
      // todo: add advanced options
      console.log('Form', form)

      const instruction = await createNameRegistry(
        connection,
        form.domain.trim().toLowerCase().replace('.sol', ''),
        form.storage ? form.storage * 1024 : 1024,
        form.governedAccount.pubkey,
        new PublicKey(form.destinationAccount)
      ).catch(console.log)

      if (instruction)
        obj.serializedInstruction = serializeInstructionToBase64(instruction)
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    destinationAccount: yup.string().required('Select a DAO Wallet to mint to'),
    domain: yup.string().required('Please input a domain name'),
    storage: yup
      .number()
      .required('Provide a a number for the size in kb of the desired account')
      .min(1)
      .max(10),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={assetAccounts.filter((acc) => acc.isSol)}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      <Input
        label="Domain"
        value={domain}
        type="text"
        checkIcon={domain !== '' && isDomainAvailable}
        placeholder="dao.sol"
        onChange={(element) => setDomain(element.target.value)}
        error={formErrors['domain']}
      />
      {isDomainLoading && <LoadingDots />}

      {form.domain && domain && (
        <>
          <div>
            <div className="text-sm">Domain Price</div>
            <p>${calcDomainPrice(domain)} USDC</p>
          </div>

          <Input
            label="Storage"
            onChange={(value) => {
              handleSetForm({
                value: value.target.value,
                propertyName: 'storage',
              })
            }}
            min={1}
            max={10}
            placeholder="Please select..."
            value={form.storage}
            error={formErrors['storage']}
            type="number"
          />

          <p className="text-sm">
            The storage size will determine the maximum amount of data you can
            store on your domain. 1kb is enough for non-advanced users.{' '}
            <Link
              href="https://docs.bonfida.org/collection/how-to-create-a-solana-domain-name/purchasing-a-domain-name/direct-registration"
              target="_blank"
              passHref
            >
              <a className="text-primary-light ">
                More information about storage...
              </a>
            </Link>
          </p>
        </>
      )}
      <Select
        label="Destination Address"
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'destinationAccount' })
        }}
        placeholder="Please select..."
        // className="overflow-hidden"
        value={form.destinationAccount || null}
        error={formErrors['destinationAccount']}
      >
        {assetAccounts
          .filter((acc) => acc.isSol)
          .map((acc) => (
            <Select.Option
              className="border-red"
              key={acc.pubkey.toBase58()}
              value={acc.pubkey.toBase58()}
            >
              <div className="grid grid-cols-[40px,1fr,max-content] gap-x-4 text-fgd-1 items-center w-full">
                <div>
                  <UnselectedWalletIcon className="h-10 w-10 stroke-white/50" />
                </div>
                <div>
                  <div className="mb-0.5 truncate w-full">
                    {abbreviateAddress(acc.pubkey.toBase58())}
                  </div>
                </div>
              </div>
            </Select.Option>
          ))}
      </Select>
      {/* {isLoading ? (
        <div className="mt-5">
          <div>Looking up accountDomains...</div>
          <LoadingDots />
        </div>
      ) : (
        <Select
          className=""
          label="Domain"
          value={
            form.domainAddress
              ? accountDomains.find(
                  (d) => d.domainAddress === form.domainAddress
                )?.domainName + '.sol'
              : ''
          }
          placeholder="Please select..."
          error={formErrors['domainAddress']}
          onChange={(value) => {
            handleSetForm({
              value: accountDomains.find((d) => d.domainName === value)
                ?.domainAddress,
              propertyName: 'domainAddress',
            })
          }}
        >
          {accountDomains?.map(
            (domain, index) =>
              domain.domainAddress && (
                <Select.Option
                  key={domain.domainName! + index}
                  value={domain.domainName}
                >
                  <div className="text-fgd-1 mb-2">{domain.domainName}.sol</div>
                  <div className="">{domain.domainAddress?.toString()}</div>
                </Select.Option>
              )
          )}
        </Select>
      )} */}
    </>
  )
}
export default RegisterNewDomain
