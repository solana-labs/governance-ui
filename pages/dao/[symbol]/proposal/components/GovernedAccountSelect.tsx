import Select from '@components/inputs/Select';
import { Governance, GovernanceAccountType } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import {
  getMintAccountLabelInfo,
  getSolAccountLabel,
  getTokenAccountLabelInfo,
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  GovernedTokenAccount,
} from '@utils/tokens';
import React, { useEffect, useState } from 'react';
import { getProgramName } from '@components/instructions/programs/names';
import ImageTextSelection, {
  ImageTextElement,
} from '@components/ImageTextSelection';
import { FireIcon } from '@heroicons/react/outline';
import useHotWallet from '@hooks/useHotWallet';

const treasuryImage = '/img/treasury.svg';
const mintImage = '/img/mint.svg';
const programImage = '/img/program.svg';
const governanceImage = '/img/governance.svg';

// Create governance groups to avoid duplicated buttons
const governanceAccountsConfiguration: ({
  types: GovernanceAccountType[];
} & ImageTextElement<number>)[] = [
  {
    id: 1,
    name: 'Treasury',
    image: treasuryImage,
    types: [
      GovernanceAccountType.TokenGovernanceV1,
      GovernanceAccountType.TokenGovernanceV2,
    ],
  },
  {
    id: 2,
    name: 'Mint',
    image: mintImage,
    types: [
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ],
  },
  {
    id: 3,
    name: 'Program',
    image: programImage,
    types: [
      GovernanceAccountType.ProgramGovernanceV1,
      GovernanceAccountType.ProgramGovernanceV2,
    ],
  },
  {
    id: 4,
    name: 'Governance',
    image: governanceImage,
    types: [
      GovernanceAccountType.GovernanceV1,
      GovernanceAccountType.GovernanceV2,
    ],
  },
  {
    id: 5,
    name: 'Others',
    types: [
      GovernanceAccountType.RealmV1,
      GovernanceAccountType.TokenOwnerRecordV1,
      GovernanceAccountType.ProposalV1,
      GovernanceAccountType.SignatoryRecordV1,
      GovernanceAccountType.VoteRecordV1,
      GovernanceAccountType.ProposalInstructionV1,
      GovernanceAccountType.RealmConfig,
      GovernanceAccountType.VoteRecordV2,
      GovernanceAccountType.ProposalTransactionV2,
      GovernanceAccountType.ProposalV2,
      GovernanceAccountType.ProgramMetadata,
      GovernanceAccountType.RealmV2,
      GovernanceAccountType.TokenOwnerRecordV2,
      GovernanceAccountType.SignatoryRecordV2,
    ],
  },
];

function getMintAccountLabelComponent({
  account,
  tokenName,
  mintAccountName,
  amount,
  imgUrl,
}) {
  return (
    <div className="flex items-center">
      <div className="flex">
        <img src={mintImage} className="max-w-8 h-8" />
      </div>

      <div className="mt-1 ml-2 flex flex-col">
        <span className="mb-0.5">{mintAccountName}</span>

        <div className="space-y-0.5 text-xs text-fgd-3 flex flex-col">
          {account && <span className="mb-0.5">{account}</span>}

          {tokenName && (
            <div className="flex items-center">
              Token: <img className="flex-shrink-0 h-4 w-4" src={imgUrl} />
              {tokenName}
            </div>
          )}
          <span>Supply: {amount}</span>
        </div>
      </div>
    </div>
  );
}

