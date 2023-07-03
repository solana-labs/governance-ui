import Checkbox from '@components/inputs/Checkbox'
import { useRealmQuery } from '@hooks/queries/realm'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import useFormatTokenAmount from '@hooks/useFormatTokenAmount'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import { useConnection } from '@solana/wallet-adapter-react'
import React, { useState } from 'react'
import { useMemo } from 'react'

const DelegatorCheckbox = ({
  tokenOwnerRecord,
}: {
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>
}) => {
  const [checked, setChecked] = useState(false)

  const formatAmount = useFormatTokenAmount(
    tokenOwnerRecord.account.governingTokenMint
  )

  // TODO just dont bother showing this for plugins i think ?
  const amount = formatAmount?.(
    tokenOwnerRecord.account.governingTokenDepositAmount
  )

  return (
    <div className="flex flex-nowrap gap-2">
      <Checkbox
        checked={checked}
        onChange={() => setChecked((prev) => !prev)}
        label={tokenOwnerRecord.account.governingTokenOwner.toString()}
      />
      {amount !== undefined && <div className="text-xs">({amount})</div>}
    </div>
  )
}

const DelegatorsList = () => {
  const wallet = useWalletOnePointOh()
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result

  const delegatesArray = useTokenOwnerRecordsDelegatedToUser()

  // returns array of community tokenOwnerRecords that connected wallet has been delegated
  const communityTorsDelegatedToUser = useMemo(
    () =>
      realm === undefined
        ? undefined
        : delegatesArray?.filter((x) =>
            x.account.governingTokenMint.equals(realm.account.communityMint)
          ),
    [delegatesArray, realm]
  )

  const councilMintAddr = realm?.account.config.councilMint

  // returns array of council tokenOwnerRecords that connected wallet has been delegated
  const councilTorsDelegatedToUser = useMemo(
    () =>
      councilMintAddr === undefined
        ? undefined
        : delegatesArray?.filter((x) =>
            x.account.governingTokenMint.equals(councilMintAddr)
          ),
    [delegatesArray, councilMintAddr]
  )

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4">Your delegators</h3>
      <div className="space-y-5 flex flex-col">
        {communityTorsDelegatedToUser?.map((x) => (
          <React.Fragment key={x.pubkey.toString()}>
            <DelegatorCheckbox tokenOwnerRecord={x}></DelegatorCheckbox>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default DelegatorsList
