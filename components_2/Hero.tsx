import Image from 'next/image'
import { Section } from 'pages/solana'
// import useIsExtensionWidth from 'components_2/Utils'

export default function Hero({
  backgroundColor = 'bg-[#282933]',
  // backgroundImgSrcMobile = '/img/realms-web/backgrounds/landing-hero-mobile.png',
  backgroundImgSrc = '/img/realms-web/backgrounds/landing-hero-desktop.png',
  height = 'h-[560px] md:h-[600px]',
  children,
}) {
  // const isExtensionWidth = useIsExtensionWidth({ width: '640' })

  return (
    <div className={`${backgroundColor}`}>
      <div className={`absolute w-full ${height}`}>
        <Image
          alt="hero image"
          src={backgroundImgSrc}
          // src={
          //   isExtensionWidth ? backgroundImgSrcMobile : backgroundImgSrcDesktop
          // }
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div className="pt-40 md:pt-50">
        <Section>{children}</Section>
      </div>
    </div>
  )
}
