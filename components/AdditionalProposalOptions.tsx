import { ChevronDownIcon } from '@heroicons/react/outline'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import React, { useState } from 'react'
import { LinkButton } from './Button'
import Input from './inputs/Input'
import Textarea from './inputs/Textarea'
import {useVoteByCouncilToggle} from "@hooks/useVoteByCouncilToggle";

const AdditionalProposalOptions: React.FC<{
  title: string
  description: string
  setTitle: (evt) => void
  setDescription: (evt) => void
  defaultTitle: string
  defaultDescription?: string
  voteByCouncil: boolean
  setVoteByCouncil: (val) => void
}> = ({
  title,
  description,
  setTitle,
  setDescription,
  defaultTitle,
  defaultDescription,
  voteByCouncil,
  setVoteByCouncil,
}) => {
  const [showOptions, setShowOptions] = useState(false)
  const { shouldShowVoteByCouncilToggle } = useVoteByCouncilToggle();
  return (
    <>
      <LinkButton
        className="flex items-center text-primary-light my-5"
        onClick={() => setShowOptions(!showOptions)}
      >
        {showOptions ? 'Less Proposal Options' : 'More Proposal Options'}
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
          {shouldShowVoteByCouncilToggle && (
              <VoteBySwitch
                  checked={voteByCouncil}
                  onChange={() => {
                    setVoteByCouncil(!voteByCouncil)
                  }}
              ></VoteBySwitch>
          )}
        </div>
      )}
    </>
  )
}

export default AdditionalProposalOptions
