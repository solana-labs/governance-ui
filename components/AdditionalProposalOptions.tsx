import { ChevronDownIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import { useState } from 'react'
import { LinkButton } from './Button'
import Input from './inputs/Input'
import Textarea from './inputs/Textarea'

const AdditionalProposalOptions = ({
  title,
  description,
  setTitle,
  setDescription,
  defaultTitle,
  defaultDescription,
  voteByCouncil,
  setVoteByCouncil,
}: {
  title: string
  description: string
  setTitle: (evt) => void
  setDescription: (evt) => void
  defaultTitle: string
  defaultDescription?: string
  voteByCouncil: boolean
  setVoteByCouncil: (val) => void
}) => {
  const [showOptions, setShowOptions] = useState(false)
  const { canChooseWhoVote } = useRealm()
  return (
    <>
      <LinkButton
        className="flex items-center text-primary-light my-5"
        onClick={() => setShowOptions(!showOptions)}
      >
        {showOptions ? 'Less Options' : 'More Proposal Options'}
        <ChevronDownIcon
          className={`default-transition h-5 w-5 ml-1 ${
            showOptions ? 'transform rotate-180' : 'transform rotate-360'
          }`}
        />
      </LinkButton>
      {showOptions && (
        <div className="space-y-4">
          <Input
            noMaxWidth={true}
            label="Proposal Title"
            placeholder={defaultTitle}
            value={title}
            type="text"
            onChange={setTitle}
          />
          <Textarea
            noMaxWidth={true}
            label="Proposal Description"
            placeholder={
              defaultDescription ??
              'Description of your proposal or use a github gist link (optional)'
            }
            wrapperClassName="mb-5"
            value={description}
            onChange={setDescription}
          />
          {canChooseWhoVote && (
            <VoteBySwitch
              checked={voteByCouncil}
              onChange={() => {
                setVoteByCouncil(!voteByCouncil)
              }}
            />
          )}
        </div>
      )}
    </>
  )
}

export default AdditionalProposalOptions
