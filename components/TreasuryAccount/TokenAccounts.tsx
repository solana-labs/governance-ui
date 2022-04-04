import Button from '@components/Button'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { fmtTokenInfoWithMint } from '@tools/sdk/units'
import React from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { GenericSendTokensProps } from './GenericSendTokens'
import LoadingRows from './LoadingRows'

const TokenAccounts: React.FC<{
  setSendTokenInfo: React.Dispatch<
    React.SetStateAction<GenericSendTokensProps | null>
  >
}> = ({ setSendTokenInfo }) => {
  const { canUseTransferInstruction } = useGovernanceAssets()
  const tokenAccounts = useTreasuryAccountStore((s) => s.allTokenAccounts)
  const isLoadingTokenAccounts = useTreasuryAccountStore(
    (s) => s.isLoadingTokenAccounts
  )
  return (
    <div>
      {isLoadingTokenAccounts ? (
        <LoadingRows />
      ) : tokenAccounts.length > 0 ? (
        tokenAccounts.map((tokenAccount, index) => (
          <div
            key={index.toString()}
            className="border border-fgd-4 default-transition flex items-center justify-between rounded-md p-4 text-sm text-th-fgd-1 mb-2"
          >
            <div>{fmtTokenInfoWithMint(tokenAccount)}</div>
            <div>
              <Button
                tooltipMessage={
                  !canUseTransferInstruction
                    ? 'You need to have connected wallet with ability to create token transfer proposals'
                    : ''
                }
                className="w-full"
                onClick={() =>
                  setSendTokenInfo({
                    mintDecimals: tokenAccount.mintInfo.decimals,
                    tokenSource: tokenAccount.key,
                    mintBeingTransferred: tokenAccount.mint,
                    tokenAccount,
                  })
                }
                disabled={!canUseTransferInstruction}
              >
                Send
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="border border-fgd-4 p-4 rounded-md">
          <p className="text-center text-fgd-3">No Token Accounts Found</p>
        </div>
      )}
    </div>
  )
}

export default TokenAccounts
