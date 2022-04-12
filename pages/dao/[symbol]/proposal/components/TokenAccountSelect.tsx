import { PublicKey } from '@solana/web3.js';
import Select from '@components/inputs/Select';
import { OwnedTokenAccountsInfo } from '@hooks/useGovernanceUnderlyingTokenAccounts';

const TokenAccountSelect = ({
  label,
  value,
  onChange,
  error,
  ownedTokenAccountsInfo,
}: {
  label: string;
  value?: string;
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

    const { mint, uiAmount, mintName, isATA } = ownedTokenAccountsInfo[
      pubkeyString
    ];

    return (
      <div className="flex flex-col">
        <div className="mb-0.5">{pubkeyString}</div>

        <div className="flex flex-col">
          <div className="space-y-0.5 text-xs text-fgd-3">
            Mint Name: {mintName}
          </div>
          <div className="space-y-0.5 text-xs text-fgd-3">
            UI Balance: {uiAmount}
          </div>
          <div className="space-y-0.5 text-xs text-fgd-3 mb-0.5">
            Mint: {mint.toString()}
          </div>
          <div>
            {isATA ? (
              <span className="text-xs text-green">
                Associated Token Account
              </span>
            ) : (
              <span className="text-xs text-red">
                Not an Associated Token Account
              </span>
            )}
          </div>
        </div>
      </div>
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
      {Object.values(ownedTokenAccountsInfo).map(({ pubkey }) => (
        <Select.Option key={pubkey.toBase58()} value={pubkey.toBase58()}>
          {getAccountDisplay(pubkey)}
        </Select.Option>
      ))}
    </Select>
  );
};

export default TokenAccountSelect;
