import Select from '@components/inputs/Select'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'
import { PublicKey } from '@solana/web3.js'
import { useRealmQuery } from '@hooks/queries/realm'
import { useMemo } from 'react'
import { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import { capitalize } from '@utils/helpers'
import { ProfileName } from './Profile/ProfileName'

const YOUR_WALLET_VALUE = 'Yourself + all delegators'
const JUST_YOUR_WALLET = 'Yourself only'

const SelectPrimaryDelegators = () => {
  const wallet = useWalletOnePointOh()
  const walletId = wallet?.publicKey?.toBase58()
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

  const {
    councilDelegator,
    communityDelegator,
    setCommunityDelegator,
    setCouncilDelegator,
  } = useSelectedDelegatorStore()

  const handleCouncilSelect = (councilWalletPk: string | undefined) => {
    setCouncilDelegator(
      councilWalletPk !== undefined ? new PublicKey(councilWalletPk) : undefined
    )
  }

  const handleCommunitySelect = (communityWalletPk: string | undefined) => {
    setCommunityDelegator(
      communityWalletPk ? new PublicKey(communityWalletPk) : undefined
    )
  }

  return (
    <>
      {((walletId &&
        communityTorsDelegatedToUser &&
        communityTorsDelegatedToUser.length > 0) ||
        communityDelegator) && (
        <PrimaryDelegatorSelect
          selectedDelegator={communityDelegator}
          handleSelect={handleCommunitySelect}
          kind={'community'}
          tors={communityTorsDelegatedToUser ?? []}
        />
      )}
      {((walletId &&
        councilTorsDelegatedToUser &&
        councilTorsDelegatedToUser.length > 0) ||
        councilDelegator) && (
        <PrimaryDelegatorSelect
          selectedDelegator={councilDelegator}
          handleSelect={handleCouncilSelect}
          kind={'council'}
          tors={councilTorsDelegatedToUser ?? []}
        />
      )}
    </>
  )
}

export default SelectPrimaryDelegators

function PrimaryDelegatorSelect({
  selectedDelegator,
  handleSelect,

  kind,
  tors,
}: {
  selectedDelegator: PublicKey | undefined
  handleSelect: (tokenRecordPk: string) => void
  kind: 'community' | 'council'
  tors: ProgramAccount<TokenOwnerRecord>[]
}) {
  const wallet = useWalletOnePointOh()
  const walletPk = wallet?.publicKey ?? undefined
  return (
    <div className="flex space-x-4 items-center mt-4">
      <div className="bg-bkg-1 px-4 py-2 justify-between rounded-md w-full">
        <p className="text-fgd-3 text-xs mb-1">
          Perform {capitalize(kind)} actions as:
        </p>
        <Select
          value={selectedDelegator}
          placeholder="Delegate to use for council votes"
          onChange={handleSelect}
          componentLabel={
            selectedDelegator ? (
              walletPk && selectedDelegator.equals(walletPk) ? (
                JUST_YOUR_WALLET
              ) : (
                <div className="relative">
                  <ProfileName
                    publicKey={selectedDelegator}
                    height="12px"
                    width="100px"
                    dark={true}
                  />
                  <div className="absolute bg-bkg-1 bottom-0 left-0 w-full h-full opacity-0	" />
                </div>
              )
            ) : (
              YOUR_WALLET_VALUE
            )
          }
        >
          <Select.Option key={'reset'} value={undefined}>
            {YOUR_WALLET_VALUE}
          </Select.Option>
          {walletPk ? (
            <Select.Option
              key={walletPk.toBase58()}
              value={walletPk.toBase58()}
            >
              {JUST_YOUR_WALLET}
            </Select.Option>
          ) : (
            <></>
          )}
          {tors.map((delegatedTor) => (
            <Select.Option
              key={delegatedTor.account.governingTokenOwner.toBase58()}
              value={delegatedTor.account.governingTokenOwner.toBase58()}
            >
              <div className="relative">
                <ProfileName
                  publicKey={delegatedTor.account.governingTokenOwner}
                  height="12px"
                  width="100px"
                  dark={true}
                />
                <div className="absolute bg-bkg-1 bottom-0 left-0 w-full h-full opacity-0	" />
              </div>
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  )
}
