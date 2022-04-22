import Tooltip from '@components/Tooltip'
import { InformationCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { getMintDecimalAmount } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import { MANGO_MINT } from 'Strategies/protocols/mango/tools'

const InfoBox = ({ title, val, tooltip = '', className = '' }) => {
  const { mint } = useRealm()
  const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
  })
  const fmtMangoAmount = (val) => {
    return mint
      ? formatter.format(getMintDecimalAmount(mint!, val).toNumber())
      : '0'
  }
  const price = tokenService.getUSDTokenPrice(MANGO_MINT)
  const totalPrice = mint
    ? formatter.format(getMintDecimalAmount(mint!, val).toNumber() * price)
    : ''
  return (
    <div className={`border border-fgd-4 p-3 rounded-md mb-4 ${className}`}>
      <div className="text-fgd-3 text-xs flex items-center">
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
        <span className="font-bold text-xl">{fmtMangoAmount(val)}</span>
        {totalPrice && (
          <span className="text-xs font-normal text-fgd-2">
            {' '}
            = ${totalPrice}
          </span>
        )}
      </div>
    </div>
  )
}

export default InfoBox
