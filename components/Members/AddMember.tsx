import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  ArrowLeftIcon,
} from '@heroicons/react/outline'
import { ViewState } from './types'
import useMembersListStore from 'stores/useMembersListStore'
import { ProgramAccount } from '@project-serum/anchor'
import { PublicKey, AccountInfo } from '@solana/web3.js'
import { SendTokenCompactViewForm } from '@utils/uiTypes/proposalCreationTypes'
import { useState } from 'react'
import useRealm from '@hooks/useRealm'
import Input from '@components/inputs/Input'
import Button, { SecondaryButton } from '@components/Button'
import Textarea from '@components/inputs/Textarea'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'

const AddMember = () => {
  const { setCurrentCompactView, resetCompactViewState } = useMembersListStore()
  const { realmInfo, canChooseWhoVote } = useRealm()
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<any>({
    destinationAccount: '',
    amount: 1,
    programId: programId?.toString(),
    title: '',
    description: '',
  })
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const proposalTitle = `Mint ${form.amount} to ${form.destinationAccount}`

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
  }
  const handlePropose = () => {}
  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">
        <>
          <ArrowLeftIcon
            onClick={handleGoBackToMainView}
            className="h-4 w-4 mr-1 text-primary-light mr-2"
          />
          Add new member
        </>
      </h3>
      <div className="space-y-4">
        <Input
          label="Destination account"
          value={form.destinationAccount}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'destinationAccount',
            })
          }
          noMaxWidth={true}
          error={formErrors['destinationAccount']}
        />
        <div
          className={'flex items-center hover:cursor-pointer w-24 mt-3'}
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? (
            <ArrowCircleUpIcon className="h-4 w-4 mr-1 text-primary-light" />
          ) : (
            <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
          )}
          <small className="text-fgd-3">Options</small>
        </div>
        {showOptions && (
          <>
            <Input
              noMaxWidth={true}
              label="Title"
              placeholder={
                form.amount && form.destinationAccount
                  ? proposalTitle
                  : 'Title of your proposal'
              }
              value={form.title}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'title',
                })
              }
            />
            <Textarea
              noMaxWidth={true}
              label="Description"
              placeholder={
                'Description of your proposal or use a github gist link (optional)'
              }
              wrapperClassName="mb-5"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            ></Textarea>
            {canChooseWhoVote && (
              <VoteBySwitch
                checked={voteByCouncil}
                onChange={() => {
                  setVoteByCouncil(!voteByCouncil)
                }}
              ></VoteBySwitch>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <SecondaryButton
          disabled={isLoading}
          className="sm:w-1/2 text-th-fgd-1"
          onClick={handleGoBackToMainView}
        >
          Cancel
        </SecondaryButton>
        <Button
          className="sm:w-1/2"
          onClick={handlePropose}
          isLoading={isLoading}
        >
          <div>Propose</div>
        </Button>
      </div>
    </>
  )
}

export default AddMember
