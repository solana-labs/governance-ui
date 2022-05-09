import AccountsItems from './AccountsItems';
import HoldTokensTotalPrice from './HoldTokensTotalPrice';
import React from 'react';
import useGovernanceAssets from '@hooks/useGovernanceAssets';

const AccountsCompactWrapper = () => {
  const { governedTokenAccounts } = useGovernanceAssets();

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <>
        <div className="flex items-center justify-between pb-4">
          <h3 className="mb-0">Treasury</h3>
        </div>
        <HoldTokensTotalPrice />
        <div style={{ maxHeight: '350px' }} className="overflow-y-auto">
          {governedTokenAccounts.length && <AccountsItems />}
        </div>
      </>
    </div>
  );
};

export default AccountsCompactWrapper;
