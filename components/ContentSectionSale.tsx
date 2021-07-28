const ContentSectionSale = () => {
  return (
    <>
      {/* Section 2 */}
      <div className="pb-16 mb-16 z-0">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="max-w-4xl mb-24 mx-auto text-center">
            <h2 className="mb-4 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
              How the token sale works.
            </h2>
            <p className="text-xl md:text-2xl lg:text-2xl text-white text-opacity-70">
              Fairness and transparency for all participants.
            </p>
          </div>
          <section className="">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="col-span-3 lg:col-span-2">
                <div className="bg-bkg-3 border border-bkg-4 bg-feature-two bg-contain lg:bg-cover bg-bottom bg-no-repeat h-750 md:h-650 lg:h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                  <div className="py-4 px-8 mt-3">
                    <div className="flex flex-col mb-8">
                      <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                        The token sale will span 48 hours
                      </h2>
                      <p className="text-white text-opacity-70 text-base">
                        The 48 hours consists of two 24 hour periods, the{' '}
                        <span className="text-mango-green text-base">
                          sale period
                        </span>{' '}
                        and the{' '}
                        <span className="text-blue-400 text-base">
                          grace period
                        </span>
                        . Only afterwards you will be able to redeem MNGO.
                      </p>
                      <div className="flex flex-wrap overflow-hiddenm mt-8">
                        <div className="w-full mb-4 lg:mb-0 overflow-hidden lg:w-1/2 pr-4">
                          <p className="mb-2">
                            <span className="font-semibold text-mango-green text-lg">
                              Sale period{' '}
                            </span>
                          </p>
                          <p className="text-base text-white text-opacity-70">
                            In the first 24 hours, you may deposit or withdraw
                            your USDC from the vault. During the sale period,
                            the MNGO price can fluctuate.
                          </p>
                        </div>
                        <div className="w-full overflow-hidden lg:w-1/2 pr-4">
                          <p className="mb-2">
                            <span className="font-semibold text-blue-400 text-lg">
                              Grace period{' '}
                            </span>
                          </p>
                          <p className="text-base text-white text-opacity-70">
                            After 24 hours, deposits will be restricted and only
                            withdrawals allowed. During the grace period, the
                            MNGO price can only go down.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-3 lg:col-span-1">
                <div className="bg-bkg-3 border border-bkg-4 bg-feature-one bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                  <div className="py-4 px-8 mt-3">
                    <div className="flex flex-col mb-8">
                      <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                        Contribute your USDC
                      </h2>
                      <p className="text-white text-opacity-70 text-base">
                        During the
                        <span className="text-mango-green">
                          {' '}
                          sale period
                        </span>{' '}
                        you can deposit USDC into the vault. You can also change
                        this amount by withdrawing or depositing additional USDC
                        if you choose to.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 lg:col-span-1">
                <div className="bg-bkg-3 border border-bkg-4 bg-feature-four bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                  <div className="py-4 px-8 mt-3">
                    <div className="flex flex-col mb-8">
                      <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                        Redeem unlocked MNGO
                      </h2>
                      <p className="text-white text-opacity-70 text-base">
                        Once the{' '}
                        <span className="text-blue-400">grace period</span> ends
                        the MNGO tokens will be unlocked for redemption. The
                        number of tokens you&apos;ll receive will be
                        proportional to your USDC contribution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-3 lg:col-span-2">
                <div className="bg-bkg-3 border border-bkg-4 bg-feature-three bg-contain lg:bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                  <div className="py-4 px-8 mt-3">
                    <div className="flex flex-col mb-8">
                      <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                        Why does it work this way?
                      </h2>
                      <p className="text-white text-opacity-70 text-base mb-4">
                        We wanted to build a mechanism that is fair and
                        transparent for all participants. No private sale, no
                        backroom deals with VCs, all players are on a level
                        playing field. The mechanism is simple but robust. This
                        makes it easier to build, use, and more importantly,
                        harder to exploit.
                      </p>
                      <p className="text-white text-opacity-70 text-base">
                        All you need to do, is decide how much you contribute
                        and how much you value MNGO. If the sale price is too
                        high for you, you can still withdraw during the{' '}
                        <span className="text-blue-400">grace period</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default ContentSectionSale
