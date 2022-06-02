import Tooltip from '@components/Tooltip'
import { InformationCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { getMintDecimalAmount } from '@tools/sdk/units'
import tokenService from '@utils/services/token'

const InfoBox = ({ title, val, tooltip = '', className = '' }) => {
  const { mint, realm } = useRealm()
  const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
  })
  const fmtAmount = (val) => {
    return mint
      ? formatter.format(getMintDecimalAmount(mint!, val).toNumber())
      : '0'
  }
  const price = realm
    ? tokenService.getUSDTokenPrice(realm!.account.communityMint.toBase58())
    : 0
  const totalPrice = mint
    ? formatter.format(getMintDecimalAmount(mint!, val).toNumber() * price)
    : ''
  return (
    <div
      className={`border border-fgd-4 flex flex-col justify-center p-3 rounded-md ${className}`}
    >
      <div className="mb-1 text-fgd-3 text-sm flex items-center">
        {title}
        {tooltip && (
          <Tooltip content={tooltip}>
            <span>
              <InformationCircleIcon className="w-4 h-4 ml-1"></InformationCircleIcon>
            </span>
          </Tooltip>
        )}
      </div>
      <div>
        <span className="font-bold text-2xl">{fmtAmount(val)}</span>
        {totalPrice && (
          <span className="text-xs font-normal text-fgd-2">
            {' '}
            ≈ ${totalPrice}
          </span>
        )}
      </div>
    </div>
  )
}

export default InfoBox
