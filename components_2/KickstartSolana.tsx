import Image from 'next/image'
import { AltButton } from './Button'
import { Section } from 'pages/solana'
const KickstartSolana = () => {
  return (
    <div className="bg-[#282933]">
      <div className="absolute w-full h-[560px] md:h-[600px]">
        <Image
          alt="abstract art"
          src="/1-Landing-v2/landing-hero-desktop.png"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div className="pt-40 md:pt-50">
        <Section>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
              Kickstart your
            </h1>
            <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
              community on Solana
            </h1>
            <p className="mt-4 text-base tracking-tight text-center text-white mb-11 md:mb-14 md:text-left">
              Create and participate in fully on-chain DAOs of all kinds.
            </p>
          </div>
          <div className="pb-10 space-y-4 text-center md:text-left">
            <div>
              <AltButton>
                <div className="px-14">Create DAO</div>
              </AltButton>
            </div>
            <div className="visible md:invisible">
              <AltButton tertiary>
                <div className="relative flex items-center justify-center">
                  <div className="pl-4 pr-2">Read the Docs</div>
                  <img
                    src="/1-Landing-v2/icon-external-link-white.png"
                    className="w-3 h-3 mr-4"
                    alt="External link icon"
                  />
                </div>
              </AltButton>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

export default KickstartSolana
