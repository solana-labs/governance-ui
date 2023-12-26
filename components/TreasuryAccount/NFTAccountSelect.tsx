import Select from '@components/inputs/Select'
import AccountItemNFT from './AccountItemNFT'
import { PublicKey } from '@solana/web3.js'
import { useRealmGovernancesQuery } from '@hooks/queries/governance'

/** Governance selector with NFT counts */
const NFTAccountSelect = ({
  onChange,
  selectedGovernance,
}: {
  onChange: (x: PublicKey) => void
  selectedGovernance: PublicKey
}) => {
  const { data: governances } = useRealmGovernancesQuery()

  return (
    <Select
      noMaxWidth={true}
      className="w-full mb-2 max-w-full"
      onChange={(x: string) => onChange(new PublicKey(x))}
      value={selectedGovernance.toString()}
      componentLabel={
        <AccountItemNFT
          className="m-0 p-0 py-0 px-0 hover:bg-bkg-1"
          governance={selectedGovernance}
        />
      }
    >
      {governances?.map((governance) => (
        <Select.Option
          key={governance.pubkey.toString()}
          value={governance.pubkey.toString()}
        >
          <AccountItemNFT
            className="m-0 p-0 py-0 px-0 hover:bg-bkg-2"
            governance={governance.pubkey}
          />
        </Select.Option>
      ))}
    </Select>
  )
}

export default NFTAccountSelect
