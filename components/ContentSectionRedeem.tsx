import Button from './Button'
import LinkLeft from './LinkLeft'
//import GradientText from "./GradientText"

const ContentSectionRedeem = () => {
  return (
    <>
      {/* Section 2 */}
      <div className="bg-bkg-2 transform -skew-y-3 pt-16 pb-16 mb-16 -mt-32 z-0">
        <div className="px-8 pt-24 pb-16 z-0 transform skew-y-3">
          <div className="max-w-7xl mx-auto py-16">
            <div className="max-w-4xl mb-24 mx-auto text-center">
              <h2 className="mb-4 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
                A new journey begins...
              </h2>
              <p className="text-xl md:text-2xl lg:text-2xl text-white text-opacity-70">
                Here&apos;s what happens next.
              </p>
            </div>
            <section className="">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="col-span-3 lg:col-span-2">
                  <div className="bg-bkg-3 border border-bkg-4 bg-redeem-one bg-contain bg-bottom bg-no-repeat h-750 md:h-650 lg:h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                    <div className="py-4 px-8 mt-3">
                      <div className="flex flex-col mb-8">
                        <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                          With power comes great responsibility.
                        </h2>
                        <p className="mb-2 text-white text-opacity-70 text-base">
                          Mango is the first DAO on solana to use on-chain
                          governance and as MNGO holders we all have a stake in
                          driving the future of Mango. The governance mechanism
                          is already functional and MNGO tokens are used to both
                          bring proposals to the DAO and vote on said proposals.
                        </p>
                        <p className="text-white text-opacity-70 text-base">
                          There&apos;ll be kinks to iron out as we get up and
                          running but as DAO members, we are all in this
                          together. Cementing the Mango Constitution on-chain.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 lg:col-span-1">
                  <div className="bg-bkg-3 border border-bkg-4 bg-redeem-three bg-contain bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                    <div className="py-4 px-8 mt-3">
                      <div className="flex flex-col mb-8">
                        <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                          Life is cool in the Raydium pool.
                        </h2>
                        <p className="mb-2 text-white text-opacity-70 text-base">
                          The plan is to launch Mango v3 with MNGO as one of the
                          tradable assets. To do this, we need the liquidity for
                          MNGO to be somewhere close to other assets traded on
                          Serum DEX.
                        </p>
                        <p className="text-white text-opacity-70 text-base">
                          As no deals were done with market makers to provide
                          liquidity, it will be up to MNGO holders to jump in
                          the Raydium pool and create liquidity for MNGO.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 lg:col-span-1">
                  <div className="bg-bkg-3 border border-bkg-4 bg-redeem-two bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                    <div className="py-4 px-8 mt-3">
                      <div className="flex flex-col mb-8">
                        <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                          Mango Market Makers United.
                        </h2>
                        <p className="mb-2 text-white text-opacity-70 text-base">
                          Become a market maker and provide liquidity on the
                          Mango v3 perp markets (coming soon). Get started with
                          our example market making bot. Bonus points if you can
                          deploy it on-chain.
                        </p>
                        <p className="mb-4 text-white text-opacity-70 text-base">
                          There&apos;ll be a DAO proposal to decide on liquidity
                          incentives for market making on Mango v3.
                        </p>
                        <LinkLeft className="mb-2">link to SDK</LinkLeft>
                        <LinkLeft>link to docs with devnet tutorial</LinkLeft>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 lg:col-span-2">
                  <div className="bg-bkg-3 border border-bkg-4 bg-redeem-four bg-contain lg:bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                    <div className="py-4 px-8 mt-3">
                      <div className="flex flex-col mb-8">
                        <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                          The road to full decentralization
                        </h2>
                        <p className="text-white text-opacity-70 text-base mb-4">
                          Starts off with the feeling (heres what we&apos;ve
                          done to keep mango decentralized) ends with the CTA of
                          (heres how you can help, heres what we need)
                        </p>
                        <p className="text-white text-opacity-70 text-base mb-4">
                          rough tech roadmap with link to trello
                        </p>
                        <p className="text-white text-opacity-70 text-base mb-4">
                          if you can help us build it, send us proposals the DAO
                          will vote on grants
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <div className="bg-bkg-3 border border-bkg-4 rounded-xl shadow-md overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4 mt-8">
              <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20 h-350">
                <div className="lg:self-center">
                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">Join us on Discord.</span>
                  </h2>
                  <p className="mt-4 text-xl leading-6 text-white text-opacity-50">
                    The official Mango community lives on Discord.
                  </p>
                  <div className="py-8">
                    <a
                      rel="noreferrer"
                      target="_blank"
                      href="https://discord.gg/67jySBhxrgs"
                    >
                      <Button>Get Involved</Button>
                    </a>
                  </div>
                </div>
              </div>
              <div className="-mt-6 aspect-w-5 aspect-h-3 md:aspect-w-2 md:aspect-h-1">
                <img
                  className="h-550 transform translate-x-2 translate-y-2 rounded-xl shadow-lg object-cover object-left-top sm:translate-x-12 lg:translate-y-16"
                  src="../img/redeem5.png"
                  alt="mango markets"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContentSectionRedeem
