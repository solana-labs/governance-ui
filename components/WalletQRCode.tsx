import React, { useEffect, useRef, useState } from 'react'
import type QRCodeStyling from 'qr-code-styling'
import type { PublicKey } from '@solana/web3.js'
import * as AspectRatio from '@radix-ui/react-aspect-ratio'
import cx from 'classnames'
import AutoSizer from 'react-virtualized-auto-sizer'

import LogoRealms from 'public/img/logo-realms.png'

interface Props {
  className?: string
  logoSrc?: string
  walletAddress: PublicKey | string
}

function WalletQRCode(props: Props & { width: number }) {
  const container = useRef<HTMLDivElement>(null)
  const [code, setCode] = useState<QRCodeStyling | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('qr-code-styling').then((m) => {
        const QRCodeStyling = m.default

        setCode(
          new QRCodeStyling({
            backgroundOptions: { color: '#F6F5F3' },
            dotsOptions: { color: '#101010', type: 'rounded' },
            height: props.width, // it's a square, so width === height
            imageOptions: { crossOrigin: 'anonymous', margin: 5 },
            type: 'svg',
            width: props.width,
          })
        )
      })
    }
  }, [])

  useEffect(() => {
    if (container.current && code) {
      code.append(container.current)
    }
  }, [container, code])

  useEffect(() => {
    if (code) {
      const walletAddress =
        typeof props.walletAddress === 'string'
          ? props.walletAddress
          : props.walletAddress.toBase58()

      code.update({
        data: 'solana:' + walletAddress,
        image: props.logoSrc || LogoRealms.src,
      })
    }
  }, [props.logoSrc, props.walletAddress, code])

  return (
    <AspectRatio.Root ratio={1}>
      <div className="h-full w-full" ref={container} />
    </AspectRatio.Root>
  )
}

export default function Wrapper(props: Props) {
  return (
    <div className={cx(props.className, 'rounded', 'overflow-hidden')}>
      <AutoSizer>
        {(sizing) => <WalletQRCode {...sizing} {...props} />}
      </AutoSizer>
    </div>
  )
}
