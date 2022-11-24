import useGovernanceAssets, {
  InstructionType,
} from '@hooks/useGovernanceAssets'
import { Instructions, PackageEnum } from '@utils/uiTypes/proposalCreationTypes'
import { useCallback, useEffect, useState } from 'react'
import ImageTextSelection from './ImageTextSelection'
import TypeaheadSelect from './TypeaheadSelect'

function sortInstructionTypes(
  instructionTypes: InstructionType[]
): InstructionType[] {
  return instructionTypes.sort((instructionTypeA, instructionTypeB) => {
    // Sort by package id
    // Common package always first
    if (instructionTypeA.packageId !== instructionTypeB.packageId) {
      if (instructionTypeA.packageId === PackageEnum.Common) {
        return -1
      }

      if (instructionTypeB.packageId === PackageEnum.Common) {
        return 1
      }

      return instructionTypeA.packageId - instructionTypeB.packageId
    }

    // Then sort by instruction name
    // None transaction always first
    if (instructionTypeA.id === Instructions.None) {
      return -1
    }

    if (instructionTypeB.id === Instructions.None) {
      return 1
    }

    // Alphabetical order
    return instructionTypeA.name < instructionTypeB.name ? -1 : 1
  })
}

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

  const [
    filteredAndSortedInstructionTypes,
    setFilteredAndSortedInstructionTypes,
  ] = useState<InstructionType[]>([])

  const computeFilteredAndSortedInstructionsTypes = useCallback(() => {
    if (packageId === null) {
      const sortedInstructionTypes = sortInstructionTypes(instructionTypes)
      setFilteredAndSortedInstructionTypes(sortedInstructionTypes)

      // Select first instruction by default
      if (instructionTypes.length && !selectedInstruction) {
        onChange(instructionTypes[0])
      }

      return
    }

    if (selectedInstruction && selectedInstruction.packageId !== packageId) {
      onChange(null)
    }

    const filteredAndSortedInstructionTypes = sortInstructionTypes(
      instructionTypes.filter(
        (instructionType) => instructionType.packageId === packageId
      )
    )

    // Select first instruction by default
    if (filteredAndSortedInstructionTypes.length && !selectedInstruction) {
      onChange(filteredAndSortedInstructionTypes[0])
    }

    setFilteredAndSortedInstructionTypes(filteredAndSortedInstructionTypes)
  }, [packageId, selectedInstruction, instructionTypes, onChange])

  useEffect(() => {
    computeFilteredAndSortedInstructionsTypes()
  }, [computeFilteredAndSortedInstructionsTypes])

  const getInstructionDisplayName = (instruction?: InstructionType): string => {
    if (!instruction || typeof instruction.packageId === 'undefined') {
      return ''
    }

    return `${
      instruction.packageId === null
        ? getPackageTypeById(instruction.packageId)?.name ?? ''
        : ''
    }${instruction.name}`
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

        <TypeaheadSelect
          className="w-full border-none"
          placeholder="Search Proposals"
          options={filteredAndSortedInstructionTypes.map((instructionType) => ({
            key: instructionType.id.toString(),
            text: getInstructionDisplayName(instructionType),
          }))}
          selected={
            selectedInstruction
              ? {
                  key: selectedInstruction.id.toString(),
                }
              : undefined
          }
          onSelect={(option) => {
            if (!option?.key) {
              return onChange(null)
            }

            const id = option.key

            onChange(
              filteredAndSortedInstructionTypes.find(
                (instructionType) => instructionType.id.toString() === id
              ) ?? null
            )
          }}
        />
      </div>
    </div>
  )
}

export default SelectInstructionType
