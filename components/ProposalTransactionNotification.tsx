import React, { useState, Dispatch, SetStateAction } from 'react'
import Button, { SecondaryButton } from './Button'
import XCircleIcon from './XCircleIcon'
import CheckCircleIcon from './CheckCircleIcon'
type ProposalTransactionNotificationProps = {
  details: string
  setDetails: Dispatch<SetStateAction<string>>
}

export const ProposalTransactionNotification = ({
  details,
  setDetails,
}: ProposalTransactionNotificationProps) => {
  const [expandDetails, setExpandDetails] = useState<boolean>(false)
  return (
    <>
      {details && details === 'success' ? (
        <div className="w-full flex flex-col items-center gap-y-6">
          <CheckCircleIcon className={''} />
          <div>The transaction was made successfully</div>

          <Button onClick={() => setDetails('')} className="w-1/2">
            OK
          </Button>
        </div>
      ) : (
        <>
          <XCircleIcon className={''} />
          <div>Transaction Failed, please try again</div>
          <div className="w-full flex  gap-x-2.5">
            <Button onClick={() => setDetails('')} className="w-1/2">
              Ok
            </Button>
            <SecondaryButton
              onClick={() => setExpandDetails(!expandDetails)}
              className="w-1/2"
            >
              See details
            </SecondaryButton>
          </div>

          {expandDetails && <div className="w-full  ">{details}</div>}
        </>
      )}
    </>
  )
}
