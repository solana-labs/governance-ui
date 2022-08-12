import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import { AssetAccount } from '@utils/uiTypes/assets'
import { performReverseLookup } from '@bonfida/spl-name-service'

import Select from '@components/inputs/Select'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'

interface ISnsDomainNameTransferForm {
  domain: IDomain
}

interface IDomain {
  pubkey: PublicKey | null
  name: string | undefined
}

const SnsDomainNameTransfer = ({
  governance,
  index,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = index !== 0 && governance
  const connection = useWalletStore((s) => s.connection.current)

  const { realmInfo, realm } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const [domains, setDomains] = useState<IDomain[]>([])
  const [form, setForm] = useState<ISnsDomainNameTransferForm>({
    domain: {
      name: undefined,
      pubkey: null,
    },
  })
  const [formErrors, setFormErrors] = useState({})

  const getDomains = async (accounts: AssetAccount[]) => {
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
            return d
          })
          .catch((e) => console.log(e))

        // {"method":"getProgramAccounts","jsonrpc":"2.0","params":["namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX",{"encoding":"base64","commitment":"confirmed","filters":[{"memcmp":{"offset":0,"bytes":"58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"}},{"memcmp":{"offset":32,"bytes":"BHyNLKxKKKqjQV21Z6CTJCRS1YKSLgbKRqoQGzoGo5mo"}}]}],"id":"97ae5717-dc81-470b-be45-8229ee146fb0"}

        if (domainsForAccount && domainsForAccount.length > 0) {
          for (let n = 0; n < domainsForAccount.length; n++) {
            const startTime = Date.now()
            const domainStrings = await performReverseLookup(
              connection,
              domainsForAccount[n].pubkey
            ).then((d) => {
              console.log(
                `🏁 Reverse Lookup Time Elapsed: ${Date.now() - startTime}ms`
              )
              return d
            })
            setDomains((d) => [
              ...d,
              { name: domainStrings[n], pubkey: domainsForAccount[n].pubkey },
            ])
          }
        }
      } catch (e) {
        console.log(
          '🚀 ~ file: SnsDomainNameTransfer.tsx ~ line 44 ~ getDomains ~ e',
          e
        )
      }
    }
  }

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  useEffect(() => {
    //
    ;(async () => {
      await getDomains(assetAccounts)
    })()
  }, [realmInfo])

  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: assetAccounts.filter((x) => x.isSol)[0] ?? null,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned,
      governance: governance,
      options: assetAccounts.filter((x) => x.isSol),
    },
    {
      label: 'Domain',
      initialValue: 0,
      name: 'size',
      type: InstructionInputType.SELECT,
      min: 1,
      validateMinMax: true,
    },
    // {
    //   label: 'Collection weight',
    //   initialValue: 1,
    //   name: 'weight',
    //   inputType: 'number',
    //   type: InstructionInputType.INPUT,
    //   min: 0,
    //   validateMinMax: true,
    // },
  ]

  return (
    <>
      <GovernedAccountSelect
        label="Source Account"
        governance={governance}
        value={assetAccounts.filter((acc) => acc.isSol)[0]}
        governedAccounts={assetAccounts.filter((acc) => acc.isSol)}
        error={formErrors['governedTokenAccount']}
        onChange={handleSetForm}
      ></GovernedAccountSelect>
      {/* <Select
          label="Domain"
          value={form.domain}
          placeholder="Please select..."
          onChange={(value) => handleSetForm({ value, propertyName: 'domain' })}
        >
          {domains.map((domain) => {
            return <span key={domain.name}>{domain.name}</span>
          })}
        </Select> */}
    </>
  )
}

export default SnsDomainNameTransfer
