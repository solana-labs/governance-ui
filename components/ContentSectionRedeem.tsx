import Button from './Button'
import LinkLeft from './LinkLeft'
import GradientText from './GradientText'

const ContentSectionRedeem = () => {
  return (
    <>
      {/* Section 2 */}
      <div className="bg-bkg-2 transform -skew-y-3 pt-16 pb-0 mb-16 -mt-32 z-0 overflow-hidden">
        <div className="px-8 pt-24 pb-16 z-0 transform skew-y-3">
          <div className="max-w-7xl mx-auto py-16">
            <div className="max-w-4xl mb-24 mx-auto text-center">
              <h2 className="mb-4 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
                Want more <GradientText>MNGO</GradientText>?
              </h2>
              <p className="text-xl md:text-2xl lg:text-2xl text-white text-opacity-70">
                These three steps support the protocol, we believe the DAO
                should reward them.
              </p>
            </div>
            <section className="">
              <div className="grid grid-cols-3 gap-6 mb-24 pb-16">
                <div className="col-span-3 lg:col-span-1">
                  <div className="bg-bkg-3 border border-bkg-4 bg-redeem-three bg-contain bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                    <div className="py-4 px-8 mt-3">
                      <div className="flex flex-col mb-8">
                        <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                          Life is cool in the Raydium pool.
                        </h2>
                        <p className="mb-2 text-white text-opacity-70 text-base">
                          We want MNGO to be traded on Mango v3. So MNGO needs
                          decent liquidity on serum&apos;s order book.
                          <br />
                          <br />
                          It will be up to us MNGO holders to provide that
                          liquidity on day one. Let&apos;s start with a Raydium
                          pool until more sophisticated traders step in on their
                          own.
                        </p>
                        {/* 
                        <a 
                        rel="noreferrer"
                        target="_blank"
                        href="#"
                        >
                        <LinkLeft>Jump in Now</LinkLeft>
                        </a>
                        */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-3 lg:col-span-1">
                  <div className="bg-bkg-3 border border-bkg-4 bg-redeem-two bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                    <div className="py-4 px-8 mt-3">
                      <div className="flex flex-col mb-8">
                        <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                          Become a Mango market maker.
                        </h2>
                        <p className="mb-2 text-white text-opacity-70 text-base">
                          Provide liquidity on the upcoming Perpetual Futures.
                          Start today on devnet with our example bot and get
                          ready for launch day.
                          <br />
                          <br />
                          Liquidity incentives for market making are built in
                          and instantly awarded.
                        </p>
                        <a
                          rel="noreferrer"
                          target="_blank"
                          href="https://docs.mango.markets/mango-v3/market-making-bot-python"
                        >
                          <LinkLeft>Learn more</LinkLeft>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-3 lg:col-span-1">
                  <div className="bg-bkg-3 border border-bkg-4 bg-redeem-four bg-contain bg-bottom bg-no-repeat h-750 md:h-650 lg:h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                    <div className="py-4 px-8 mt-3">
                      <div className="flex flex-col mb-8">
                        <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                          Build the best Mango.
                        </h2>
                        <p className="mb-2 text-white text-opacity-70 text-base">
                          This is by far the hardest and most rewarding method.
                          Launch a project that builds on top of Mango, help
                          grow the protocol.
                          <br />
                          <br />
                          The bar is high and quality is of the utmost
                          importance. We believe that the reward given out by
                          the DAO should be equally high.
                        </p>
                        {/* <a rel="noreferrer" target="_blank" href="#">
                          <LinkLeft>Learn More</LinkLeft>
                        </a> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className="transform skew-y-3">
          <div className="max-w-4xl mx-auto text-center -mt-24">
            <h2 className="mb-4 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
              With great power comes great responsibility.
            </h2>
            <p className="text-lg md:text-2xl lg:text-lg text-white text-opacity-70">
              Mango is the first DAO on solana to use on-chain governance.
              <br /> As token holders we all have a stake in driving the future
              of this project.
            </p>
            <br />

            {/* <p className="text-lg md:text-2xl lg:text-lg text-white text-opacity-70">
              The governance mechanism is already functional and MNGO tokens are
              used to both bring proposals to the DAO and vote on said
              proposals. There&apos;ll be kinks to iron out as we get up and
              running but as DAO members, we are all in this together.
            </p> */}
            <div className="py-12">
              <a
                rel="noreferrer"
                target="_blank"
                href="https://discord.gg/U5XSg5P9ut"
              >
                <Button>Get Involved</Button>
              </a>
            </div>
            <div className="flex relative pt-12 -mt-12 lg:top-4 md:top-4 sm:top-4 xs:top-4">
              <img className="h-96" alt="modals" src="../img/redeem1.png" />
            </div>
          </div>
        </div>
      </div>
      {/* 
      <div className="mx-auto max-w-7xl py-16 my-16">
      <div className="bg-bkg-3 border border-bkg-4 rounded-xl shadow-md overflow-hidden lg:grid lg:grid-cols-2 lg:gap-2 mt-8 bg-bg-texture bg-cover bg-bottom bg-no-repeat">
      <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20 h-350">
                <div className="lg:self-center">
                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">The community that lives on Discord.</span>
                  </h2>
                  <p className="mt-4 text-xl leading-6 text-white text-opacity-50">
                    Join us in chat, we&apos;re always available and ready to answer any questions. 
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
                  className="transform translate-x-2 translate-y-2 rounded-xl shadow-lg object-cover object-left-top sm:translate-x-12 lg:translate-y-16"
                  src="../img/redeem5.png"
                  alt="mango markets"
                />
              </div>
              </div>

            </div>
*/}
    </>
  )
}

export default ContentSectionRedeem
