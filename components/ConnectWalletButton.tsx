import { Menu } from '@headlessui/react';
import { useMemo } from 'react';
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/solid';
import styled from '@emotion/styled';
import useWalletStore from '../stores/useWalletStore';
import {
  getWalletProviderByUrl,
  WALLET_PROVIDERS,
} from '../utils/wallet-adapters';

const StyledWalletProviderLabel = styled.p`
  font-size: 0.65rem;
  line-height: 1.5;
`;

const ConnectWalletButton = (props) => {
  const {
    connected,
    current,
    providerUrl,
    set: setWalletStore,
  } = useWalletStore((s) => s);

  const provider = useMemo(() => getWalletProviderByUrl(providerUrl), [
    providerUrl,
  ]);

  const handleConnectDisconnect = async () => {
    try {
      if (connected) {
        await current?.disconnect();
      } else {
        await current?.connect();
      }
    } catch (e) {
      console.warn('handleConnectDisconnect', e);
    }
  };

  if (!provider) {
    return null;
  }

  return (
    <div className="flex">
      <button
        className="bg-transparent border border-fgd-3 border-r-0 default-transition flex h-12 items-center pl-3 pr-4 rounded-l-full rounded-r-none w-36 hover:bg-bkg-3 focus:outline-none"
        onClick={handleConnectDisconnect}
        {...props}
      >
        <div className="flex font-bold items-center text-fgd-1 text-left text-sm">
          <div className="pr-2">
            <img src={provider.icon} className="h-5 w-5" />
          </div>

          <div>
            {connected ? 'Disconnect' : 'Connect'}
            <StyledWalletProviderLabel className="font-normal text-fgd-3">
              {provider.name}
            </StyledWalletProviderLabel>
          </div>
        </div>
      </button>

      <div className="relative ">
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button className="border border-fgd-3 cursor-pointer default-transition h-12 w-12 py-2 px-2 rounded-r-full hover:bg-bkg-3 focus:outline-none">
                <ChevronDownIcon
                  className={`${
                    open ? 'transform rotate-180' : 'transform rotate-360'
                  } default-transition h-5 m-auto ml-1 text-primary-light w-5`}
                />
              </Menu.Button>
              <Menu.Items className="absolute bg-bkg-1 border border-fgd-4 p-2 right-0 top-14 shadow-md outline-none rounded-md w-48 z-20">
                {WALLET_PROVIDERS.map(({ name, url, icon }) => (
                  <Menu.Item key={name}>
                    <button
                      className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none"
                      onClick={() =>
                        setWalletStore((s) => {
                          s.providerUrl = url;
                        })
                      }
                    >
                      <img src={icon} className="h-4 w-4 mr-2" />
                      <span className="text-sm">{name}</span>
                      {provider.url === url ? (
                        <CheckCircleIcon className="h-5 ml-2 text-green w-5" />
                      ) : null}
                    </button>
                  </Menu.Item>
                ))}
              </Menu.Items>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
};

export default ConnectWalletButton;
