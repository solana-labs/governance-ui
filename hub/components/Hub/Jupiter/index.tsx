import { TokenInfo } from '@solana/spl-token-registry';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import tokenService from '@utils/services/token';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Footer from './components/Footer';
import Form from './components/Form';
import FormPairSelector from './components/FormPairSelector';
import Header from './components/Header';
import { AccountsProvider, useAccounts } from './contexts/accounts';

interface Props {
  mint?: PublicKey;
}

export interface IForm {
  fromMint: string;
  toMint?: string;
  fromValue: string;
  toValue: string;
}

const Jupiter = (props: Props) => {
  const { wallet } = useWallet();
  const { accounts, tokenServiceReady } = useAccounts();

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);

  const [form, setForm] = useState<IForm>({
    fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: undefined,
    fromValue: '',
    toValue: '',
  });
  const [errors, setErrors] = useState<
    Record<string, { title: string; message: string }>
  >({});

  useEffect(() => {
    setForm((prev) => ({ ...prev, toMint: props.mint?.toString() }));
  }, [props.mint]);

  // TODO: Dedupe the balance
  const balance = useMemo(() => {
    return form.fromMint ? accounts[form.fromMint]?.balance : 0;
  }, [walletPublicKey, accounts, form.fromMint]);

  const isDisabled = useMemo(() => {
    if (!form.fromValue || !form.fromMint || !form.toMint) return true;
    if (Number(form.fromValue) > balance) {
      setErrors({
        fromValue: { title: 'Insufficient balance', message: '' },
      });
      return true;
    }

    setErrors({});
    return false;
  }, [form, balance]);

  const onSubmit = useCallback(() => {
    if (isDisabled) return;

    console.log('submitting');
  }, [isDisabled]);

  const [isFormPairSelectorOpen, setIsFormPairSelectorOpen] = useState(false);
  const onSelectFromMint = useCallback((tokenInfo: TokenInfo) => {
    setForm((prev) => ({
      ...prev,
      fromMint: tokenInfo.address,
      fromValue: '',
    }));
    setIsFormPairSelectorOpen(false);
  }, []);
  const availableMints: TokenInfo[] = useMemo(() => {
    if (Object.keys(accounts).length === 0 || !tokenServiceReady) return [];

    return Object.keys(accounts)
      .map((mintAddress) => tokenService.getTokenInfo(mintAddress))
      .filter(Boolean) as TokenInfo[];
  }, [accounts, tokenServiceReady]);

  return (
    <div className="flex flex-col h-screen max-h-[90vh] md:max-h-[600px] overflow-auto text-black relative">
      {/* Header */}
      <Header />

      {/* Body */}
      <form onSubmit={onSubmit}>
        <Form
          fromMint={form.fromMint}
          toMint={form.toMint}
          form={form}
          errors={errors}
          setForm={setForm}
          onSubmit={onSubmit}
          isDisabled={isDisabled}
          setIsFormPairSelectorOpen={setIsFormPairSelectorOpen}
        />
      </form>

      {isFormPairSelectorOpen ? (
        <div className="absolute h-full w-full flex justify-center items-center bg-black/50 rounded-lg overflow-hidden">
          <FormPairSelector
            onSubmit={onSelectFromMint}
            tokenInfos={availableMints}
            onClose={() => setIsFormPairSelectorOpen(false)}
          />
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-auto rounded-b-xl">
        <Footer />
      </div>
    </div>
  );
};

const JupiterApp = (props: Props) => {
  return (
    <AccountsProvider>
      <Jupiter {...props} />
    </AccountsProvider>
  );
};

export default JupiterApp;
