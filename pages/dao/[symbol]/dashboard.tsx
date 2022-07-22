import useRealm from 'hooks/useRealm';
import React from 'react';
import HotWallet from '@components/HotWallet/HotWallet';

const Dashboard = () => {
  const { realm } = useRealm();

  if (!realm) {
    return null;
  }

  return <HotWallet />;
};

export default Dashboard;
