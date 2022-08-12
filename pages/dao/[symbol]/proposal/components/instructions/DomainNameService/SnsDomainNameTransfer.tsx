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
import { domain } from 'process'
import { LoadingDots } from '@components/Loading'
import { values } from 'lodash'

interface ISnsDomainNameTransferForm {
  domain: IDomain
  targetAddress: string | undefined
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
    targetAddress: undefined,
  })
  const [formErrors, setFormErrors] = useState({})

  const [isLoading, setIsLoading] = useState(true)

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
              setIsLoading(false)
              return d
            })
            setDomains((d) => [
              ...d,
              { name: domainStrings, pubkey: domainsForAccount[n].pubkey },
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

  const handleSetForm = ({ value }) => {
    setFormErrors({})
    setForm((f) => ({ ...f, domain: { name: value, pubkey: f.domain.pubkey } }))
  }

  useEffect(() => {
    //
    ;(async () => {
      if (domains.length === 0) await getDomains(assetAccounts)
    })()
  }, [realmInfo])

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
      <Input
        label="Transfer to address"
        value={form.targetAddress}
        type="text"
        onChange={(element) =>
          setForm((f) => ({ ...f, targetAddress: element.target.value }))
        }
        error={formErrors['targetAddress']}
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
            form.domain.name ? form.domain.name + '.sol' : form.domain.name
          }
          placeholder="Please select..."
          onChange={(value) => handleSetForm({ value })}
        >
          {domains.map((domain) => (
            <Select.Option key={domain.pubkey?.toString()} value={domain.name}>
              <div className="text-fgd-1 mb-2">{domain.name}.sol</div>
              <div className="">{domain.pubkey?.toString()}</div>
            </Select.Option>
          ))}
        </Select>
      )}
    </>
  )
}

export default SnsDomainNameTransfer
