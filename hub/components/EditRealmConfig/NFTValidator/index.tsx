import ErrorIcon from '@carbon/icons-react/lib/Error';
import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled';
import { Metaplex } from '@metaplex-foundation/js';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { Input } from '@hub/components/controls/Input';
import { useCluster } from '@hub/hooks/useCluster';

interface NFTCollection {
  description?: string;
  img?: string;
  name: string;
  symbol?: string;
}

interface Props {
  className?: string;
  disabled?: boolean;
  value: PublicKey | null;
  onChange?(value: PublicKey | null): void;
}

export function NFTValidator(props: Props) {
  const [address, setAddress] = useState(props.value?.toBase58() || '');
  const [isValid, setIsValid] = useState(true);
  const [cluster] = useCluster();
  const [collectionInfo, setCollectionInfo] = useState<NFTCollection | null>(
    null,
  );
  const [isValidCollection, setIsValidCollection] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const text = props.value?.toBase58() || '';

    if (address !== text) {
      setAddress(text);
    }

    if (props.value) {
      setCollectionInfo(null);
      setIsValidCollection(true);
      const metaplex = new Metaplex(cluster.connection);

      metaplex
        .nfts()
        .findByMint({ mintAddress: props.value })
        .then((info) => {
          const name = info.name;
          const img = info.json?.image;
          const symbol = info.json?.symbol;
          const description = info.json?.description;
          setCollectionInfo({ name, img, symbol, description });
        })
        .catch((e) => {
          console.error(e);
          setIsValidCollection(false);
          setCollectionInfo(null);
        });
    } else {
      setIsValidCollection(true);
      setCollectionInfo(null);
    }
  }, [props.value, cluster]);

  return (
    <div className={props.className}>
      <Input
        className="w-full"
        disabled={props.disabled}
        placeholder="e.g. GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw"
        value={address}
        onBlur={(e) => {
          const text = e.currentTarget.value;

          try {
            const pk = new PublicKey(text);
            setIsValid(true);
            setShowPreview(true);
            props.onChange?.(pk);
          } catch {
            setIsValid(false);
            setShowPreview(true);
            props.onChange?.(null);
          }
        }}
        onChange={(e) => {
          const text = e.currentTarget.value;
          setShowPreview(false);

          try {
            new PublicKey(text);
            setIsValid(true);
          } catch {
            setIsValid(false);
          }

          setAddress(text);
        }}
      />
      {showPreview && address && isValid && collectionInfo && (
        <div className="flex items-center mt-2 space-x-4">
          {collectionInfo.img && (
            <img
              className="border border-zinc-300 h-20 w-20 rounded dark:border-neutral-700"
              src={collectionInfo.img}
            />
          )}
          <div>
            <div className="text-lg text-white font-medium">
              {collectionInfo.name}
            </div>
            {collectionInfo.description && (
              <div className="text-xs dark:text-neutral-400">
                {collectionInfo.description}
              </div>
            )}
            {collectionInfo.symbol && (
              <div className="text-xs dark:text-neutral-400">
                <span className="font-bold">Symbol:</span>{' '}
                {collectionInfo.description}
              </div>
            )}
          </div>
        </div>
      )}
      {showPreview && address && isValid && !isValidCollection && (
        <div className="flex items-center mt-2 text-amber-400 space-x-2">
          <WarningFilledIcon className="h-4 flex-shrink-0 fill-current w-4" />
          <div className="text-xs">
            You are proposing an update to your DAO’s voting structure. Realms
            can recognize that this as a valid address, but cannot verify the
            collection it belongs to.
          </div>
        </div>
      )}
      {showPreview && address && !isValid && (
        <div className="flex items-center space-x-2 mt-2">
          <ErrorIcon className="h-4 flex-shrink-0 fill-rose-400 w-4" />
          <div className="text-rose-400 text-xs">
            Not a valid collection address
          </div>
        </div>
      )}
    </div>
  );
}
