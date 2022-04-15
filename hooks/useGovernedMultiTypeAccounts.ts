import { GovernanceAccountType } from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';
import { GovernedMultiTypeAccount, GovernedTokenAccount } from '@utils/tokens';
import { useCallback, useEffect, useState } from 'react';
import useGovernanceAssets from './useGovernanceAssets';

export default function useGovernedMultiTypeAccounts() {
  const {
    getMintWithGovernances,
    governancesArray,
    governedTokenAccounts,
  } = useGovernanceAssets();

  const [governedMultiTypeAccounts, setGovernedMultiTypeAccounts] = useState<
    GovernedMultiTypeAccount[]
  >([]);

  const getGovernedMultiTypeAccounts = useCallback(async (): Promise<
    GovernedMultiTypeAccount[]
  > => {
    const mintWithGovernances = await getMintWithGovernances();

    return governancesArray.map((gov) => {
      const governedTokenAccount = governedTokenAccounts.find((tokenAcc) =>
        tokenAcc.governance?.pubkey.equals(gov.pubkey),
      );
      if (governedTokenAccount) {
        return governedTokenAccount as GovernedMultiTypeAccount;
      }

      const mintGovernance = mintWithGovernances.find((mint) =>
        mint.governance?.pubkey.equals(gov.pubkey),
      );
      if (mintGovernance) {
        return mintGovernance as GovernedMultiTypeAccount;
      }

      return {
        governance: gov,
      };
    });

    // FIXME: `governedTokenAccounts` & `governancesArray` should have stable references.
    // These should respect immutability principles & only change if their content changes.
    // Working around this by stringifying both objects & using the resulting string
    // representation as hook dependency, so the hook only runs when either of these changes,
    // but with a performance tax unfortunately
  }, [JSON.stringify(governedTokenAccounts), JSON.stringify(governancesArray)]);

  useEffect(() => {
    // Ignore obsolete results created by race calls
    let abort = false;

    (async () => {
      const governedMultiTypeAccounts = await getGovernedMultiTypeAccounts();

      if (abort) return;

      setGovernedMultiTypeAccounts(governedMultiTypeAccounts);
    })();

    return () => {
      abort = true;
    };
  }, [getGovernedMultiTypeAccounts]);

  const getGovernedAccountPublicKey = useCallback((
    governedAccount: GovernedMultiTypeAccount | undefined,

    // can force the fact to use the owner for SOL Token Governance
    forceToUseSolTokenGovernanceOwner?: boolean,
  ): PublicKey | undefined => {
    if (!governedAccount || !governedAccount.governance) {
      return;
    }

    const accountType = governedAccount.governance.account.accountType;

    if (
      accountType === GovernanceAccountType.TokenGovernanceV1 ||
      accountType === GovernanceAccountType.TokenGovernanceV2
    ) {
      const programGovernedAccount = governedAccount as GovernedTokenAccount;

      if (programGovernedAccount.isSol && !forceToUseSolTokenGovernanceOwner) {
        return programGovernedAccount.transferAddress ?? undefined;
      }
    }

    return governedAccount.governance.pubkey;
  }, []);

  return {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  };
}
