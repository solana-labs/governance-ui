import { useContext, useEffect, useState } from 'react';
import * as yup from 'yup';
import { serializeInstructionToBase64 } from '@solana/spl-governance';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { debounce } from '@utils/debounce';
import { isFormValid } from '@utils/formValidation';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { FormInstructionData } from '@utils/uiTypes/proposalCreationTypes';

import { NewProposalContext } from 'pages/dao/[symbol]/proposal/new';
import useWalletStore from 'stores/useWalletStore';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import useGovernedMultiTypeAccounts from './useGovernedMultiTypeAccounts';
import { EndpointTypes } from '@models/types';

export type SerializedInstruction = string;

function useInstructionFormBuilder<
  T extends {
    governedAccount?: GovernedMultiTypeAccount;
  }
>({
  index,
  initialFormValues,
  schema,
  buildInstruction,
  getCustomHoldUpTime,
  shouldSplitIntoSeparateTxs = false,
}: {
  index: number;
  initialFormValues: T;
  schema: yup.ObjectSchema<
    {
      [key in keyof T]: yup.AnySchema;
    }
  >;
  buildInstruction?: ({
    form,
    connection,
    cluster,
    wallet,
    governedAccountPubkey,
  }: {
    form: T;
    connection: Connection;
    cluster: EndpointTypes;
    wallet: SignerWalletAdapter;
    governedAccountPubkey: PublicKey;
  }) => Promise<TransactionInstruction | SerializedInstruction>;
  getCustomHoldUpTime?: () => Promise<number>;
  shouldSplitIntoSeparateTxs?: boolean;
}) {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);
  const { handleSetInstruction } = useContext(NewProposalContext);
  const { getGovernedAccountPublicKey } = useGovernedMultiTypeAccounts();

  const [form, setForm] = useState<T>(initialFormValues);
  const [formErrors, setFormErrors] = useState({});

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({});
    setForm({ ...form, [propertyName]: value });
  };

  const validateForm = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form);
    setFormErrors(validationErrors);
    return isValid;
  };
  const governedAccountPubkey = getGovernedAccountPublicKey(
    form.governedAccount,
    true,
  );

  const getInstruction = async (): Promise<FormInstructionData> => {
    if (
      !wallet?.publicKey ||
      !form.governedAccount?.governance?.account ||
      !governedAccountPubkey ||
      !(await validateForm())
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      };
    }

    try {
      const prerequisiteInstructions: TransactionInstruction[] = [];

      const transactionInstructionOrSerializedInstruction = buildInstruction
        ? await buildInstruction({
            form,
            connection: connection.current,
            cluster: connection.cluster,
            wallet,
            governedAccountPubkey,
          })
        : '';

      const serializedInstruction =
        typeof transactionInstructionOrSerializedInstruction === 'string'
          ? transactionInstructionOrSerializedInstruction
          : serializeInstructionToBase64(
              transactionInstructionOrSerializedInstruction,
            );

      const customHoldUpTime = getCustomHoldUpTime
        ? await getCustomHoldUpTime()
        : undefined;

      return {
        serializedInstruction,
        prerequisiteInstructions,
        isValid: true,
        governance: form.governedAccount?.governance,
        customHoldUpTime,
        shouldSplitIntoSeparateTxs,
      };
    } catch (e) {
      console.error(e);

      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      };
    }
  };

  useEffect(() => {
    handleSetForm({
      propertyName: 'governedAccount',
      value: initialFormValues.governedAccount,
    });
  }, [JSON.stringify(initialFormValues.governedAccount)]);

  useEffect(() => {
    debounce.debounceFcn(async () => {
      await validateForm();
    });
    handleSetInstruction(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index,
    );
  }, [form]);

  return {
    connection,
    governedAccountPubkey,
    wallet,
    formErrors,
    form,
    handleSetForm,
    validateForm,
  };
}

export default useInstructionFormBuilder;
