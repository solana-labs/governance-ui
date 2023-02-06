import React, { useContext, useEffect, useState, useMemo } from 'react'
import * as yup from 'yup'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { isFormValid } from '@utils/formValidation'
import {
  DepositReserveLiquidityAndObligationCollateralForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { SunriseStakeClient, SUNRISE_STAKE_STATE } from '@sunrisestake/client'
import useWallet from "@hooks/useWallet";

const DepositForm = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
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

  const [ client, setClient ] = useState<SunriseStakeClient>()
  const adaptedWalletProvider = useMemo(() => {
    if (!wallet || !anchorProvider) return undefined;
    return ({
      publicKey: wallet.publicKey,
      ...anchorProvider
    });
  }, [wallet, anchorProvider]);
  useEffect(() => {
    if (!adaptedWalletProvider) return;
    SunriseStakeClient.get(adaptedWalletProvider, SUNRISE_STAKE_STATE, {
      verbose: Boolean(process.env.REACT_APP_VERBOSE)
    }).then(setClient)
  }, [anchorProvider]);

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  console.log(form.governedAccount)

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
    const isSol = form.governedAccount.isSol
    const owner = isSol
      ? form.governedAccount.pubkey
      : form.governedAccount.extensions!.token!.account.owner

    const isDev = connection.cluster === 'devnet'


    const tx = await

    const {
      actionTx: tx,
      prerequisiteInstructions,
    } = await handleEverlendDeposit(
      wallet,
      Boolean(isSol),
      connection,
      owner,
      REGISTRY,
      CONFIG,
      rewardPool,
      rewardAccount,
      matchedStratagie.poolPubKey,
      getMintNaturalAmountFromDecimalAsBN(
        +form.uiAmount as number,
        form.governedAccount.extensions.mint!.account.decimals
      ),
      liquidityATA,
      ctokenATA
    )

    tx.instructions.forEach((inst, index) => {
      if (index < tx.instructions.length - 1) {
        prerequisiteInstructions.push(inst)
      }
    })

    const additionalSerializedIxs = prerequisiteInstructions.map((inst) =>
      serializeInstructionToBase64(inst)
    )

    return {
      serializedInstruction: serializeInstructionToBase64(
        tx.instructions[tx.instructions.length - 1]
      ),
      additionalSerializedInstructions: additionalSerializedIxs,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

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
        label="Amount to deposit"
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
