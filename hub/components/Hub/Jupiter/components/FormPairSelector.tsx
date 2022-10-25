import { TokenInfo } from '@solana/spl-token-registry';
import { useWallet } from '@solana/wallet-adapter-react';
import classNames from 'classnames';
import React, { createRef, memo, useEffect, useMemo, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { areEqual, FixedSizeList, ListChildComponentProps } from 'react-window';

import { useAccounts } from '../contexts/accounts';
import CloseIcon from '../icons/CloseIcon';

import JupiterLogo from '../icons/JupiterLogo';

import FormPairRow from './FormPairRow';
import JupButton from './JupButton';

export const PAIR_ROW_HEIGHT = 72;
export const isMobile = () =>
  typeof window !== 'undefined' && screen && screen.width <= 480;

const MAX_PAIR = () => (isMobile() ? 4 : 6);
const getContainerHeight = () => {
  const maxDesktopHeight = [
    MAX_PAIR() * PAIR_ROW_HEIGHT,
    8, // compensate top margins
  ].reduce((num, acc) => num + acc, 0);

  // Whichever is smaller, to compensate smaller screens
  return Math.min(
    window.innerHeight - 32, // Modal padding
    maxDesktopHeight,
  );
};

const rowRenderer = memo((props: ListChildComponentProps) => {
  const { data, index, style } = props;
  const item = data.searchResult[index];

  return (
    <FormPairRow
      key={item.address}
      item={item}
      style={style}
      onSubmit={data.onSubmit}
    />
  );
}, areEqual);

const Header: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="absolute top-2 border-b border-b-gray-200 w-full flex justify-end items-center pt-1 pb-2 pr-4">
      <div className="cursor-pointer" onClick={onClose}>
        <CloseIcon width={16} height={16} />
      </div>
    </div>
  );
};

const FormPairSelector = ({
  onSubmit,
  tokenInfos,
  onClose,
}: {
  onSubmit: (value: TokenInfo) => void;
  onClose: () => void;
  tokenInfos: TokenInfo[];
}) => {
  const { wallet, connect } = useWallet();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);
  const { accounts } = useAccounts();

  // We do not support search yet
  const [searchResult, setSearchResult] = useState<TokenInfo[]>(tokenInfos);
  useEffect(() => {
    const sortedList = tokenInfos.sort(
      (a, b) => accounts[b.address].balance - accounts[a.address].balance,
    );

    setSearchResult(sortedList);
  }, [accounts, tokenInfos]);

  const listRef = createRef<FixedSizeList>();

  // Initial token loading
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    if (initialLoading && searchResult && searchResult.length > 0) {
      setInitialLoading(false);
    }
  }, [searchResult]);

  if (!walletPublicKey) {
    return (
      <div
        className="pt-8 flex flex-col relative w-[80%] rounded-lg h-full items-center justify-center text-left bg-white"
        style={{
          // AutoSizer will greedily fills the container with height and width below
          height: getContainerHeight(),
          maxWidth: 448,
        }}
      >
        <Header onClose={onClose} />
        <JupiterLogo width={48} height={48} />
        <p className="font-semibold text-lg mt-4 mb-6 text-black w-[60%] text-center">
          Connect Your Wallet to Get Started
        </p>
        <JupButton onClick={connect}>Connect Wallet</JupButton>
      </div>
    );
  }

  return (
    <div
      className="pt-8 flex flex-col relative w-[80%] rounded-lg h-full text-left bg-white"
      style={{
        // AutoSizer will greedily fills the container with height and width below
        height: getContainerHeight(),
        maxWidth: 448,
      }}
    >
      <Header onClose={onClose} />

      <div className="mt-2" style={{ flexGrow: 1 }}>
        {searchResult.length > 0 && (
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => {
              return (
                <FixedSizeList
                  ref={listRef}
                  height={height}
                  itemCount={searchResult.length}
                  itemSize={PAIR_ROW_HEIGHT}
                  width={width - 2} // -2 for scrollbar
                  itemData={{
                    searchResult,
                    onSubmit,
                  }}
                  className={classNames(
                    'overflow-y-scroll mr-1 min-h-[12rem] px-5',
                  )}
                >
                  {rowRenderer}
                </FixedSizeList>
              );
            }}
          </AutoSizer>
        )}

        {initialLoading ? (
          <div className="mt-4 mb-4 text-center dark:text-white-50 text-black-50">
            <span>Loading tokens...</span>
          </div>
        ) : searchResult.length === 0 ? (
          <div className="mt-4 mb-4 text-center dark:text-white-50 text-black-50">
            <span>No tokens found</span>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default FormPairSelector;
