import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import * as yup from 'yup'

import {Governance, ProgramAccount, serializeInstructionToBase64,} from '@solana/spl-governance'
import {PublicKey} from '@solana/web3.js'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import {isFormValid} from '@utils/formValidation'
import {DepositReserveLiquidityAndObligationCollateralForm, UiInstruction,} from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import {NewProposalContext} from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {Environment, SunriseStakeClient} from '@sunrisestake/client'
import useWallet from "@hooks/useWallet";
import {BN} from '@coral-xyz/anchor'
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";

const DepositForm = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const cluster = useWalletStore((s) => s.connection).cluster
  const { wallet, anchorProvider } = useWallet()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [
    form,
    setForm,
  ] = useState<DepositReserveLiquidityAndObligationCollateralForm>({
    uiAmount: '0',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const sunriseStakeStateAddress = useMemo(() => {
    const environment = cluster === 'mainnet' ? WalletAdapterNetwork.Mainnet : cluster as WalletAdapterNetwork;
    return Environment[environment].state;
  }, [cluster]);

  const [ client, setClient ] = useState<SunriseStakeClient>()

  useEffect(() => {
    if (!anchorProvider || !sunriseStakeStateAddress) return;
    SunriseStakeClient.get(anchorProvider, sunriseStakeStateAddress, {
      verbose: Boolean(process.env.REACT_APP_VERBOSE)
    }).then(setClient)
  }, [anchorProvider, sunriseStakeStateAddress]);

  const handleSetForm = useCallback(({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }, [form]);

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !client ||
      !form.governedAccount?.governance?.account ||
      !form.governedAccount.isSol ||  // TODO filter governed accounts by SOL only
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
    const tx = await client.deposit(new BN(form.uiAmount).mul(new BN(10).pow(new BN(9))));  // convert the amount to lamports
    const serializedInstructions = tx.instructions.map(serializeInstructionToBase64);

    return {
      serializedInstruction: serializedInstructions[serializedInstructions.length - 1],
      additionalSerializedInstructions: serializedInstructions.slice(0, -1),
      isValid: true,
      governance: form.governedAccount.governance,
      shouldSplitIntoSeparateTxs: true,
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [handleSetForm, programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form, getInstruction, handleSetInstructions, index])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Wallet"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      <Input
        label="Amount to deposit (SOL)"
        value={form.uiAmount}
        type="string"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiAmount',
          })
        }
        error={formErrors['uiAmount']}
      />
    </>
  )
}

export default DepositForm
