import { AddAlt } from "@carbon/icons-react";
import { LinkButton } from "@components/Button";
import { StyledLabel } from "@components/inputs/styles";
import { XCircleIcon } from "@heroicons/react/solid";
import useGovernanceAssets from "@hooks/useGovernanceAssets";
import useRealm from "@hooks/useRealm";
import Input from '@components/inputs/Input';
import GovernedAccountSelect from "../pages/dao/[symbol]/proposal/components/GovernedAccountSelect";
import { PublicKey } from "@solana/web3.js";
import { AccountType, AssetAccount } from "@utils/uiTypes/assets";

const MultiChoiceForm = ({
    multiChoiceForm,
    updateMultiChoiceForm,
    isMultiFormValidated,
    multiFormErrors,
    updateMultiFormErrors
} : {
    multiChoiceForm: {
        governance: PublicKey | undefined
        options: string[]
    }
    updateMultiChoiceForm: any
    isMultiFormValidated: boolean
    multiFormErrors: any
    updateMultiFormErrors: any
}) => {
    const {ownVoterWeight} = useRealm()
    const { assetAccounts } = useGovernanceAssets()
    const nota = "$$_NOTA_$$";
    const lastOptIndex = multiChoiceForm.options.length - 1;
    const governance = multiChoiceForm.governance;
    const hideNotaButton = multiChoiceForm.options[lastOptIndex] === nota;

    const handleMultiForm = ({ propertyName, value }) => {
        updateMultiFormErrors({})
        updateMultiChoiceForm({ ...multiChoiceForm, [propertyName]: value })
    }
    
    const handleNotaButton = () => {
        const options = [...multiChoiceForm.options];
        options.push(nota);
        handleMultiForm({propertyName: "options", value: options});
    }
    
    const updateOption = (odx: number, value: string)  => {
        const updatedOptions = [...multiChoiceForm.options];
        updatedOptions[odx] = value;
        handleMultiForm({value: updatedOptions, propertyName: "options"});
    }

    const removeOption = (odx: number) => {
        const updatedOptions = [...multiChoiceForm.options];
        handleMultiForm({value: updatedOptions.filter((_o, i) => i !== odx), propertyName: "options"});
    }

    const addOption = () => {
        const updatedOptions = [...multiChoiceForm.options];
        const len = updatedOptions.length-1;

        if (updatedOptions.length > 9) {
            return;
        }
        if (updatedOptions[len] === nota) {
            // insert new empty option at the second last position if NOTA exists
            updatedOptions.splice(len, 0, "");
        } else {
            // insert new empty option at the last position if not NOTA doesn't exist
            updatedOptions.push("");
        }
        handleMultiForm({value: updatedOptions, propertyName: "options"});
    }
    
    return (
        <div className="mt-8 mb-8">
            <GovernedAccountSelect
                label="Which wallet’s rules should this proposal follow?"
                governedAccounts={
                    assetAccounts.filter((x) =>
                    ownVoterWeight.canCreateProposal(x.governance.account.config))
                }
                onChange={(value:AssetAccount) => {
                handleMultiForm({ value: value.governance.pubkey, propertyName: 'governance' })
                }}
                value={
                    governance ? assetAccounts.find(
                        x => x.governance.pubkey.equals(governance) &&
                        x.type !== AccountType.TOKEN
                    )
                    : null
                }
                error={multiFormErrors['governance']}
                shouldBeGoverned={null}
                governance={null}
            />
            <h2 className='mt-8'>Add Choices</h2>
            {multiChoiceForm.options.map((option, index) => {
                // copy index to keep its value for onChange function
                const odx = index;

                return (
                <div key={odx} className="mb-3 mt-3 border border-fgd-4 p-4 md:p-6 rounded-lg">
                <div className="flex flex-row justify-between">
                    <h2 className='mb-4'>Choice {odx + 1}</h2>
                    {odx > 1 ?
                    <LinkButton
                        className="flex font-bold items-center ml-4 text-fgd-1 text-sm"
                        onClick={() => removeOption(odx)}
                    >
                        <XCircleIcon className="h-5 mr-1.5 text-red w-5" />
                        Remove
                    </LinkButton>
                    : null}
                </div>
                <StyledLabel>Add a Label</StyledLabel>
                <div className='text-sm font-extralight text-fgd-3 mt-1 mb-2 max-w-lg'>
                    This is the text voters will see when they vote.
                </div>
                <Input
                    placeholder={`Voting Choice ${odx + 1}`}
                    value={option === nota && index === lastOptIndex ? "None of the Above" : option}
                    type="text"
                    error={
                        !option.length && isMultiFormValidated ? "The option can't be empty"
                        : ""
                    }
                    showErrorState={!option.length && isMultiFormValidated}
                    onChange={(event) => updateOption(odx, event.target.value)}
                    disabled={option === nota && index > 1 && index === lastOptIndex}
                />
                </div>)}
            )}
            <div className="flex flex-row justify-between">
                <div>
                <LinkButton
                    onClick={() => addOption()}
                    disabled={multiChoiceForm.options.length > 9}
                    className='flex flex-row items-center gap-2 font-bold pt-2'
                >
                    <AddAlt className='text-green'/>
                    <div>Add another voting choice</div>
                </LinkButton>
                </div>
                <div>
                <LinkButton
                    onClick={() => handleNotaButton()}
                    disabled={hideNotaButton || multiChoiceForm.options.length > 9}
                    className='flex flex-row items-center gap-2 font-bold pt-2'
                >
                    <AddAlt className='text-green'/>
                    <div>Add &apos;None of the Above&apos; choice</div>
                </LinkButton>
                </div>
            </div>
            </div>
            
    )
}

export default MultiChoiceForm;