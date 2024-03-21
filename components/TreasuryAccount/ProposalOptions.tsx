import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import React from 'react'

const ProposalOptions: React.FC<{
  handleSetForm: (obj: { propertyName: string; value: any }) => void
  form: any
  canChooseWhoVote?: boolean
  voteByCouncil: boolean
  setVoteByCouncil: React.Dispatch<React.SetStateAction<boolean>>
}> = ({
  handleSetForm,
  form,
  canChooseWhoVote,
  voteByCouncil,
  setVoteByCouncil,
}) => {
  return (
    <>
      <Input
        noMaxWidth={true}
        label="Title"
        placeholder={form.title ?? 'Title of your proposal'}
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
  )
}

export default ProposalOptions
