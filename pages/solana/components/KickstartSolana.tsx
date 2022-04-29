import { AltButton } from 'components_2/Button'
import Hero, { HeroH1 } from 'components_2/Hero'

export default function KickstartSolana() {
  return (
    <Hero>
      <div className="text-center md:text-left">
        <HeroH1>
          Kickstart your
          <br />
          community on Solana
        </HeroH1>
        <div className="mt-4 text-base font-light tracking-tight text-center text-white mb-11 md:mb-14 md:text-left">
          Create and participate in fully on-chain DAOs of all kinds.
        </div>
      </div>
      <div className="pb-12 space-y-4 text-center md:pb-24 md:text-left">
        <div>
          <AltButton>
            <div className="px-14">Create DAO</div>
          </AltButton>
        </div>
        <div className="block md:hidden">
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
    </Hero>
  )
}
