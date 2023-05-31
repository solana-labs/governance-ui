import CheckmarkIcon from '@carbon/icons-react/lib/Checkmark';
import ErrorIcon from '@carbon/icons-react/lib/Error';
import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled';
import {
  VSR_PLUGIN_PKS,
  NFT_PLUGINS_PKS,
  GATEWAY_PLUGINS_PKS,
  SWITCHBOARD_PLUGINS_PKS,
  PYTH_PLUGINS_PKS,
} from '@constants/plugins';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';

import { Input } from '@hub/components/controls/Input';
import { useCluster } from '@hub/hooks/useCluster';
import { useWallet } from '@hub/hooks/useWallet';
import { DEFAULT_NFT_VOTER_PLUGIN } from '@tools/constants';

const RECOGNIZED_PLUGINS = new Set([
  ...VSR_PLUGIN_PKS,
  ...NFT_PLUGINS_PKS,
  ...GATEWAY_PLUGINS_PKS,
  ...SWITCHBOARD_PLUGINS_PKS,
  ...PYTH_PLUGINS_PKS,
]);

interface Props {
  className?: string;
  value: PublicKey | null;
  onChange?(value: PublicKey | null): void;
}

export function AddressValidator(props: Props) {
  const [address, setAddress] = useState(props.value?.toBase58() || '');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isRecognized, setIsRecognized] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [showMessages, setShowMessages] = useState(false);
  const [cluster] = useCluster();
  const wallet = useWallet();

  useEffect(() => {
    const text = props.value?.toBase58() || '';

    if (address !== text) {
      setAddress(text);
    }
  }, [props.value]);

  return (
    <div className={props.className}>
      <Input
        className="w-full"
        placeholder={`e.g. ${DEFAULT_NFT_VOTER_PLUGIN}`}
        value={address}
        onBlur={async (e) => {
          const text = e.currentTarget.value;
          let key: PublicKey | null = null;

          try {
            setIsValidAddress(true);
            key = new PublicKey(text);
            props.onChange?.(key);
          } catch {
            setIsValidAddress(false);
            props.onChange?.(null);
            return;
          }

          if (RECOGNIZED_PLUGINS.has(text)) {
            setIsRecognized(true);
          } else {
            setIsRecognized(false);
          }

          try {
            setIsVerified(false);
            const publicKey = await wallet.connect();
            const provider = new AnchorProvider(
              cluster.connection,
              {
                publicKey,
                signAllTransactions: wallet.signAllTransactions,
                signTransaction: wallet.signTransaction,
              },
              AnchorProvider.defaultOptions(),
            );
            const program = await Program.at(key, provider);
            if (program) {
              setIsVerified(true);
            } else {
              setIsVerified(false);
            }
          } catch {
            setIsVerified(false);
          }

          setShowMessages(true);
        }}
        onChange={(e) => {
          const text = e.currentTarget.value;
          setIsRecognized(false);
          setIsVerified(false);
          setShowMessages(false);

          try {
            new PublicKey(text);
            setIsValidAddress(true);
          } catch {
            setIsValidAddress(false);
          }

          setAddress(text);
        }}
        onFocus={(e) => {
          if (e.currentTarget.value !== props.value?.toBase58()) {
            setShowMessages(false);
          }
        }}
      />
      {showMessages &&
        address &&
        isValidAddress &&
        (isRecognized || isVerified) && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-6">
              {isRecognized && (
                <div className="flex items-center space-x-1 text-emerald-400">
                  <CheckmarkIcon className="h-4 flex-shrink-0 fill-current w-4" />
                  <div className="text-xs">
                    Realms recognizes this program ID
                  </div>
                </div>
              )}
              {isVerified && (
                <div className="flex items-center space-x-1 text-emerald-400">
                  <CheckmarkIcon className="h-4 flex-shrink-0 fill-current w-4" />
                  <div className="text-xs">Anchor verified</div>
                </div>
              )}
            </div>
            <div></div>
          </div>
        )}
      {showMessages &&
        address &&
        isValidAddress &&
        !(isRecognized || isVerified) && (
          <div className="flex items-center mt-2 text-amber-400 space-x-2">
            <WarningFilledIcon className="h-4 flex-shrink-0 fill-current w-4" />
            <div className="text-xs">
              You are proposing an update to your DAO’s voting structure. Realms
              can recognize that this as a program ID, but cannot verify it is
              safe. Mistyping an address risks losing access to your DAO
              forever.
            </div>
          </div>
        )}
      {showMessages && address && !isValidAddress && (
        <div className="flex items-center space-x-2 mt-2">
          <ErrorIcon className="h-4 flex-shrink-0 fill-rose-400 w-4" />
          <div className="text-rose-400 text-xs">Not a valid program ID</div>
        </div>
      )}
    </div>
  );
}
