import React from 'react'

const ProposalType = () => {
  return (
    <>
      <h2>Proposal Types</h2>
      <div className="mb-3 border border-fgd-4 p-4 md:p-6 rounded-lg">
        {/* ToDo Adi: Replace "yes" "no" with the required icons */}
        <p>
          Now, in addition to creating a proposal with a simple Yes No choices,
          you may create polls with several voting options. Note that these
          multiple choice polls cannot have actions and are therefore
          non-executable.
        </p>
        <h2>What type of proposal are you creating</h2>
        <form></form>
      </div>
    </>
  )
}

export default ProposalType
