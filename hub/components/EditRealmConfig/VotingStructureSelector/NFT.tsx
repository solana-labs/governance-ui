import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled';
import type { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';
import BN from 'bn.js';

import { Config } from '../fetchConfig';
import { NFTValidator } from '../NFTValidator';
import { Input } from '@hub/components/controls/Input';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  currentNftCollection?: PublicKey;
  nftCollection?: PublicKey;
  nftCollectionSize: number;
  nftCollectionWeight: BN;
  communityMint: Config['communityMint'];
  onCollectionChange?(value: PublicKey | null): void;
  onCollectionSizeChange?(value: number): void;
  onCollectionWeightChange?(value: BN): void;
}

export function NFT(props: Props) {
  return (
    <div className={props.className}>
      <div className="relative">
        <div className="absolute top-0 left-2 w-0 h-72 border-l dark:border-neutral-700" />
        <div className="pt-10 pl-8">
          {!!props.currentNftCollection && (
            <div className="text-amber-400 text-xs mb-4 space-x-2 flex items-top">
              <WarningFilledIcon className="h-4 flex-shrink-0 fill-current w-4" />
              <div>
                You cannot edit an existing NFT governance structure from this
                screen. If you want to change the way your nft governance is
                structured, please use the "Create Proposal" screen.
              </div>
            </div>
          )}
          <div className="text-white font-bold mb-3">
            What is the NFT Collection's address?
          </div>
          <div className="relative">
            <div
              className={cx(
                'absolute',
                'border-b',
                'border-l',
                'top-2.5',
                'h-5',
                'mr-1',
                'right-[100%]',
                'rounded-bl',
                'w-5',
                'dark:border-neutral-700',
              )}
            />
            <NFTValidator
              disabled={!!props.currentNftCollection}
              value={props.nftCollection || null}
              onChange={props.onCollectionChange}
            />
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute top-0 left-2 w-0 h-40 border-l dark:border-neutral-700" />
        <div className="pt-10 pl-8">
          <div className="text-white font-bold mb-3">
            How many NFTs are in the collection?
          </div>
          <div className="relative">
            <div
              className={cx(
                'absolute',
                'border-b',
                'border-l',
                'top-2.5',
                'h-5',
                'mr-1',
                'right-[100%]',
                'rounded-bl',
                'w-5',
                'dark:border-neutral-700',
              )}
            />
            <Input
              className="w-full"
              disabled={!!props.currentNftCollection}
              value={props.nftCollectionSize}
              type="number"
              onChange={(e) => {
                const value = e.currentTarget.valueAsNumber;

                if (Number.isNaN(value)) {
                  props.onCollectionSizeChange?.(0);
                } else {
                  props.onCollectionSizeChange?.(value);
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute top-0 left-2 w-0 h-24 border-l dark:border-neutral-700" />
        <div className="pt-10 pl-8">
          <div className="text-white font-bold mb-3">
            How many votes should each NFT count as?
          </div>
          <div className="relative">
            <div
              className={cx(
                'absolute',
                'border-b',
                'border-l',
                'top-2.5',
                'h-5',
                'mr-1',
                'right-[100%]',
                'rounded-bl',
                'w-5',
                'dark:border-neutral-700',
              )}
            />
            <Input
              className="w-full"
              disabled={!!props.currentNftCollection}
              value={new BigNumber(props.nftCollectionWeight.toString())
                .shiftedBy(-props.communityMint.account.decimals)
                .toString()}
              type="number"
              onChange={(e) => {
                const value = e.currentTarget.valueAsNumber;

                if (Number.isNaN(value)) {
                  props.onCollectionWeightChange?.(new BN(0));
                } else {
                  const weight = new BN(
                    new BigNumber(value)
                      .shiftedBy(props.communityMint.account.decimals)
                      .toString(),
                  );
                  props.onCollectionWeightChange?.(weight);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
