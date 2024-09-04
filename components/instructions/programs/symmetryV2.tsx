import { Connection } from "@solana/web3.js"
import { BasketsSDK } from "@symmetry-hq/baskets-sdk"
import BufferLayout from 'buffer-layout'

const targetCompositionLayout = BufferLayout.seq(
  BufferLayout.u8(),
  15,
  'targetComposition'
);
const targetWeightsLayout = BufferLayout.seq(
  BufferLayout.u32(),
  15,
  'targetWeights'
);
const rebalanceAndLpLayout = BufferLayout.seq(
  BufferLayout.u8(),
  2,
  'rebalanceAndLp'
);


const SymmetryLogoLink = () => {
  return <a href="https://symmetry.fi" target="_blank" rel="noopener noreferrer">
  <svg width="48" height="48" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" rx="44" fill="#1A3FFF"/>
    <path d="M232.642 233.053L166.536 233.053C143.567 233.053 130.055 241.523 118.917 252.661C100.429 271.148 103.231 296.358 103.231 296.358L232.642 296.358L296.508 232.493L232.642 168.627L232.642 233.053Z" fill="white"/>
    <path d="M166.948 167.504L233.054 167.504C256.023 167.504 269.535 159.034 280.673 147.896C299.16 129.409 296.359 104.199 296.359 104.199L166.948 104.199L103.082 168.064L166.948 231.93L166.948 167.504Z" fill="white"/>
  </svg>
</a>
}

