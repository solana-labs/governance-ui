import { BN, web3 } from '@project-serum/anchor'
import { AccountMetaData } from '@solana/spl-governance'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenPriceService from '@utils/services/tokenPrice'
import { parseMintAccountData, parseTokenAccountData } from '@utils/tokens'
import { InstructionDescriptorFactory } from '../tools'

const common_instructions = (
  programId: web3.PublicKey
): Record<number, InstructionDescriptorFactory> => ({
  72: {
    name: 'Initialize Trade',
    accounts: [
      { name: 'Payer' },
      { name: 'Collateral Account' },
      { name: 'Source Mint' },
      { name: 'Strategy' },
      { name: 'Reclaim Account' },
      { name: 'Deposit Account' },
      { name: 'Token Program' },
      { name: 'System Program' },
    ],
    getDataUI: async (
      connection: web3.Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const tokenList = tokenPriceService._tokenList
      const _transferAmount = new BN(data.slice(8, 16), 'le')
      const _boundedPriceNumerator = new BN(data.slice(16, 24), 'le')
      const _boundedPriceDenominator = new BN(data.slice(24, 32), 'le')
      const _reclaimDate = new BN(data.slice(32, 40), 'le')

      // Get the mint information from the source token. This assumes the destination account was created in a prerequisite instruction
      const destinationTokenAccountInfo = await connection.getAccountInfo(
        accounts[5].pubkey
      )
      const destinationTokenAccount = parseTokenAccountData(
        accounts[5].pubkey,
        destinationTokenAccountInfo!.data
      )

      // Get the mint information from the destination token
      const [
        sourceMintInfo,
        destinationMintInfo,
      ] = await connection.getMultipleAccountsInfo([
        accounts[2].pubkey,
        destinationTokenAccount.mint,
      ])
      const sourceMint = parseMintAccountData(sourceMintInfo!.data)
      const destinationMint = parseMintAccountData(destinationMintInfo!.data)

      const transferAmount = getMintDecimalAmountFromNatural(
        sourceMint,
        _transferAmount
      )
      const boundedPriceNumerator = getMintDecimalAmountFromNatural(
        sourceMint,
        _boundedPriceNumerator
      )
      const boundedPriceDenominator = getMintDecimalAmountFromNatural(
        destinationMint,
        _boundedPriceDenominator
      )
      const limitPrice = boundedPriceDenominator.dividedBy(
        boundedPriceNumerator
      )

      const sourceToken = tokenList.find(
        (x) => x.address === accounts[2].pubkey.toString()
      )
      const destinationToken = tokenList.find(
        (x) => x.address === destinationTokenAccount.mint.toString()
      )

      const reclaimDate = new Date(_reclaimDate.toNumber() * 1_000)

      return (
        <div className="space-y-3">
          <div>
            Transfer Amount: {transferAmount.toFormat()} {sourceToken?.symbol}
          </div>
          <div>
            Limit Price: {limitPrice.toFormat()} {destinationToken?.symbol} per{' '}
            {sourceToken?.symbol}
          </div>
          <div>Expiration: {reclaimDate.toUTCString()}</div>
        </div>
      )
    },
  },
})

export const POSEIDON_INSTRUCTIONS = {
  Euq2W1fbG8nYqErqp9dJekesj67p3B4y78aDYbgzVuj1: common_instructions(
    new web3.PublicKey('Euq2W1fbG8nYqErqp9dJekesj67p3B4y78aDYbgzVuj1')
  ),
  oBRem4fksRF79j3wRkqMHdJfTzxbEEd73JgN3mFQjSK: common_instructions(
    new web3.PublicKey('oBRem4fksRF79j3wRkqMHdJfTzxbEEd73JgN3mFQjSK')
  ),
}
