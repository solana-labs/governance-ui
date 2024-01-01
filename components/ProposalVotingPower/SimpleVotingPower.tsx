import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useConnection } from '@solana/wallet-adapter-react'
import { getVanillaGovpower } from '@hooks/queries/governancePower'
import { useAsync } from 'react-async-hook'
import BN from 'bn.js'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import VotingPowerPct from '@components/ProposalVotingPower/VotingPowerPct'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'
import { abbreviateAddress } from '@utils/formatting'
import clsx from 'clsx'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { GoverningTokenType } from '@solana/spl-governance'

interface Props {
    className?: string
    role: 'community' | 'council',
    votingPower?: BN,
    hideIfZero?: boolean
    children?: React.ReactNode
}

export default function SimpleVotingPower({
    role,
    hideIfZero,
    votingPower,
    children,
    ...props
}: Props) {
    const totalAmount = votingPower ?? new BN(0);

    const realm = useRealmQuery().data?.result
    const realmConfig = useRealmConfigQuery().data?.result
    const disabled =
        role === 'community'
            ? realmConfig?.account.communityTokenConfig.tokenType ===
            GoverningTokenType.Dormant
            : realmConfig?.account.councilTokenConfig.tokenType ===
            GoverningTokenType.Dormant

    const relevantMint =
        role === 'community'
            ? realm?.account.communityMint
            : realm?.account.config.councilMint

    const tokenName =
        getMintMetadata(relevantMint)?.name ?? realm?.account.name ?? ''

    const mintInfo = useMintInfoByPubkeyQuery(relevantMint).data?.result

    const formattedTotal = useMemo(
        () =>
            mintInfo && votingPower !== undefined
                ? new BigNumber(votingPower.toString())
                    .shiftedBy(-mintInfo.decimals)
                    .toString()
                : undefined,
        [votingPower, mintInfo]
    )

    const { connection } = useConnection()
    // If the user is using a delegator, we want to show that and not count the other delegators
    const selectedDelegator = useSelectedDelegatorStore((s) =>
        role === 'community' ? s.communityDelegator : s.councilDelegator
    )

    const torsDelegatedToUser = useTokenOwnerRecordsDelegatedToUser()

    const { result: delegatorsAmount } = useAsync(
        async () =>
            selectedDelegator !== undefined
                ? new BN(0)
                : torsDelegatedToUser === undefined || relevantMint === undefined
                    ? undefined
                    : (
                        await Promise.all(
                            torsDelegatedToUser
                                .filter((x) =>
                                    x.account.governingTokenMint.equals(relevantMint)
                                )
                                .map((x) => getVanillaGovpower(connection, x.pubkey))
                        )
                    ).reduce((partialSum, a) => partialSum.add(a), new BN(0)),
        [connection, relevantMint, selectedDelegator, torsDelegatedToUser]
    )
    const formattedDelegatorsAmount = useMemo(
        () =>
            mintInfo && delegatorsAmount !== undefined
                ? new BigNumber(delegatorsAmount.toString())
                    .shiftedBy(-mintInfo.decimals)
                    .toString()
                : undefined,
        [delegatorsAmount, mintInfo]
    )

    return (
        <div
            className={clsx(
                props.className,
                hideIfZero && totalAmount.isZero() && 'hidden',
                disabled && 'hidden'
            )}
        >
            <div className={'p-3 rounded-md bg-bkg-1'}>
                <div className="text-fgd-3 text-xs">
                    {tokenName}
                    {role === 'council' ? ' Council' : ''} Votes
                </div>
                <div className="flex items-center justify-between mt-1">
                    <div className=" flex flex-row gap-x-2">
                        <div className="text-xl font-bold text-fgd-1 hero-text">
                            {formattedTotal ?? 0}
                        </div>
                        <div className="text-xs text-fgd-3">
                            {selectedDelegator !== undefined ? (
                                // if we're acting as a specific delegator, show that instead of the delegator aggregation
                                <>(as {abbreviateAddress(selectedDelegator)})</>
                            ) : formattedDelegatorsAmount !== undefined &&
                                formattedDelegatorsAmount !== '0' ? (
                                <>({formattedDelegatorsAmount} from delegators)</>
                            ) : null}
                        </div>
                    </div>

                    {mintInfo && (
                        <VotingPowerPct
                            amount={new BigNumber(totalAmount.toString())}
                            total={new BigNumber(mintInfo.supply.toString())}
                        />
                    )}
                </div>
            </div>
            {children}
        </div>
    )
}
