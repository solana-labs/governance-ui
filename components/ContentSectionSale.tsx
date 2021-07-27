const ContentSectionSale = () => {
  return (
    <>
{/* Section 2 */}                  
<div className="pt-16 pb-16 mb-16 -mt-16 z-0">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="max-w-4xl mb-24 mx-auto text-center mt-16 pt-16">
          <h2 className="mb-4 text-3xl md:text-4xl lg:text-4xl text-white font-bold font-heading">
            How the sale works.
          </h2>
          <p className="text-xl md:text-2xl lg:text-2xl text-white text-opacity-50">
            We take the view that token sales should be simple, transparent and
            fairly distributed.
          </p>
        </div>
        <section className="">
          <div className="grid grid-cols-3 gap-6 mb-6">

            <div className="col-span-3 lg:col-span-2">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-two bg-contain lg:bg-cover bg-bottom bg-no-repeat h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                      The 48 hour participation period begins.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      The event will span over 2 days split into two periods,{' '}
                      <span className="text-mango-green italic">
                        sale period
                      </span>{' '}
                      and{' '}
                      <span className="text-blue-400 italic">grace period</span>.
                    </p>
                    <div className="flex flex-wrap overflow-hiddenm mt-8">
                      <div className="w-full overflow-hidden lg:w-1/2 pr-4">
                        <p>
                          <span className="text-mango-green italic">
                            Sale Period
                          </span>
                        </p>
                        <p className="text-white text-opacity-50">
                          During the sale period, you may deposit or
                          withdraw USDC from the vault. During the sale
                          period, the $MNGO price can fluctuate.
                        </p>
                      </div>

                      <div className="w-full overflow-hidden lg:w-1/2">
                        <p>
                          <span className="text-blue-400 italic">
                            Grace Period
                          </span>
                        </p>
                        <p className="text-white text-opacity-50">
                          After 24 hours deposits will be restricted and only
                          withdrawals allowed. During the grace period
                          price can only go down.
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
                      Deposit USDC into Vault.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      Users deposit their USDC into the contribution vault during the 
                      <span className="text-mango-green italic"> sale period</span> locking in their ticket for $MNGO redemptions on sale completion.
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
                      MNGO unlocked and redeemable.
                    </h2>
                    <p className="text-white text-opacity-50 text-base">
                      Once the <span className="text-blue-400 italic"> grace period</span> ends, MNGO will be unlocked for redemption from the distribution vault. 
                      <br />
                      <br />
                      Users receive a token amount
                      in proportion to their USDC contribution.{' '}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-3 lg:col-span-2">
              <div className="bg-bkg-3 border border-bkg-4 bg-feature-three bg-contain lg:bg-cover bg-bottom bg-no-repeat h-575 md:h-650 lg:h-650 w-full shadow-md rounded-xl overflow-hidden mx-auto">
                <div className="py-4 px-8 mt-3">
                  <div className="flex flex-col mb-8">
                    <h2 className="text-white font-semibold text-xl tracking-wide mb-2">
                      Why does it work this way?
                    </h2>
                    <p className="text-white text-opacity-50 text-base mb-4">
                    We wanted to build a mechanism that is fair and transparent for all participants. No private sale, no backroom deals with VCs, all players are on a level playing field.
                    </p>
                    <p className="text-white text-opacity-50 text-base mb-4">
                    The mechanism is simple but robust. This makes it easier to build, use, and more importantly, harder to exploit.
                    </p>
                    {/*<p className="text-white font-bold leading-relaxed">
                      We believe all &quot;excess&quot; value should be captured
                      by token holders in the DAO.
                    </p>*/}
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
