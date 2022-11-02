import Tooltip from '@components/Tooltip';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from '@heroicons/react/solid';
import { RouteInfo } from '@jup-ag/react-hook';
import { WRAPPED_SOL_MINT } from '@project-serum/serum/lib/token-instructions';
import { TokenInfo } from '@solana/spl-token-registry';
import { useWallet } from '@solana/wallet-adapter-react';

import { PublicKey } from '@solana/web3.js';
import JSBI from 'jsbi';
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { IForm } from '..';

import { useAccounts } from '../contexts/accounts';

import { MINIMUM_SOL_BALANCE } from '../misc/constants';
import { toLamports } from '../misc/utils';
import { useWalletSelector } from '@hub/hooks/useWalletSelector';

import CoinBalance from './Coinbalance';
import ExchangeRate, { IRateParams } from './ExchangeRate';
import FormError from './FormError';
import JupButton from './JupButton';

import OpenJupiterButton from './OpenJupiterButton';
import SwapRoute from './SwapRoute';
import TokenIcon from './TokenIcon';

import Collapse from '.';

const Form: React.FC<{
  fromTokenInfo?: TokenInfo | null;
  toTokenInfo?: TokenInfo | null;
  form: IForm;
  errors: Record<string, { title: string; message: string }>;
  setForm: Dispatch<SetStateAction<IForm>>;
  onSubmit: () => void;
  isDisabled: boolean;
  setIsFormPairSelectorOpen: Dispatch<SetStateAction<boolean>>;
  outputRoute?: RouteInfo;
}> = ({
  fromTokenInfo,
  toTokenInfo,
  form,
  errors,
  setForm,
  onSubmit,
  isDisabled,
  setIsFormPairSelectorOpen,
  outputRoute,
}) => {
  const { connect, wallet } = useWallet();
  const { getAdapter } = useWalletSelector();
  const { accounts } = useAccounts();

  const onConnectWallet = () => {
    if (wallet) connect();
    else {
      getAdapter();
    }
  };

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);

  const jupiterDirectLink = useMemo(() => {
    if (fromTokenInfo && toTokenInfo) {
      const inAmount = form.fromValue ? form.fromValue : '1';
      return `https://jup.ag/swap/${fromTokenInfo.address}-${toTokenInfo.address}?inAmount=${inAmount}`;
    }
    return 'https://jup.ag';
  }, [fromTokenInfo, toTokenInfo, form.fromValue]);

  const onChangeFromValue = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const isInvalid = Number.isNaN(Number(e.target.value));
    if (isInvalid) return;

    setForm((form) => ({ ...form, fromValue: e.target.value }));
  };

  const balance = useMemo(() => {
    return fromTokenInfo ? accounts[fromTokenInfo.address]?.balance : 0;
  }, [accounts, fromTokenInfo]);

  const onClickMax = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      if (fromTokenInfo?.address === WRAPPED_SOL_MINT.toBase58()) {
        setForm((prev) => ({
          ...prev,
          fromValue: String(
            balance > MINIMUM_SOL_BALANCE ? balance - MINIMUM_SOL_BALANCE : 0,
          ),
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          fromValue: String(balance),
        }));
      }
    },
    [balance, fromTokenInfo],
  );

  const [shouldDisplay, setShouldDisplay] = useState(false);
  const onToggleExpand = () => {
    if (shouldDisplay) {
      setShouldDisplay(false);
    } else {
      setShouldDisplay(true);
    }
  };

  return (
    <div className="h-full mt-4 mx-5 flex flex-col items-center justify-center">
      <div className="w-full rounded-xl bg-white/75 dark:bg-white dark:bg-opacity-5 shadow-lg flex flex-col p-4 pb-2">
        <div className="flex-col">
          <div className="flex justify-between items-end pb-3 text-xs text-gray-400">
            <div className="text-sm font-semibold text-black dark:text-white">
              <span>You pay</span>
            </div>

            {fromTokenInfo?.address ? (
              <div
                className="flex text-black dark:text-white cursor-pointer space-x-1 items-end"
                onClick={onClickMax}
              >
                <span>Balance:</span>
                <CoinBalance mintAddress={fromTokenInfo.address} />
              </div>
            ) : null}
          </div>

          <div className="border-b border-transparent">
            <div className="px-3 border-transparent rounded-xl bg-[#EBEFF1] dark:bg-black/25">
              <div>
                <div className="flex flex-col dark:text-white">
                  <div className="py-3 flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-2 rounded-lg flex items-center hover:bg-gray-100 dark:hover:bg-white/10"
                      onClick={() => setIsFormPairSelectorOpen(true)}
                    >
                      <TokenIcon tokenInfo={fromTokenInfo} />
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        {fromTokenInfo?.symbol}
                      </div>
                    </button>

                    <div className="text-right">
                      <input
                        placeholder="0.00"
                        className="h-full w-full bg-transparent disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-lg undefined"
                        value={form.fromValue}
                        onChange={(e) => onChangeFromValue(e)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-center items-center my-4">
            <div className="rounded-full border border-black/50 p-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.82439 12.8841H5.20898V1.03866C5.20898 0.741169 5.45015 0.5 5.74764 0.5H6.2863H6.28576C6.42848 0.5 6.56575 0.556873 6.66692 0.657494C6.76754 0.758663 6.82441 0.895374 6.82441 1.03866V12.8846L6.82439 12.8841Z"
                  fill="rgba(0,0,0,0.5)"
                />
                <path
                  d="M6.04088 14.4998C5.8473 14.5048 5.66082 14.4266 5.52958 14.2844L0.441037 8.60366C0.250727 8.32476 0.29722 7.94743 0.549314 7.72267C0.801418 7.49736 1.18148 7.49463 1.43741 7.71556L6.01399 12.8308L10.5638 7.71556C10.8198 7.49464 11.1998 7.49737 11.4519 7.72267C11.704 7.94743 11.7505 8.32476 11.5602 8.60366L6.52585 14.2844H6.5253C6.39406 14.4266 6.20758 14.5048 6.014 14.4998H6.04088Z"
                  fill="rgba(0,0,0,0.5)"
                />
              </svg>
            </div>
          </div>

          <div className="flex justify-between pb-0 text-xs text-gray-400">
            <div className="text-sm font-semibold text-black dark:text-white">
              You receive
            </div>
            {toTokenInfo ? (
              <div className="flex text-black space-x-1 items-end">
                <span>Balance:</span>
                <CoinBalance mintAddress={toTokenInfo.address} />
              </div>
            ) : null}
          </div>

          <div className="pt-3 flex justify-between items-center">
            <button
              type="button"
              className="py-2 px-2 rounded-lg flex items-center cursor-default"
            >
              <TokenIcon tokenInfo={toTokenInfo} />

              <div className="ml-4 mr-2 font-semibold" translate="no">
                {toTokenInfo?.symbol}
              </div>
            </button>

            <div className="text-right">
              {Number(form.toValue) > 0 ? (
                <input
                  placeholder="0.00"
                  className="h-full w-full bg-transparent disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-lg undefined"
                  value={form.toValue}
                  disabled
                />
              ) : null}
            </div>
          </div>

          {outputRoute && toTokenInfo ? (
            <Tooltip
              content={
                <div>
                  Jupiter's route discovery determines this is the best priced
                  route.
                </div>
              }
            >
              <div
                className="flex flex-col w-full items-center cursor-pointer mt-4"
                onClick={onToggleExpand}
              >
                <div className="flex flex-row justify-center text-black-75 dark:text-white-50 font-semibold">
                  <span className="text-xs text-black/50">
                    Best route selected
                  </span>

                  <div className="h-4 w-4 ml-2 flex">
                    <InformationCircleIcon className="text-black/50" />
                  </div>
                </div>

                <div className="h-4 w-4 -mb-2">
                  {shouldDisplay ? (
                    <ChevronUpIcon className="text-black/50" />
                  ) : (
                    <ChevronDownIcon className="text-black/50" />
                  )}
                </div>
              </div>
            </Tooltip>
          ) : null}

          <Collapse
            className="mt-2"
            height={0}
            maxHeight={'auto'}
            expanded={shouldDisplay}
          >
            {outputRoute && toTokenInfo ? (
              <SwapRoute
                route={outputRoute}
                toValue={form.toValue}
                toTokenInfo={toTokenInfo}
              />
            ) : null}
          </Collapse>
        </div>
      </div>

      <FormError errors={errors} />

      {!walletPublicKey ? (
        <JupButton
          size="lg"
          className="w-full mt-4"
          type="button"
          onClick={onConnectWallet}
        >
          Connect Wallet
        </JupButton>
      ) : (
        <JupButton
          size="lg"
          className="w-full mt-4"
          type="button"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          Swap
        </JupButton>
      )}

      <OpenJupiterButton href={jupiterDirectLink} />
    </div>
  );
};

export default Form;
