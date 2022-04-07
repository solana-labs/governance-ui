import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import useRealm from './useRealm';

const RealmsHotWallet = {
  UXDProtocol: {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('7M6TSEkRiXiYmpRCcCDSdJGTGxAPem2HBqjW4gLQ2KoE'),
  },

  'Kek World': {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('AuQHcJZhTd1dnXRrM78RomFiCvW6a9CqxxJ94Fp9h8b'),
  },

  // Devnet realm
  'kek world': {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('AWuSjBCEMVtk8fX2HAwtuMjoHLmLM72PJxi1dZdKHPFu'),
  },

  // <---- declare your realm hot wallet here
};

export type HotWalletAccount = {
  name: string;
  publicKey: PublicKey;
};

const useHotWallet = () => {
  const { realm } = useRealm();

  const [hotWalletAccount, setHotWalletAccount] = useState<{
    name: string;
    publicKey: PublicKey;
  } | null>(null);

  useEffect(() => {
    if (!realm) return;

    setHotWalletAccount(RealmsHotWallet[realm.account.name] ?? null);
  }, [realm]);

  return {
    hotWalletAccount,
  };
};

export default useHotWallet;
