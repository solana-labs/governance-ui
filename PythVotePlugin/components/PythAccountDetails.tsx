import { MintInfo } from '@solana/spl-token'
import BN from 'bn.js'
import useRealm from '@hooks/useRealm'
import { GoverningTokenType } from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { useEffect } from 'react'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
    useUserCommunityTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import VanillaWithdrawTokensButton from '@components/TokenBalance/VanillaWithdrawTokensButton'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import PythVotingPower from './PythVotingPower'

export const PYTH_INSTRUCTIONS = "You can deposit Pyth tokens at https://staking.pyth.network/. If you previously deposited tokens on https://app.realms.today/dao/PYTH, use the button below to withdraw them immediately. Those tokens have no voting power."

const TokenDeposit = ({
    mint,
    inAccountDetails,
    setHasGovPower,
}: {
    mint: MintInfo | undefined
    inAccountDetails?: boolean
    setHasGovPower?: (hasGovPower: boolean) => void
}) => {
    const wallet = useWalletOnePointOh()
    const connected = !!wallet?.connected

    const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
    const config = useRealmConfigQuery().data?.result

    const relevantTokenConfig = config?.account.communityTokenConfig
    const isMembership =
        relevantTokenConfig?.tokenType === GoverningTokenType.Membership

    const { realmTokenAccount } = useRealm()

    const depositTokenRecord = ownTokenRecord
    const depositTokenAccount = realmTokenAccount

    const hasTokensInWallet =
        depositTokenAccount && depositTokenAccount.account.amount.gt(new BN(0))

    const hasTokensDeposited =
        depositTokenRecord &&
        depositTokenRecord.account.governingTokenDepositAmount.gt(new BN(0))

    const availableTokens =
        depositTokenRecord && mint
            ? fmtMintAmount(
                mint,
                depositTokenRecord.account.governingTokenDepositAmount
            )
            : '0'

    useEffect(() => {
        if (availableTokens != '0' || hasTokensDeposited || hasTokensInWallet) {
            if (setHasGovPower) setHasGovPower(true)
        }
    }, [availableTokens, hasTokensDeposited, hasTokensInWallet, setHasGovPower])

    const canShowAvailableTokensMessage = hasTokensInWallet && connected
    const tokensToShow =
        hasTokensInWallet && depositTokenAccount
            ? fmtMintAmount(mint, depositTokenAccount.account.amount)
            : hasTokensInWallet
                ? availableTokens
                : 0

    // Do not show deposits for mints with zero supply because nobody can deposit anyway
    if (!mint || mint.supply.isZero()) {
        return null
    }

    return (
        <div className="w-full">
            {(availableTokens != '0' || inAccountDetails) && (
                <div className="flex items-center space-x-4">
                    <PythVotingPower className="w-full" role="community" />
                </div>
            )}

            <div
                className={`my-4 opacity-70 text-xs  ${canShowAvailableTokensMessage ? 'block' : 'hidden'
                    }`}
            >
                You have {tokensToShow} {hasTokensDeposited ? `more ` : ``} tokens available to deposit.
            </div>
            <div
                className={`my-4 opacity-70 text-xs`}
            >
                {PYTH_INSTRUCTIONS}
            </div>

            <div className="flex flex-col mt-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                {!isMembership && // Membership tokens can't be withdrawn (that is their whole point, actually)
                    inAccountDetails && (
                        <VanillaWithdrawTokensButton
                            role={
                                'community'
                            }
                        />
                    )}
            </div>
        </div>
    )
}

const PythAccountDetails = () => {
    const mint = useRealmCommunityMintInfoQuery().data?.result
    const wallet = useWalletOnePointOh()
    const connected = !!wallet?.connected
    const hasLoaded = mint

    return (
        <>
            {hasLoaded ? (
                <div className={`${`flex w-full gap-8 md:gap-12`}`}>
                    {!connected && (
                        <div className={'text-xs text-white/50 mt-8'}>
                            Connect your wallet to see governance power
                        </div>
                    )}
                    {(
                        <TokenDeposit
                            mint={mint}
                            inAccountDetails={true}
                        />
                    )}
                </div>
            ) : (
                <>
                    <div className="h-12 mb-4 rounded-lg animate-pulse bg-bkg-3" />
                    <div className="h-10 rounded-lg animate-pulse bg-bkg-3" />
                </>
            )}
        </>
    )
}

export default PythAccountDetails
