import { createContext, useState } from 'react'
import { NewProposal } from './components/NewProposal/NewProposal'
import React from 'react'

export type NewMultiPropType = {
  multiOptions: string[]
  newMultiOption: (string) => void
  updateMultiOption: (string, number) => void
  removeMultiOption: (number) => void
}

export const NewMultiPropContext = createContext<NewMultiPropType | null>(null)

const New = () => {
  const [multiOptions, setMultiOptions] = useState<string[]>([])

  const newMultiOption = (option: string) => {
    setMultiOptions([...multiOptions, option])
  }

  const updateMultiOption = (option: string, index: number) => {
    setMultiOptions((prevChoices) => {
      const newChoices = [...prevChoices]
      newChoices[index] = option
      return newChoices
    })
  }

  const removeMultiOption = (index: number) => {
    console.log('In main, removing: ', index)
    setMultiOptions((prevChoices) => prevChoices.filter((_, i) => i !== index))
  }

  return (
    <div className="dark w-full max-w-3xl mx-auto">
      <div className="dark:bg-neutral-900 rounded px-4 lg:px-8">
        <NewMultiPropContext.Provider
          value={{
            multiOptions,
            newMultiOption,
            updateMultiOption,
            removeMultiOption,
          }}
        >
          <NewProposal />
        </NewMultiPropContext.Provider>
      </div>
    </div>
  )
}

export default New
