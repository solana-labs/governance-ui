import React, { Dispatch, SetStateAction } from 'react'
import Button, { SecondaryButton } from './Button'
import XCircleIcon from './XCircleIcon'
import CheckCircleIcon from './CheckCircleIcon'

import useQueryContext from '@hooks/useQueryContext'

type ProposalTransactionNotificationProps = {
  details: string
  setDetails: Dispatch<SetStateAction<string>>
  txIdHash: string
}

export const ProposalTransactionNotification = ({
  details,
  setDetails,
  txIdHash,
}: ProposalTransactionNotificationProps) => {
  const { fmtUrlWithCluster } = useQueryContext()
  return (
    <>
      {details && (
        <>
          {details === 'success' ? (
            <div className="w-full flex flex-col items-center gap-y-4 mt-9">
              <CheckCircleIcon className={''} />
              <div className="text-center ">
                The transaction was made successfully
              </div>

              <div className="w-full flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
                <Button
                  onClick={() => setDetails('')}
                  className="sm:w-1/2 text-[16px]"
                >
                  Ok
                </Button>
                <SecondaryButton
                  onClick={() => {
                    window.open(
                      `https://explorer.solana.com/tx/${fmtUrlWithCluster(
                        txIdHash
                      )}`
                    )
                  }}
                  className="sm:w-1/2"
                >
                  See details
                </SecondaryButton>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-y-4 mt-9">
              <XCircleIcon className={''} />
              <div className="text-center ">{details} Please try again</div>
              <div className="w-full flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4 justify-center">
                <Button onClick={() => setDetails('')} className="sm:w-1/2">
                  Try Again
                </Button>
                {txIdHash && (
                  <SecondaryButton
                    onClick={() => {
                      window.open(
                        `https://explorer.solana.com/tx/${fmtUrlWithCluster(
                          txIdHash
                        )}`
                      )
                    }}
                    className="sm:w-1/2"
                  >
                    See details
                  </SecondaryButton>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
