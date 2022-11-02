import useLocalStorageState from '@hooks/useLocalStorageState';
import { JupiterProvider, SwapMode, useJupiter } from '@jup-ag/react-hook';
import { WRAPPED_SOL_MINT } from '@project-serum/serum/lib/token-instructions';
import { TokenInfo } from '@solana/spl-token-registry';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { getConnectionContext } from '@utils/connection';
import tokenService from '@utils/services/token';
import JSBI from 'jsbi';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Footer from './components/Footer';
import Form from './components/Form';
import FormPairSelector from './components/FormPairSelector';
import Header from './components/Header';
import { AccountsProvider, useAccounts } from './contexts/accounts';
import { fromLamports, toLamports } from './misc/utils';

interface Props {
  mint: PublicKey;
}

export interface IForm {
  fromMint: string;
  toMint: string;
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
    toMint: WRAPPED_SOL_MINT.toString(),
    fromValue: '',
    toValue: '',
  });
  const [errors, setErrors] = useState<
    Record<string, { title: string; message: string }>
  >({});

  useEffect(() => {
    setForm((prev) => ({ ...prev, toMint: props.mint?.toString() }));
  }, [props.mint]);

  const fromTokenInfo = useMemo(() => {
    const tokenInfo = form.fromMint
      ? tokenService.getTokenInfo(form.fromMint)
      : null;
    return tokenInfo;
  }, [form.fromMint, tokenServiceReady]);

  const toTokenInfo = useMemo(() => {
    const tokenInfo = form.toMint
      ? tokenService.getTokenInfo(form.toMint)
      : null;
    return tokenInfo;
  }, [form.toMint, tokenServiceReady]);

  const amountInLamports = useMemo(() => {
    if (!form.fromValue || !fromTokenInfo) return JSBI.BigInt(0);

    return toLamports(Number(form.fromValue), Number(fromTokenInfo.decimals));
  }, [form.fromValue, form.fromMint, fromTokenInfo]);

  const {
    routes: swapRoutes,
    allTokenMints,
    routeMap,
    exchange,
    loading: loadingQuotes,
    refresh,
    lastRefreshTimestamp,
    error,
  } = useJupiter({
    amount: JSBI.BigInt(amountInLamports),
    inputMint: React.useMemo(() => new PublicKey(form.fromMint), [
      form.fromMint,
    ]),
    outputMint: React.useMemo(() => new PublicKey(form.toMint), [form.toMint]),
    // TODO: Show slippage on UI, and support dynamic slippage
    slippage: Number(0.1),
    swapMode: SwapMode.ExactIn,
    // TODO: Support dynamic single tx
    enforceSingleTx: false,
  });

  console.log({
    amount: JSBI.BigInt(amountInLamports),
    inputMint: React.useMemo(() => new PublicKey(form.fromMint), [
      form.fromMint,
    ]),
    outputMint: React.useMemo(() => new PublicKey(form.toMint), [form.toMint]),
    // TODO: Show slippage on UI, and support dynamic slippage
    slippage: Number(0.1),
    swapMode: SwapMode.ExactIn,
    // TODO: Support dynamic single tx
    enforceSingleTx: false,
  });
  const outputRoute = React.useMemo(
    () => swapRoutes?.find((item) => JSBI.GT(item.outAmount, 0)),
    [swapRoutes],
  );
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      toValue: outputRoute?.outAmount
        ? String(
            fromLamports(outputRoute?.outAmount, toTokenInfo?.decimals || 0),
          )
        : '',
    }));
  }, [outputRoute]);

  // TODO: Dedupe the balance
  const balance = useMemo(() => {
    return form.fromMint ? accounts[form.fromMint]?.balance : 0;
  }, [walletPublicKey, accounts, form.fromMint]);

  const isDisabled = useMemo(() => {
    if (
      !form.fromValue ||
      !form.fromMint ||
      !form.toMint ||
      !form.toValue ||
      !outputRoute
    )
      return true;
    if (Number(form.fromValue) > balance) {
      setErrors({
        fromValue: { title: 'Insufficient balance', message: '' },
      });
      return true;
    }

    setErrors({});
    return false;
  }, [form, balance]);

  const onTransaction = async (
    txid: any,
    totalTxs: any,
    txDescription: any,
    awaiter: any,
  ) => {
    console.log({ txid, totalTxs, txDescription, awaiter });
  };

  const onSubmit = useCallback(async () => {
    if (isDisabled || !walletPublicKey || !wallet?.adapter || !outputRoute)
      return;

    const swapResult = await exchange({
      wallet: wallet?.adapter as SignerWalletAdapter,
      routeInfo: outputRoute,
      onTransaction,
    });
  }, [isDisabled, walletPublicKey, outputRoute]);

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
      .filter(Boolean)
      .filter(
        (tokenInfo) => tokenInfo?.address !== props.mint.toString(),
      ) as TokenInfo[]; // Prevent same token to same token
  }, [accounts, tokenServiceReady]);

  return (
    <div className="flex flex-col h-screen max-h-[90vh] md:max-h-[600px] overflow-auto text-black relative">
      {/* Header */}
      <Header />

      {/* Body */}
      <form onSubmit={onSubmit}>
        <Form
          fromTokenInfo={fromTokenInfo}
          toTokenInfo={toTokenInfo}
          form={form}
          errors={errors}
          setForm={setForm}
          onSubmit={onSubmit}
          isDisabled={isDisabled}
          setIsFormPairSelectorOpen={setIsFormPairSelectorOpen}
          outputRoute={outputRoute}
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
  const { wallet } = useWallet();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey, [
    wallet?.adapter.publicKey,
  ]);

  const [currentCluster] = useLocalStorageState('cluster', 'mainnet');
  const { current: connection } = getConnectionContext(currentCluster);

  return (
    <AccountsProvider>
      <JupiterProvider
        connection={connection}
        cluster={'mainnet-beta'}
        routeCacheDuration={20_000}
        wrapUnwrapSOL={false}
        userPublicKey={walletPublicKey || undefined}
      >
        <Jupiter {...props} />
      </JupiterProvider>
    </AccountsProvider>
  );
};

export default JupiterApp;
