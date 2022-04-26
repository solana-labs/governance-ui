import { AddressImage, DisplayAddress } from '@cardinal/namespaces-components'
import { UserCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { getMintDecimalAmount } from '@tools/sdk/units'
import { useMemo } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { LockupType } from 'VoteStakeRegistry/sdk/accounts'
import {
  getMinDurationFmt,
  getTimeLeftFromNowFmt,
} from 'VoteStakeRegistry/tools/dateTools'
import { DepositWithWallet } from './tools'

const LockTokenRow = ({
  depositWithWallet,
  index,
}: {
  depositWithWallet: DepositWithWallet
  index: number
}) => {
  const connection = useWalletStore((s) => s.connection)
  const { mint } = useRealm()
  const fmtMangoAmount = (val) => {
    return mint ? getMintDecimalAmount(mint!, val).toFormat(0) : '0'
  }
  const renderAddressName = useMemo(() => {
    return (
      <DisplayAddress
        connection={connection.current}
        address={new PublicKey(depositWithWallet.wallet)}
        height="12px"
        width="100px"
        dark={true}
      />
    )
  }, [depositWithWallet.wallet.toBase58()])
  const renderAddressImage = useMemo(
    () => (
      <AddressImage
        dark={true}
        connection={connection.current}
        address={new PublicKey(depositWithWallet.wallet)}
        height="25px"
        width="25px"
        placeholder={<UserCircleIcon className="h-6 text-fgd-3 w-6" />}
      />
    ),
    [depositWithWallet.wallet.toBase58()]
  )
  const type = Object.keys(
    depositWithWallet.deposit.lockup.kind
  )[0] as LockupType
  const typeName = type !== 'monthly' ? type : 'Vested'
  const isConstant = type === 'constant'
  const lockedTokens = fmtMangoAmount(
    depositWithWallet.deposit.amountDepositedNative
  )
  return (
    <div
      className={`grid grid-cols-4 py-2 px-2 ${
        index % 2 === 0 ? 'bg-bkg-3' : ''
      } rounded`}
      style={{ maxHeight: '40px' }}
    >
      <div className="underline hover:cursor-pointer flex">
        <span className="mr-2">{renderAddressImage}</span> {renderAddressName}
      </div>
      <div>{typeName}</div>
      <div>
        {isConstant
          ? getMinDurationFmt(depositWithWallet.deposit as any)
          : getTimeLeftFromNowFmt(depositWithWallet.deposit as any)}
      </div>
      <div>{lockedTokens}</div>
    </div>
  )
}

export default LockTokenRow
