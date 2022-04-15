import { PopUpButtonBlack } from './Button'

const SplGov = () => {
  return (
    <div className="bg-cover bg-spl-gov h-fit w-480 py-10 pt-12 px-12">
      {/* <div className="bg-[url('/img/Spl-Gov-background.svg')]"> */}
      <div className="flex justify-start">
        <div>
          <img
            src="/img/realms-web/icons/Solana-logo-black.svg"
            className="mr-2 h-5"
          />
        </div>
        <div>
          <p className="text-black font-bold">The Solana Standard</p>
        </div>
      </div>
      <div className="">
        <h1 className="font-thin mt-8 mb-3">SPL Governance</h1>
        <p className="text-black">
          The Solana Program Library (SPL) is a collection of on-chain programs
          targeting the Sealevel parallel runtime. These programs are tested
          against Solana's implementation of Sealevel, solana-runtime, and
          deployed to its mainnet. As others implement Sealevel, we will
          graciously accept patches. The Token Swap Program allows simple
          trading of token pairs without a centralized limit order book. The
          program uses a mathematical formula called "curve" to calculate the
          price of all trades. Curves aim to mimic normal market dynamics: for
          example, as traders buy a lot of one token type, the value of the
          other token type goes up.
        </p>
        <div className="">
          <p className="mt-7 text-black">
            Solana has compiled a robust library of information to read.
          </p>
          {/* <button className="border border-500 border-white py-2 px-4 text-black text-xs font-medium"> */}
          <PopUpButtonBlack className="mt-4">
            Read about SPL Governance
          </PopUpButtonBlack>
        </div>
      </div>
    </div>
  )
}

export default SplGov
