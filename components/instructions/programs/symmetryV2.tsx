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
          <>
            <p>Withdraw Amount: {amount / 10**6}</p>
            <p>Rebalance to USDC: {rebalance === 2 ? 'Yes' : 'No - Withdraw Assets Directly'}</p>
          </>
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
          <>
            <p>USDC Deposit Amount: {amount / 10**6}</p>
          </>
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
          <>
            <p>Manager Fee: {managerFee / 100}%</p>
            <p>Rebalance Check Interval: {rebalanceInterval / 60} minutes</p>
            <p>Rebalance Trigger Threshold: {rebalanceThreshold / 100}%</p>
            <p>Maximum Slippage Allowed During Rebalancing: {rebalanceSlippage / 100}%</p>
            <p>Liquidity Provision Threshold: {lpOffsetThreshold / 100}%</p>
            <p>Rebalancing Enabled: {rebalanceAndLp[0] === 0 ? "Yes" : "No"}</p>
            <p>Liquidity Provision Enabled: {rebalanceAndLp[1] === 0 ? "No" : "Yes"}</p>
            <p>Basket Composition Size: {numOfTokens} Tokens</p>
            <div className="text-sm">
              Basket Composition:
              {
                composition.map((compItem, i) => {
                  return <div className="flex items-center">
                    <p className="text-sm">{compItem.weight}% {compItem.symbol} <a className="text-blue" target="_blank" href={"https://solscan.io/token/"+compItem.tokenMint}>({compItem.tokenMint.slice(0,6)}...)</a></p>
                  </div>
                })
              }
            </div>
          </>
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
          <>
            <p>Manager Fee: {managerFee / 100}%</p>
            <p>Host Platform Fee: {hostFee / 100}%</p>
            <p>Basket Type: {basketType === 0 ? "Bundle" : basketType === 1 ? "Portfolio" : "Private"}</p>
            <p>Rebalance Check Interval: {rebalanceInterval / 60} minutes</p>
            <p>Rebalance Trigger Threshold: {rebalanceThreshold / 100}%</p>
            <p>Maximum Slippage Allowed During Rebalancing: {rebalanceSlippage / 100}%</p>
            <p>Liquidity Provision Threshold: {lpOffsetThreshold / 100}%</p>
            <p>Rebalancing Enabled: {rebalanceAndLp[0] === 0 ? "Yes" : "No"}</p>
            <p>Liquidity Provision Enabled: {rebalanceAndLp[1] === 0 ? "No" : "Yes"}</p>
            <p>Basket Composition Size: {numOfTokens} Tokens</p>
            <div className="text-sm">
              Basket Composition:
              {
                composition.map((compItem, i) => {
                  return <div className="flex items-center">
                    <p className="text-sm">{compItem.weight}% {compItem.symbol} <a className="text-blue" target="_blank" href={"https://solscan.io/token/"+compItem.tokenMint}>({compItem.tokenMint.slice(0,6)}...)</a></p>
                  </div>
                })
              }
            </div>
          </>
        )
      },
    },
  },
}