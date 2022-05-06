import Image from 'next/image'
import { Section } from 'pages/solana'

export default function Hero({
  backgroundColor = 'bg-[#282933]',
  backgroundImgSrc = '/1-Landing-v2/landing-hero-desktop.png',
  height = 'h-[560px] md:h-[600px]',
  children,
}) {
  return (
    <div className={`${backgroundColor}`}>
      <div className={`absolute w-full ${height}`}>
        <Image
          alt="hero image"
          src={backgroundImgSrc}
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