function getTreasuryLabelComponent({
  tokenAccount,
  tokenAccountName,
  tokenName,
  amount,
}) {
  return (
    <div className="flex items-center">
      <div className="flex">
        <img src={treasuryImage} className="max-w-8 h-8" />
      </div>

      <div className="mt-1 ml-2 flex flex-col">
        {tokenAccountName && <div className="mb-0.5">{tokenAccountName}</div>}

        <div className="mb-0.5 text-fgd-3 text-xs">{tokenAccount}</div>

        <div className="flex space-x-3 text-xs text-fgd-3">
          {tokenName && (
            <div className="flex items-center">
              Token:
              <span className="ml-1 text-fgd-1">{tokenName}</span>
            </div>
          )}
          <div>
            Bal:<span className="ml-1 text-fgd-1">{amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGovernanceAccountLabel(val: ProgramAccount<Governance>) {
  const name = val
    ? getProgramName(val.account.governedAccount)
    : 'Unknown Program';

  return (
    <div className="flex items-center">
      <div className="flex">
        <img src={governanceImage} className="max-w-8 h-8" />
      </div>

      <div className="mt-1 ml-2 flex flex-col">
        <span className="">{name}</span>

        <span className="text-fgd-3 text-xs">
          {val?.account?.governedAccount?.toBase58()}
        </span>
      </div>
    </div>
  );
}

function getProgramAccountLabel(val: ProgramAccount<Governance>) {
  const name = val
    ? getProgramName(val.account.governedAccount)
    : 'Unknown Program';

  return (
    <div className="flex items-center">
      <div className="flex">
        <img src={programImage} className="max-w-8 h-8" />
      </div>

      <div className="mt-1 ml-2 flex flex-col">
        <span className="">{name}</span>

        <span className="text-fgd-3 text-xs">
          {val?.account?.governedAccount?.toBase58()}
        </span>
      </div>
    </div>
  );
}

function getLabel<
  T extends
    | GovernedMultiTypeAccount
    | GovernedTokenAccount
    | GovernedMintInfoAccount
>(value?: T) {
  if (!value) {
    return null;
  }

  if (!value.governance) {
    return null;
  }

  const accountType = value.governance.account.accountType;

  switch (accountType) {
    case GovernanceAccountType.MintGovernanceV1:
    case GovernanceAccountType.MintGovernanceV2: {
      const governedAccount = value as GovernedMintInfoAccount;

      return getMintAccountLabelComponent(
        getMintAccountLabelInfo(governedAccount),
      );
    }

    case GovernanceAccountType.TokenGovernanceV1:
    case GovernanceAccountType.TokenGovernanceV2: {
      const governedAccount = value as GovernedTokenAccount;

      return getTreasuryLabelComponent(
        governedAccount.isSol
          ? getSolAccountLabel(governedAccount)
          : getTokenAccountLabelInfo(governedAccount),
      );
    }

    case GovernanceAccountType.ProgramGovernanceV1:
    case GovernanceAccountType.ProgramGovernanceV2:
      return getProgramAccountLabel(value.governance);

    case GovernanceAccountType.GovernanceV1:
      return getGovernanceAccountLabel(value.governance);

    default:
      return value.governance.account.governedAccount.toBase58();
  }
}

// Look at the types of the selectable governed account
function calculateAvailableGovernanceTypes<
  T extends
    | GovernedMultiTypeAccount
    | GovernedTokenAccount
    | GovernedMintInfoAccount
>(governedAccounts: T[]) {
  // Get all governance types used by a selectable governedAccount
  const governanceTypes = Array.from(
    governedAccounts.reduce((types, governedAccount) => {
      if (!governedAccount.governance) return types;

      types.add(governedAccount.governance.account.accountType);

      return types;
    }, new Set()),
  ) as GovernanceAccountType[];

  const filteredGovernanceAccountType = governanceAccountsConfiguration.filter(
    (config) => config.types.some((type) => governanceTypes.includes(type)),
  );

  // Format the data so it fit ImageTextSelection format
  return [
    {
      id: null,
      name: 'All',
    },
    ...filteredGovernanceAccountType.map(({ types: _, ...other }) => ({
      ...other,
    })),
  ];
}

function sortFilteredGovernedAccounts<
  T extends
    | GovernedMultiTypeAccount
    | GovernedTokenAccount
    | GovernedMintInfoAccount
>(filteredGovernedAccounts: T[]): T[] {
  return filteredGovernedAccounts.sort((governedAcc1, governedAcc2) => {
    if (!governedAcc1.governance || !governedAcc2.governance) {
      return 1;
    }

    const index1 = governanceAccountsConfiguration.findIndex((config) =>
      config.types.includes(governedAcc1.governance!.account.accountType),
    );
    const index2 = governanceAccountsConfiguration.findIndex((config) =>
      config.types.includes(governedAcc2.governance!.account.accountType),
    );

    return index1 - index2;
  });
}

export default function GovernedAccountSelect<
  T extends
    | GovernedMultiTypeAccount
    | GovernedTokenAccount
    | GovernedMintInfoAccount
>({
  onChange,
  value,
  error,
  governedAccounts = [],
  shouldBeGoverned,
  governance,
  label,
  noMaxWidth,
}: {
  onChange: (selected: T | null) => void;
  value?: T;
  error?: string;
  governedAccounts: T[];
  shouldBeGoverned?: boolean;
  governance?: ProgramAccount<Governance> | null | undefined;
  label?: string;
  noMaxWidth?: boolean;
}) {
  const { hotWalletAccount } = useHotWallet();

  const [
    selectedGovernanceAccountConfigurationId,
    setSelectedGovernanceAccountConfigurationId,
  ] = useState<GovernanceAccountType | null>(null);

  const availableGovernanceTypes = calculateAvailableGovernanceTypes<T>(
    governedAccounts,
  );

  const filteredGovernedAccounts = governedAccounts.filter(
    (governedAccount) => {
      if (shouldBeGoverned) {
        return false;
      }

      if (
        governedAccount?.governance?.pubkey.toBase58() ===
        governance?.pubkey?.toBase58()
      ) {
        return false;
      }

      // Filter the governedAccount that do not match the selected governance account type
      if (!selectedGovernanceAccountConfigurationId) {
        return true;
      }

      if (!governedAccount.governance) {
        return true;
      }

      const config = governanceAccountsConfiguration.find(
        (config) => config.id === selectedGovernanceAccountConfigurationId,
      );

      if (!config) {
        return true;
      }

      return config.types.includes(
        governedAccount.governance.account.accountType,
      );
    },
  );

  const sortedFilteredGovernedAccounts = sortFilteredGovernedAccounts<T>(
    filteredGovernedAccounts,
  );

  // If the user select a new governance filter and the selected governance doesn't match the type
  // unselect it
  useEffect(() => {
    // If nothing is selected, select the first available governance
    if (!value && sortedFilteredGovernedAccounts.length) {
      onChange(sortedFilteredGovernedAccounts[0]);
      return;
    }

    if (
      !selectedGovernanceAccountConfigurationId ||
      !value ||
      !value.governance
    ) {
      return;
    }

    const config = governanceAccountsConfiguration.find(
      (config) => config.id === selectedGovernanceAccountConfigurationId,
    );

    if (!config) {
      return;
    }

    if (config.types.includes(value.governance.account.accountType)) {
      return;
    }

    onChange(
      sortedFilteredGovernedAccounts.length
        ? sortedFilteredGovernedAccounts[0]
        : null,
    );
  }, [value, selectedGovernanceAccountConfigurationId]);

  const loadHotWallet = () => {
    // Select 'All'
    setSelectedGovernanceAccountConfigurationId(null);

    if (!hotWalletAccount) {
      onChange(null);
      return;
    }

    // Select the hot wallet
    const hotWallet =
      governedAccounts.find((account) =>
        account.governance?.pubkey.equals(hotWalletAccount.publicKey),
      ) ?? null;

    onChange(hotWallet);
  };

  return (
    <div className="flex flex-col">
      <span className="mb-2">{label}</span>

      <div className="flex flex-col bg-bkg-1 w-full max-w-lg border border-fgd-3 default-transition rounded-md h-auto">
        <div className="flex w-full grow">
          <ImageTextSelection
            className="pl-4 pr-4 shrink grow w-full"
            selected={selectedGovernanceAccountConfigurationId}
            imageTextElements={availableGovernanceTypes}
            onClick={setSelectedGovernanceAccountConfigurationId}
          />

          {hotWalletAccount ? (
            <div className="flex w-12 shrink-0 border-l border-b border-fgd-3 justify-center items-center">
              <FireIcon
                className="w-6 text-fgd-3 hover:text-white pointer"
                onClick={() => loadHotWallet()}
              />
            </div>
          ) : null}
        </div>

        <Select
          className="p-2 w-full text-sm"
          onChange={onChange}
          componentLabel={getLabel<T>(value)}
          placeholder="Please select..."
          value={value?.governance?.account.governedAccount.toBase58()}
          error={error}
          noMaxWidth={noMaxWidth}
          useDefaultStyle={false}
        >
          {sortedFilteredGovernedAccounts.map((acc) => {
            return (
              <Select.Option
                key={acc.governance?.account.governedAccount.toBase58()}
                value={acc}
              >
                {getLabel<T>(acc)}
              </Select.Option>
            );
          })}
        </Select>
      </div>
    </div>
  );
}