export const SYMMETRY_V2_INSTRUCTIONS = {
  "2KehYt3KsEQR53jYcxjbQp2d2kCp4AkuQW68atufRwSr": {
    78: {
      name: 'Symmetry: Withdraw from Basket',
      accounts: [
        { name: 'Withdrawer' },
        { name: 'Basket Address' },
        { name: 'Symmetry PDA' },
        { name: 'Withdraw Temporary State Account' },
        { name: 'Withdrawer Basket Token Account' },
        { name: 'Basket Token Mint' },
        { name: 'System Program' },
        { name: 'Token Program' },
        { name: 'Rent Program' },
        { name: 'Account' },
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {

        //@ts-ignore
        const { amount, rebalance } = BufferLayout.struct([
          BufferLayout.nu64('amount'),
          BufferLayout.nu64('rebalance')
        ]).decode(Buffer.from(data), 8)

        return (
          <div className="bg-black font-body text-gray-200 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <SymmetryLogoLink />
              <div className="flex flex-col">
                <p className="text-2xl m-0 font-semibold text-gray-100">Withdraw from Basket</p>
                <p className="text-gray-400 m-0">Basket Tokens will be burnt to redeem underlying assets:</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
                <dl className="space-y-2">
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400">Withdraw:</dt>
                    <dd className="font-medium text-2xl">{(amount / 10**6).toFixed(2)} Basket Tokens</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400">Rebalance to USDC:</dt>
                    <dd className="font-medium">
                      {rebalance === 2 ? 'Yes' : 'No - Withdraw Assets Directly'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          
        )
      },
    },
    251: {
      name: 'Symmetry: Deposit into Basket',
      accounts: [
        { name: 'Depositor' },
        { name: 'Basket Address' },
        { name: 'Basket Token Mint' },
        { name: 'Symmetry Token List' },
        { name: 'Symmetry PDA' },
        { name: 'USDC PDA Account' },
        { name: 'Depositor USDC Account' },
        { name: 'Manager USDC Account' },
        { name: 'Symmetry Fee Account' },
        { name: 'Host Platform USDC Account' },
        { name: 'Depositor Basket Token Account' },
        { name: 'Temporary State Account for Deposit' },
        { name: 'System Program' },
        { name: 'Token Program' },
        { name: 'Rent' },
        { name: 'Associated Token Program' },
        { name: 'Account' },
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {

        //@ts-ignore
        const { amount, rebalance } = BufferLayout.struct([
          BufferLayout.nu64('amount')
        ]).decode(Buffer.from(data), 8)

        return (
          <div className="bg-black font-body text-gray-200 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <SymmetryLogoLink />
              <div className="flex flex-col">
                <p className="text-2xl m-0 font-semibold text-gray-100">USDC Deposit Information</p>
                <p className="text-gray-400 m-0">After the deposit, basket tokens will be minted to the DAO.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
                <dl className="space-y-2">
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400">USDC Deposit Amount:</dt>
                    <dd className="font-medium text-2xl">{(amount / 10**6).toFixed(2)} USDC</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )
      },
    },
    38: {
      name: 'Symmetry: Edit Basket',
      accounts: [
        { name: 'Basket Manager' },
        { name: 'Basket Address' },
        { name: 'Symmetry Token List' },
        { name: 'Manager Fee Receiver Address' },
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {

        //@ts-ignore
        const { managerFee, rebalanceInterval, rebalanceThreshold, rebalanceSlippage, lpOffsetThreshold, rebalanceAndLp, numOfTokens, targetComposition, targetWeights } = BufferLayout.struct([
          BufferLayout.u16('managerFee'),
          BufferLayout.nu64('rebalanceInterval'),
          BufferLayout.u16('rebalanceThreshold'),
          BufferLayout.u16('rebalanceSlippage'),
          BufferLayout.u16('lpOffsetThreshold'),
          rebalanceAndLpLayout,
          BufferLayout.u8('numOfTokens'),
          targetCompositionLayout,
          targetWeightsLayout,
        ]).decode(Buffer.from(data), 8)

        const basketsSdk = await BasketsSDK.init(connection);
        const tokenData = basketsSdk.getTokenListData();
        let usdcIncluded = false;
        let totalWeight = 0; targetWeights.map(w => totalWeight += w);

        let composition = targetComposition.map((tokenId, i) => {
          let token = tokenData.filter(x => x.id == tokenId)[0]
          if(token.id === 0) {
            if(!usdcIncluded) {
              usdcIncluded = true;
              return {
                ...token,
                weight: targetWeights[i] / totalWeight * 100
              }
            }
          } else {
            return {
              ...token,
              weight: targetWeights[i] / totalWeight * 100
            }
          }
        }).filter(x => x != null)

        return (
          <div className="bg-black font-body text-gray-200 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <a href="https://symmetry.fi" target="_blank">
                <svg width="48" height="48" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="400" height="400" rx="44" fill="#1A3FFF"/>
                  <path d="M232.642 233.053L166.536 233.053C143.567 233.053 130.055 241.523 118.917 252.661C100.429 271.148 103.231 296.358 103.231 296.358L232.642 296.358L296.508 232.493L232.642 168.627L232.642 233.053Z" fill="white"/>
                  <path d="M166.948 167.504L233.054 167.504C256.023 167.504 269.535 159.034 280.673 147.896C299.16 129.409 296.359 104.199 296.359 104.199L166.948 104.199L103.082 168.064L166.948 231.93L166.948 167.504Z" fill="white"/>
                </svg>
              </a>
              <div className="flex flex-col">
                <p className="text-2xl m-0 font-semibold text-gray-100">Editing Basket Settings</p>
                <p className="text-gray-400 m-0">If the proposal passes, the basket will be edited to the following settings:</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Manager Fee:</dt>
                    <dd className="font-medium">{managerFee / 100}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Rebalance Check Interval:</dt>
                    <dd className="font-medium">{rebalanceInterval / 60} minutes</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Rebalance Trigger Threshold:</dt>
                    <dd className="font-medium">{rebalanceThreshold / 100}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Maximum Slippage Allowed During Rebalancing:</dt>
                    <dd className="font-medium">{rebalanceSlippage / 100}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Liquidity Provision Threshold:</dt>
                    <dd className="font-medium">{lpOffsetThreshold / 100}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Rebalancing Enabled:</dt>
                    <dd className="font-medium">{rebalanceAndLp[0] === 0 ? "Yes" : "No"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Liquidity Provision Enabled:</dt>
                    <dd className="font-medium">{rebalanceAndLp[1] === 0 ? "Yes" : "No"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Basket Composition Size:</dt>
                    <dd className="font-medium">{numOfTokens} Tokens</dd>
                  </div>
                </dl>
              </div>
              <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
                <h3 className="text-lg font-medium mb-2 text-gray-100">Basket Composition:</h3>
                <ul className="space-y-2">
                  {composition.map((compItem, i) => (
                    <li key={i} className="w-full grid grid-cols-3">
                      <p className="text-gray-400 text-left">{compItem.symbol}</p>
                      <p className="font-medium text-left">{compItem.weight}%</p>
                      <a
                        className="text-xs text-right text-cyan-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://solscan.io/token/${compItem.tokenMint}`}
                      >
                        ({compItem.tokenMint.slice(0,6)}...)
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      },
    },
    47: {
      name: 'Symmetry: Create Basket',
      accounts: [
        { name: 'Manager' },
        { name: 'Token List' },
        { name: 'Basket Address' },
        { name: 'Symmetry PDA' },
        { name: 'Basket Token Mint' },
        { name: 'Symmetry Fee Collector' },
        { name: 'Metadata Account' },
        { name: 'Metadata Program' },
        { name: 'System Program' },
        { name: 'Token Program' },
        { name: 'Rent' },
        { name: 'Host Platform' },
        { name: 'Fee Collector Address' },
        { name: 'Account' },
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {
        //@ts-ignore
        const { managerFee, hostFee, basketType,rebalanceInterval, rebalanceThreshold, rebalanceSlippage, lpOffsetThreshold, rebalanceAndLp, numOfTokens, targetComposition, targetWeights, } = BufferLayout.struct([
          BufferLayout.u16('managerFee'),
          BufferLayout.u16('hostFee'),
          BufferLayout.u8('basketType'),
          BufferLayout.nu64('rebalanceInterval'),
          BufferLayout.u16('rebalanceThreshold'),
          BufferLayout.u16('rebalanceSlippage'),
          BufferLayout.u16('lpOffsetThreshold'),
          rebalanceAndLpLayout,
          BufferLayout.u8('numOfTokens'),
          targetCompositionLayout,
          targetWeightsLayout,
        ]).decode(Buffer.from(data), 8)
        const getBasketType = (type) => {
          switch (type) {
            case 0: return "Bundle";
            case 1: return "Portfolio";
            case 2: return "Private";
            default: return "Unknown";
          }
        };

        let basketsSdk = await BasketsSDK.init(connection);
        let tokenData = basketsSdk.getTokenListData();
        let usdcIncluded = false;
        let totalWeight = 0; targetWeights.map(w => totalWeight += w);

        let composition = targetComposition.map((tokenId, i) => {
          let token = tokenData.filter(x => x.id == tokenId)[0]
          if(token.id === 0) {
            if(!usdcIncluded) {
              usdcIncluded = true;
              return {
                ...token,
                weight: targetWeights[i] / totalWeight * 100
              }
            }
          } else
          return {
            ...token,
            weight: targetWeights[i] / totalWeight * 100
          }
        }).filter(x => x != null)

        return (
          <div className="bg-black font-body text-gray-200 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <a href="https://symmetry.fi" target="_blank" rel="noopener noreferrer">
                <svg width="48" height="48" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="400" height="400" rx="44" fill="#1A3FFF"/>
                  <path d="M232.642 233.053L166.536 233.053C143.567 233.053 130.055 241.523 118.917 252.661C100.429 271.148 103.231 296.358 103.231 296.358L232.642 296.358L296.508 232.493L232.642 168.627L232.642 233.053Z" fill="white"/>
                  <path d="M166.948 167.504L233.054 167.504C256.023 167.504 269.535 159.034 280.673 147.896C299.16 129.409 296.359 104.199 296.359 104.199L166.948 104.199L103.082 168.064L166.948 231.93L166.948 167.504Z" fill="white"/>
                </svg>
              </a>
              <div className="flex flex-col">
                <p className="text-2xl m-0 font-semibold text-gray-100">Creating a Basket</p>
                <p className="text-gray-400 m-0">If the proposal passes, a basket will be created with the following settings:</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Manager Fee:</dt>
                    <dd className="font-medium">{managerFee / 100}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Host Platform Fee:</dt>
                    <dd className="font-medium">{hostFee / 100}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Basket Type:</dt>
                    <dd className="font-medium">{getBasketType(basketType)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Rebalance Check Interval:</dt>
                    <dd className="font-medium">{rebalanceInterval / 60} minutes</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Rebalance Trigger Threshold:</dt>
                    <dd className="font-medium">{rebalanceThreshold / 100}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Maximum Slippage Allowed During Rebalancing:</dt>
                    <dd className="font-medium">{rebalanceSlippage / 100}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Liquidity Provision Threshold:</dt>
                    <dd className="font-medium">{lpOffsetThreshold / 100}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Rebalancing Enabled:</dt>
                    <dd className="font-medium">{rebalanceAndLp[0] === 0 ? "Yes" : "No"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Liquidity Provision Enabled:</dt>
                    <dd className="font-medium">{rebalanceAndLp[1] === 0 ? "Yes" : "No"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Basket Composition Size:</dt>
                    <dd className="font-medium">{numOfTokens} Tokens</dd>
                  </div>
                </dl>
              </div>
              <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
                <h3 className="text-lg font-medium mb-2 text-gray-100">Basket Composition:</h3>
                <ul className="space-y-2">
                  {composition.map((compItem, i) => (
                    <li key={i} className="w-full grid grid-cols-3">
                      <p className="text-gray-400 text-left">{compItem.symbol}</p>
                      <p className="font-medium text-left">{compItem.weight}%</p>
                      <a
                        className="text-xs text-right text-cyan-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://solscan.io/token/${compItem.tokenMint}`}
                      >
                        ({compItem.tokenMint.slice(0,6)}...)
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      },
    },
  },
}