import Select from '@components/inputs/Select'
import useGovernanceAssets, {
  InstructionType,
} from '@hooks/useGovernanceAssets'
import { PackageEnum } from '@utils/uiTypes/proposalCreationTypes'
import { useCallback, useEffect, useState } from 'react'
import ImageTextSelection from './ImageTextSelection'

const SelectInstructionType = ({
  instructionTypes,
  selectedInstruction,
  onChange,
}: {
  selectedInstruction?: InstructionType
  instructionTypes: InstructionType[]
  onChange: (instructionType: InstructionType | null) => void
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
        onChange(instructionTypes[0])
      }

      return
    }

    if (selectedInstruction && selectedInstruction.packageId !== packageId) {
      onChange(null)
    }

    const filteredInstructionTypes = instructionTypes.filter(
      (instructionType) => instructionType.packageId === packageId
    )

    // Select first instruction by default
    if (filteredInstructionTypes.length && !selectedInstruction) {
      onChange(filteredInstructionTypes[0])
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
    if (!instruction || typeof instruction.packageId === 'undefined') {
      return ''
    }

    return (
      <>
        {packageId === null ? (
          <span className="pr-1">
            {getPackageTypeById(instruction.packageId)?.name ?? ''}:
          </span>
        ) : null}

        <span>{instruction.name}</span>
      </>
    )
  }

  const packages = [
    {
      id: null,
      name: 'All',
    },

    // Sort the packages in the following order:
    // Common always first
    // Then packages without images
    // Then by alphabetical order (id are sorted by alphabetical order already)
    ...availablePackages.sort((packageA, packageB): number => {
      if (packageA.id === PackageEnum.Common) {
        return -1
      }

      if (
        typeof packageA.image === 'undefined' &&
        typeof packageB.image !== 'undefined'
      ) {
        return -1
      }

      if (
        typeof packageA.image !== 'undefined' &&
        typeof packageB.image === 'undefined'
      ) {
        return 1
      }

      return packageA.id - packageB.id
    }),
  ]

  return (
    <div className="flex flex-col">
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
            onChange(instructionType)
          }
          value={getInstructionDisplayName(selectedInstruction)}
          useDefaultStyle={false}
        >
          {filteredInstructionTypes.map((instructionType) => (
            <Select.Option key={instructionType.id} value={instructionType}>
              <span>{getInstructionDisplayName(instructionType)}</span>
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  )
}

export default SelectInstructionType
