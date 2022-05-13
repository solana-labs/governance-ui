import { PublicKey } from '@solana/web3.js'
import ContentLoader from 'react-content-loader'
import { abbreviateAddress } from '@utils/formatting'

interface DisplayAddressProps {
  loadingName: boolean
  displayName: string
  address: PublicKey
  height?: string
  width?: string
  dark?: boolean
  style?: React.CSSProperties
}

export default function DisplayAddress({
  address,
  loadingName,
  displayName,
  height = '13',
  width = '300',
  dark = false,
  style,
}: DisplayAddressProps) {
  return loadingName ? (
    <div
      style={{
        ...style,
        height,
        width,
        overflow: 'hidden',
      }}
    >
      <ContentLoader
        backgroundColor={dark ? '#333' : undefined}
        foregroundColor={dark ? '#555' : undefined}
      >
        <rect style={{ ...style }} x={0} y={0} width={width} height={height} />
      </ContentLoader>
    </div>
  ) : (
    <div className="flex">
      {displayName?.includes('@')
        ? displayName
        : displayName || (
            <div className="flex space-x-2">
              <img src="/1-Landing-v2/icon-wallet-white.svg" alt="icon" />
              <div>{abbreviateAddress(address, 4)}</div>
            </div>
          )}
    </div>
  )
}
