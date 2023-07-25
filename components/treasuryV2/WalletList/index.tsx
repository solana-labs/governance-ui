import cx from 'classnames'
import { useEffect, useState } from 'react'

import { Asset } from '@models/treasury/Asset'
import { Result, Status } from '@utils/uiTypes/Result'
import { AuxiliaryWallet, Wallet } from '@models/treasury/Wallet'

import AuxiliaryWalletListItem from './AuxiliaryWalletListItem'
import NewWalletButton from './NewWalletButton'
import WalletListItem from './WalletListItem'

interface Props {
  className?: string
  data: Result<{
    auxiliaryWallets: AuxiliaryWallet[]
    wallets: Wallet[]
  }>
  selectedAsset?: Asset | null | 'USE NON-LEGACY STATE'
  selectedWallet?: AuxiliaryWallet | Wallet | null | 'USE NON-LEGACY STATE'
  onSelectAsset?(asset: Asset, wallet: AuxiliaryWallet | Wallet): void
  onSelectWallet?(wallet: AuxiliaryWallet | Wallet): void
}

export default function WalletList(props: Props) {
  const [expanded, setExpanded] = useState<string[]>([])

  useEffect(() => {
    if (props.data._tag === Status.Ok) {
      const expanded = props.data.data.wallets[0]
      const expandedKey = expanded
        ? 'address' in expanded
          ? expanded.address
          : //@ts-ignore
            expanded.name
        : undefined

      setExpanded((current) => {
        if (!expandedKey || current.includes(expandedKey)) {
          return current
        } else {
          return current.concat(expandedKey)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [props.data._tag])

  switch (props.data._tag) {
    case Status.Failed:
    case Status.Pending:
      return (
        <div className={cx(props.className, 'h-full')}>
          <div className="flex-shrink-0 flex items-center justify-between pb-5">
            <div className="font-bold text-base">DAO Wallets</div>
            <NewWalletButton />
          </div>
          <div className="overflow-y-auto flex-grow space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="h-24 rounded bg-bkg-1 animate-pulse" key={i} />
            ))}
          </div>
        </div>
      )
    default:
      return (
        <div
          className={cx(
            props.className,
            'h-full',
            'grid',
            'grid-rows-[28px_1fr]',
            'gap-5'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="font-bold text-base">
              DAO Wallets
              {props.data.data.auxiliaryWallets.length > 0 && ' & Assets'}
            </div>
            <NewWalletButton />
          </div>
          <div className="overflow-y-auto space-y-4">
            {props.data.data.auxiliaryWallets.length === 0 &&
              props.data.data.wallets.length === 0 && (
                <div className="h-24 bg-bkg-1 rounded flex items-center justify-center">
                  There are no wallets in this treasury
                </div>
              )}
            {props.data.data.wallets.map((wallet) => (
              <WalletListItem
                key={wallet.address}
                expanded={expanded.includes(wallet.address)}
                selected={
                  (props.selectedWallet &&
                    props.selectedWallet !== 'USE NON-LEGACY STATE' &&
                    'address' in props.selectedWallet &&
                    props.selectedWallet.address) === wallet.address
                }
                selectedAsset={
                  props.selectedAsset !== 'USE NON-LEGACY STATE'
                    ? props.selectedAsset
                    : null
                }
                wallet={wallet}
                onExpand={() => {
                  setExpanded((list) => {
                    if (list.includes(wallet.address)) {
                      return list.filter(
                        (address) => address !== wallet.address
                      )
                    } else {
                      return list.concat(wallet.address)
                    }
                  })
                }}
                onSelectAsset={(asset) => {
                  props.onSelectAsset?.(asset, wallet)
                }}
                onSelectWallet={() => {
                  props.onSelectWallet?.(wallet)

                  const current = props.selectedWallet
                  if (current !== 'USE NON-LEGACY STATE')
                    setExpanded((list) => {
                      const curKey = current
                        ? 'address' in current
                          ? current.address
                          : current.name
                        : null

                      if (
                        wallet.address === curKey &&
                        list.includes(wallet.address) &&
                        !props.selectedAsset
                      ) {
                        return list.filter((str) => str !== wallet.address)
                      } else if (!list.includes(wallet.address)) {
                        return list
                          .filter((str) => str !== curKey)
                          .concat(wallet.address)
                      } else {
                        return list
                      }
                    })
                }}
              />
            ))}
            {props.data.data.auxiliaryWallets.map((wallet) => (
              <AuxiliaryWalletListItem
                key={wallet.name}
                expanded={expanded.includes(wallet.name)}
                selected={
                  props.selectedWallet &&
                  props.selectedWallet !== 'USE NON-LEGACY STATE' &&
                  'address' in props.selectedWallet
                    ? false
                    : // @ts-ignore
                      props.selectedWallet?.name === wallet.name
                }
                selectedAsset={props.selectedAsset}
                wallet={wallet}
                onExpand={() => {
                  setExpanded((list) => {
                    if (list.includes(wallet.name)) {
                      return list.filter((str) => str !== wallet.name)
                    } else {
                      return list.concat(wallet.name)
                    }
                  })
                }}
                onSelectAsset={(asset) => {
                  props.onSelectAsset?.(asset, wallet)
                }}
                onSelectWallet={() => {
                  props.onSelectWallet?.(wallet)
                  const current = props.selectedWallet
                  if (current !== 'USE NON-LEGACY STATE')
                    setExpanded((list) => {
                      const curKey = current
                        ? 'address' in current
                          ? current.address
                          : current.name
                        : null

                      if (
                        wallet.name === curKey &&
                        list.includes(wallet.name) &&
                        !props.selectedAsset
                      ) {
                        return list.filter((str) => str !== wallet.name)
                      } else if (!list.includes(wallet.name)) {
                        return list
                          .filter((str) => str !== curKey)
                          .concat(wallet.name)
                      } else {
                        return list
                      }
                    })
                }}
              />
            ))}
          </div>
        </div>
      )
  }
}
