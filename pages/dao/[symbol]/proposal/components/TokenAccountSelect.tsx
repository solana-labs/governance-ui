import { PublicKey } from '@solana/web3.js';
import Select from '@components/inputs/Select';
import SelectOptionDetailed, { Flag } from '@components/SelectOptionDetailed';
import { OwnedTokenAccountsInfo } from '@hooks/useGovernanceUnderlyingTokenAccounts';

const TokenAccountSelect = ({
  label,
  value,
  filterByMint,
  onChange,
  error,
  ownedTokenAccountsInfo,
}: {
  label: string;
  value?: string;
  filterByMint?: PublicKey[];
  onChange: (value: string) => void;
  error: string;
  ownedTokenAccountsInfo?: OwnedTokenAccountsInfo;
}) => {
  if (!ownedTokenAccountsInfo) {
    return null;
  }

  const getAccountDisplay = (pubkey?: PublicKey) => {
    if (!pubkey) return null;

    const pubkeyString = pubkey.toString();

    if (!ownedTokenAccountsInfo[pubkeyString]) {
      return null;
    }

    const { mint, uiAmount, mintName, isATA } = ownedTokenAccountsInfo[
      pubkeyString
    ];

    const details = [
      {
        label: 'Mint Name',
        text: mintName,
      },
      {
        label: 'UI Balance',
        text: uiAmount.toString(),
      },
      {
        label: 'Mint',
        text: mint.toBase58(),
      },
    ];

    const diffValue = {
      label: 'ATA',
      flag: isATA ? Flag.OK : Flag.Danger,
      text: `${isATA ? 'Not an' : ''} Associated Token Account`,
    };

    return (
      <SelectOptionDetailed
        title={pubkeyString}
        details={details}
        diffValue={diffValue}
      />
    );
  };

  return (
    <Select
      label={label}
      value={value}
      componentLabel={getAccountDisplay(
        value ? new PublicKey(value) : undefined,
      )}
      placeholder="Please select..."
      onChange={onChange}
      error={error}
    >
      {Object.values(ownedTokenAccountsInfo)
        .filter(
          (ownedTokenAccountInfo) =>
            !filterByMint ||
            filterByMint.some((mint) =>
              mint.equals(ownedTokenAccountInfo.mint),
            ),
        )
        .map(({ pubkey }) => (
          <Select.Option key={pubkey.toBase58()} value={pubkey.toBase58()}>
            {getAccountDisplay(pubkey)}
          </Select.Option>
        ))}
    </Select>
  );
};

export default TokenAccountSelect;
