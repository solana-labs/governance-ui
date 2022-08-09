import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { AccountInfo } from '@solana/spl-token'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { precision } from '@utils/formatting'
import { tryParseKey } from '@tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import { AssetAccount } from '@utils/uiTypes/assets'
import { TokenProgramAccount, tryGetTokenAccount } from '@utils/tokens'
import { getAllDomains } from '@bonfida/spl-name-service'
import { performReverseLookup } from '@bonfida/spl-name-service'
import {
  SplTokenTransferForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { debounce } from '@utils/debounce'
import { NewProposalContext } from '../../../new'
import { getTokenTransferSchema } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import {
  getSolTransferInstruction,
  getTransferInstruction,
} from '@utils/instructionTools'

const SnsDomainNameTransfer = ({
  governance,
  index,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const [domains, setDomains] = useState<string[]>([])
  const [form, setForm] = useState<{ amount: number | null }>({
    amount: null,
  })

  const getDomains = async (accounts: AssetAccount[]) => {
    const solAccounts = accounts.filter((acc) => acc.isSol)
    for (let i = 0; i < solAccounts.length; i++) {
      try {
        console.log(
          '🚀 BEFORE ~ file: SnsDomainNameTransfer.tsx ~ line 44 ~ getDomains ~ i'
        )
        const domainsForAccount = await getAllDomains(
          connection,
          solAccounts[i].pubkey
        )
        if (domainsForAccount.length > 0) {
          for (let n = 0; n < domainsForAccount.length; n++) {
            const domainStrings = await performReverseLookup(
              connection,
              domainsForAccount[n]
            )
            setDomains((d) => [...d, domainStrings])
          }
        }
        console.log(
          '🚀 AFTER ~ file: SnsDomainNameTransfer.tsx ~ line 44 ~ getDomains ~ i'
        )
      } catch (e) {
        console.log(
          '🚀 ~ file: SnsDomainNameTransfer.tsx ~ line 44 ~ getDomains ~ e',
          e
        )
      }
    }
  }

  useEffect(() => {
    ;(async () => {
      await getDomains(assetAccounts)
      console.log('getting domains')
    })()
  }, [realmInfo])

  // const governedProgramAccounts = assetAccounts.filter(
  //     (x) => x.type === AccountType.PROGRAM
  // )

  // const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()

  // const solAccounts = governedTokenAccountsWithoutNfts.filter(account => account.isSol)

  return (
    <>
      <GovernedAccountSelect
        label="this is this"
        governedAccounts={assetAccounts}
        onChange={() => {}}
        value={form.amount}
        governance={governance}
      />

      <ul>
        {domains &&
          domains.map((d) => {
            return <li>{d}</li>
          })}
      </ul>
    </>
  )
}

export default SnsDomainNameTransfer
