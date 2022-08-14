import React, { useEffect, useState } from 'react'
import { XCircleIcon, PlusCircleIcon } from '@heroicons/react/outline'

import { Token, Sol } from '@models/treasury/Asset'
import {
  useAccountInvestments,
  ActiveInvestment,
} from '@hooks/useAccountInvestments'
import { Status } from '@utils/uiTypes/Result'
import { StrategyCard } from '@components/TreasuryAccount/AccountOverview'
import DepositModal from 'Strategies/components/DepositModal'
import Modal from '@components/Modal'
import ConvertToMsol from '@components/TreasuryAccount/ConvertToMsol'
import ConvertToStSol from '@components/TreasuryAccount/ConvertToStSol'
import TradeOnSerum from '@components/TreasuryAccount/TradeOnSerum'

interface Props {
  className?: string
  asset: Token | Sol
  governanceAddress?: string
}

export default function Investments(props: Props) {
  const [showAvailableInvestments, setShowAvailableInvestments] = useState(
    false
  )

  const [
    proposedInvestment,
    setProposedInvestment,
  ] = useState<ActiveInvestment | null>(null)

  const [alternativeInvestment, setAlternativeInvestment] = useState<
    'Marinade' | 'Lido' | 'Serum' | null
  >(null)

  const investments = useAccountInvestments({
    asset: props.asset,
    governanceAddress: props.governanceAddress,
  })

  useEffect(() => {
    if (investments.status === Status.Ok) {
      setShowAvailableInvestments(!investments.data.activeInvestments.length)
    }
  }, [investments])

  switch (investments.status) {
    case Status.Failed:
      return (
        <div className={props.className}>
          <header className="flex items-center justify-between mb-3">
            <div className="bg-bkg-1 rounded-sm text-lg opacity-50 w-32">
              &nbsp;
            </div>
            <div className="bg-bkg-1 rounded-sm text-sm opacity-50 w-32">
              &nbsp;
            </div>
          </header>
          <section className="overflow-y-auto flex-grow space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="h-[71px] rounded bg-bkg-1 opacity-50" key={i} />
            ))}
          </section>
        </div>
      )
    case Status.Pending:
      return (
        <div className={props.className}>
          <header className="flex items-center justify-between mb-3">
            <div className="bg-bkg-1 rounded-sm text-lg animate-pulse w-32">
              &nbsp;
            </div>
            <div className="bg-bkg-1 rounded-sm text-sm animate-pulse w-32">
              &nbsp;
            </div>
          </header>
          <section className="overflow-y-auto flex-grow space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                className="h-[71px] rounded bg-bkg-1 animate-pulse"
                key={i}
              />
            ))}
          </section>
        </div>
      )
    default: {
      const deposits = investments.data.activeInvestments.reduce(
        (acc, account) => ({
          ...acc,
          [account.protocolName]:
            (acc[account.protocolName] ?? 0) + account.investedAmount,
        }),
        {}
      )

      return (
        <div className={props.className}>
          <header className="flex items-center justify-between mb-3">
            <div className="text-fgd-1 text-lg font-bold">
              {showAvailableInvestments
                ? 'Available Investments'
                : 'Active Investments'}
            </div>
            <button
              className="flex items-center text-primary-light text-sm space-x-1"
              onClick={() => setShowAvailableInvestments((current) => !current)}
            >
              {showAvailableInvestments ? (
                <XCircleIcon className="h-4 w-4" />
              ) : (
                <PlusCircleIcon className="h-4 w-4" />
              )}
              <div>{showAvailableInvestments ? 'Close' : 'New investment'}</div>
            </button>
          </header>
          <section className="space-y-4">
            {showAvailableInvestments ? (
              investments.data.potentialInvestments.length ? (
                investments.data.potentialInvestments.map((investment, i) => (
                  <StrategyCard
                    key={investment.handledTokenSymbol + i}
                    currentDeposits={deposits[investment.protocolName] ?? 0}
                    strat={investment}
                    onClick={() => {
                      switch (investment.protocolName) {
                        case 'Marinade':
                        case 'Lido':
                        case 'Serum': {
                          setAlternativeInvestment(investment.protocolName)
                          setProposedInvestment(null)
                          break
                        }
                        default: {
                          setAlternativeInvestment(null)
                          setProposedInvestment({
                            ...investment,
                            investedAmount:
                              deposits[investment.protocolName] ?? 0,
                          })
                        }
                      }
                    }}
                  />
                ))
              ) : (
                <div className="rounded h-[71px] flex items-center justify-center text-white/50 border-white/50 border text-sm">
                  No potential investments available for this asset
                </div>
              )
            ) : investments.data.activeInvestments.length ? (
              investments.data.activeInvestments.map((investment, i) => (
                <StrategyCard
                  key={investment.handledTokenSymbol + i}
                  strat={investment}
                  currentDeposits={investment.investedAmount}
                />
              ))
            ) : (
              <div className="rounded h-[71px] flex items-center justify-center text-white/30 border-white/30 border text-sm">
                No active investments for this asset
              </div>
            )}
          </section>
          {proposedInvestment && (
            <DepositModal
              governedTokenAccount={props.asset.raw}
              mangoAccounts={investments.data.mangoAccounts}
              currentPosition={proposedInvestment.investedAmount}
              apy={proposedInvestment.apy}
              handledMint={proposedInvestment.handledMint}
              onClose={() => {
                setProposedInvestment(null)
              }}
              proposedInvestment={proposedInvestment}
              protocolName={proposedInvestment.protocolName}
              protocolLogoSrc={proposedInvestment.protocolLogoSrc}
              handledTokenName={proposedInvestment.handledTokenSymbol}
              strategyName={proposedInvestment.strategyName}
              createProposalFcn={proposedInvestment.createProposalFcn}
            />
          )}
          {alternativeInvestment === 'Marinade' && (
            <Modal
              isOpen
              sizeClassName="sm:max-w-3xl"
              onClose={() => setAlternativeInvestment(null)}
            >
              <ConvertToMsol />
            </Modal>
          )}
          {alternativeInvestment === 'Lido' && (
            <Modal
              isOpen
              sizeClassName="sm:max-w-3xl"
              onClose={() => setAlternativeInvestment(null)}
            >
              <ConvertToStSol />
            </Modal>
          )}
          {alternativeInvestment === 'Serum' && (
            <Modal
              isOpen
              sizeClassName="sm:max-w-3xl"
              onClose={() => setAlternativeInvestment(null)}
            >
              <TradeOnSerum tokenAccount={props.asset.raw} />
            </Modal>
          )}
        </div>
      )
    }
  }
}
