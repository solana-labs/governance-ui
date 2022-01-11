import React from 'react'
import Button, { SecondaryButton } from '@components/Button'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'

const StepThree = ({ dataCreation, setSelectedStep }) => {
  const router = useRouter()

  return (
    <div className="w-full max-w-xl mt-16 rounded-xl">
      {dataCreation.error ? (
        <>
          <div className="flex justify-center gap-x-3 items-start">
            <XCircleIcon className="w-12 h-12 text-red" />

            <div className="flex gap-y-2 flex-col">
              <h2>Could not create proposal</h2>

              {`${dataCreation.error}`}

              <div className="flex justify-center gap-x-4 mt-4 items-center">
                <Button
                  className="w-36 flex justify-center items-center"
                  onClick={() => setSelectedStep(0)}
                >
                  Try again
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center gap-x-3 items-start">
            <CheckCircleIcon className="w-12 h-12 text-green" />

            <div className="flex gap-y-2 flex-col">
              <h2>Proposal created successfully</h2>

              <p>Share the link to your proposal for members start voting</p>

              <div className="flex justify-center gap-x-4 mt-4 items-center">
                <SecondaryButton
                  className="md:w-44 w-32"
                  onClick={() => {
                    navigator.clipboard.writeText(`${dataCreation.url}`)
                  }}
                >
                  Copy link
                </SecondaryButton>

                <Button
                  className="md:w-44 w-32 flex justify-center items-center"
                  onClick={() => {
                    router.push(dataCreation.url)
                  }}
                >
                  See proposal
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default StepThree
