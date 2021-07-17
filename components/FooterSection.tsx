import MangoPill from '../components/MangoPill'
import Button from './Button'

const FooterSection = () => {
  return (
    <div className="bg-bg-texture bg-cover bg-bottom bg-no-repeat">
      <div className="max-w-7xl mx-auto ">
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
            <h2 className="inline text-3xl font-extrabold sm:block sm:text-4xl">
              Want product news and updates?{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mango-red via-mango-yellow to-mango-green sm:block sm:text-4xl">
                Sign up for our newsletter.
              </span>
            </h2>

            <form className="mt-8 sm:flex">
              <label className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-5 py-2 placeholder-gray-500 sm:max-w-xs border-gray-300 rounded-full"
                placeholder="Enter your email"
              />
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <Button><span className="">Sign me up!</span></Button>
              </div>
            </form>
            <div className="w-full mt-4">
              <p className="text-xl text-gray-400">
                We promise to never spam and only send alpha.
              </p>
            </div>
          </div>
        </section>

        <footer className="py-20">
          <div className="container px-4 mx-auto">
            <div className="flex flex-wrap -mx-4 mb-8 lg:mb-16">
              <div className="w-full lg:w-1/3 px-4 mb-12 lg:mb-0">
                <a className="text-gray-600 text-2xl leading-none" href="#">
                  <img
                    className="h-8"
                    src="img/logoMango.png"
                    alt=""
                    width="auto"
                  />
                </a>
                <p className="mt-5 mb-6 max-w-xs text-gray-500 leading-loose">
                  Mango is a decentralized autonomous organization.{' '}
                </p>
                <div>
                  <a
                    className="inline-block h-6 mr-8"
                    href="https://github.com/blockworks-foundation"
                  >
                    <img className="mx-auto" src="socials/github.svg" />
                  </a>
                  <a
                    className="inline-block h-6 mr-8"
                    href="https://discord.gg/67jySBhxrg"
                  >
                    <img className="mx-auto" src="socials/discord.svg" />
                  </a>
                  <a
                    className="inline-block h-6"
                    href="https://twitter.com/mangomarkets"
                  >
                    <img className="mx-auto" src="socials/twitter.svg" />
                  </a>
                </div>
              </div>
              <div className="w-full lg:w-2/3 px-4">
                <div className="flex flex-wrap justify-between">
                  <div className="w-1/2 lg:w-1/4 mb-8 lg:mb-0">
                    <h3 className="mb-6 text-lg font-bold font-heading">
                      Products
                    </h3>
                    <ul className="text-sm">
                      <li className="mb-4">
                        <a
                          className="text-gray-500 hover:text-gray-600"
                          href="https://trade.mango.markets/"
                        >
                          Spot Markets
                        </a>
                      </li>
                      <li className="mb-4">
                        <a
                          className="text-gray-500 hover:text-gray-600"
                          href="#"
                        >
                          Perpetual Futures
                        </a>{' '}
                        <MangoPill />
                      </li>
                      <li className="mb-4">
                        <a
                          className="text-gray-500 hover:text-gray-600"
                          href="https://trade.mango.markets/borrow"
                        >
                          Decentralized Lending
                        </a>
                      </li>
                      <li className="mb-4">
                        <a
                          className="text-gray-500 hover:text-gray-600"
                          href="#"
                        >
                          Liquidator Program
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="w-1/2 lg:w-1/4 mb-8 lg:mb-0">
                    <h3 className="mb-6 text-lg font-bold font-heading">
                      Developers
                    </h3>
                    <ul className="text-sm">
                      <li className="mb-4">
                        <a
                          className="text-gray-500 hover:text-gray-600"
                          href="https://docs.mango.markets/"
                        >
                          Explore the docs
                        </a>
                      </li>
                      <li className="mb-4">
                        <a
                          className="text-gray-500 hover:text-gray-600"
                          href="https://trello.com/c/0iz8GfW6/32-how-to-use-this-board"
                        >
                          Start contributing
                        </a>
                      </li>
                      <li className="mb-4">
                        <a
                          className="text-gray-500 hover:text-gray-600"
                          href="https://gitlab.com/OpinionatedGeek/mango-explorer/-/blob/master/mango/marketmaking/simplemarketmaker.py"
                        >
                          Become a market maker
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="w-1/2 lg:w-1/4">
                    <h3 className="mb-6 text-lg font-bold font-heading">
                      Contact
                    </h3>
                    <ul className="text-sm">
                      <li className="mb-4">
                        <a
                          className="text-gray-500 hover:text-gray-600"
                          href="https://discord.gg/67jySBhxrg"
                        >
                          Discord
                        </a>
                      </li>
                      <li className="mb-4">
                        <a
                          className="text-gray-500 hover:text-gray-600"
                          href="https://twitter.com/mangomarkets"
                        >
                          Twitter
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-8">
              <p className="lg:text-center text-sm text-gray-400">
                All rights reserved &copy; Blockworks Foundation 2021
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default FooterSection
