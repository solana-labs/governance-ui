import Select from '@components/inputs/Select'
import useGovernanceAssets, {
  InstructionType,
} from '@hooks/useGovernanceAssets'
import { PackageEnum } from '@utils/uiTypes/proposalCreationTypes'
import { useCallback, useEffect, useState } from 'react'
import ImageTextSelection from './ImageTextSelection'

const SelectInstructionType = ({
  idx,
  instructionTypes,
  selectedInstruction,
  onChange,
}: {
  idx: number
  selectedInstruction?: InstructionType
  instructionTypes: InstructionType[]

  onChange: ({
    instructionType,
    idx,
  }: {
    instructionType: InstructionType | null
    idx: number
  }) => void
}) => {
  const [packageId, setPackageId] = useState<PackageEnum | null>(null)
  const { availablePackages, getPackageTypeById } = useGovernanceAssets()

  const [filteredInstructionTypes, setFilteredInstructionTypes] = useState<
    InstructionType[]
  >([])

  const computeFilteredInstructionsTypes = useCallback(() => {
    if (packageId === null) {
      setFilteredInstructionTypes(instructionTypes)

      // Select first instruction by default
      if (instructionTypes.length && !selectedInstruction) {
        onChange({ instructionType: instructionTypes[0], idx })
      }

      return
    }

    if (selectedInstruction && selectedInstruction.packageId !== packageId) {
      onChange({ instructionType: null, idx })
    }

    const filteredInstructionTypes = instructionTypes.filter(
      (instructionType) => instructionType.packageId === packageId
    )

    // Select first instruction by default
    if (filteredInstructionTypes.length && !selectedInstruction) {
      onChange({ instructionType: filteredInstructionTypes[0], idx })
    }

    setFilteredInstructionTypes(filteredInstructionTypes)
  }, [packageId, instructionTypes])

  useEffect(() => {
    computeFilteredInstructionsTypes()
  }, [computeFilteredInstructionsTypes])

  // Only display the package name is a no package is selected
  const getInstructionDisplayName = (
    instruction?: InstructionType
  ): string | JSX.Element => {
    if (!instruction) {
      return ''
    }

    return (
      <>
        {packageId === null ? (
          <span className="pr-1">
            {getPackageTypeById(instruction.packageId)!.name}:
          </span>
        ) : null}

        <span>{instruction.name}</span>

        {instruction.tag ? (
          <span className="ml-3 text-primary-light font-bold">
            {instruction.tag}
          </span>
        ) : null}
      </>
    )
  }

  const packages = [
    {
      id: null,
      name: 'All',
    },
    ...availablePackages,
  ]

  return (
    <div className="flex flex-col">
      <span className="mb-2">Instruction {idx + 1}</span>

      <div className="flex flex-col bg-bkg-1 w-full max-w-lg border border-fgd-3 default-transition rounded-md h-auto">
        <ImageTextSelection
          className="pl-4 pr-4 w-full"
          selected={packageId}
          imageTextElements={packages}
          onClick={setPackageId}
        />

        <Select
          className="p-2 w-full text-sm"
          disabled={!filteredInstructionTypes.length}
          placeholder={`${
            filteredInstructionTypes.length
              ? 'Select instruction'
              : 'No available instructions'
          }`}
          onChange={(instructionType: InstructionType) =>
            onChange({ instructionType, idx })
          }
          value={getInstructionDisplayName(selectedInstruction)}
          useDefaultStyle={false}
        >
          {filteredInstructionTypes.map((instructionType) => (
            <Select.Option key={instructionType.name} value={instructionType}>
              <span>{getInstructionDisplayName(instructionType)}</span>
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  )
}

export default SelectInstructionType
