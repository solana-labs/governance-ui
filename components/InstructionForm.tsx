import { LinkButton } from '@components/Button';
import { XCircleIcon } from '@heroicons/react/solid';
import { InstructionType } from '@hooks/useGovernanceAssets';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { ComponentInstructionData } from '@utils/uiTypes/proposalCreationTypes';
import SelectedInstruction from 'pages/dao/[symbol]/proposal/components/instructions/SelectedInstruction';
import InstructionContentContainer from '../pages/dao/[symbol]/proposal/components/InstructionContentContainer';
import SelectInstructionType from './SelectInstructionType';

const InstructionForm = ({
  idx,
  availableInstructions,
  governedAccount,
  selectedInstruction,
  setInstructionType,
  removeInstruction,
}: {
  idx: number;
  selectedInstruction: ComponentInstructionData;
  governedAccount?: GovernedMultiTypeAccount;
  availableInstructions: InstructionType[];

  setInstructionType: ({
    instructionType,
    idx,
  }: {
    instructionType: InstructionType | null;
    idx: number;
  }) => void;

  removeInstruction: (idx: number) => void;
}) => {
  return (
    <div key={idx} className="mb-3 border border-fgd-4 p-4 md:p-6 rounded-lg">
      <SelectInstructionType
        idx={idx}
        instructionTypes={availableInstructions}
        onChange={({ instructionType, idx }) =>
          setInstructionType({ instructionType, idx })
        }
        selectedInstruction={selectedInstruction.type}
      />

      <div className="flex items-end pt-4">
        <InstructionContentContainer instruction={selectedInstruction}>
          {selectedInstruction.type ? (
            <SelectedInstruction
              itxType={selectedInstruction.type?.id}
              index={idx}
              governedAccount={governedAccount}
            />
          ) : null}
        </InstructionContentContainer>

        {idx != 0 ? (
          <LinkButton
            className="flex font-bold items-center ml-4 text-fgd-1 text-sm"
            onClick={() => removeInstruction(idx)}
          >
            <XCircleIcon className="h-5 mr-1.5 text-red w-5" />
            Remove
          </LinkButton>
        ) : null}
      </div>
    </div>
  );
};

export default InstructionForm;
