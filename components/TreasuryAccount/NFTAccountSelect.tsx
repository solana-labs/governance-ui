import Select from '@components/inputs/Select'
import AccountItemNFT from './AccountItemNFT'

const NFTAccountSelect = ({
  onChange,
  nftsGovernedTokenAccounts,
  currentAccount,
}) => {
  return (
    <Select
      noMaxWidth={true}
      className="w-full mb-2 max-w-full"
      onChange={onChange}
      value={currentAccount?.governance?.pubkey.toBase58()}
      componentLabel={
        currentAccount && (
          <AccountItemNFT
            className="m-0 p-0 py-0 px-0 hover:bg-bkg-1"
            onClick={() => null}
            governedAccountTokenAccount={currentAccount}
          ></AccountItemNFT>
        )
      }
    >
      {nftsGovernedTokenAccounts.map((accountWithGovernance) => (
        <Select.Option
          key={accountWithGovernance?.governance?.pubkey.toBase58()}
          value={accountWithGovernance}
        >
          <AccountItemNFT
            onClick={() => null}
            className="m-0 p-0 py-0 px-0 hover:bg-bkg-2"
            governedAccountTokenAccount={accountWithGovernance}
          />
        </Select.Option>
      ))}
    </Select>
  )
}

export default NFTAccountSelect
