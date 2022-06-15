/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
//import { ForesightHasMarketId } from '@utils/uiTypes/proposalCreationTypes'
import { 
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
  getGovernance
} from '@solana/spl-governance'
/*import {
  governance as foresightGov,
  utils,
  consts,
} from '@foresight-tmp/foresight-sdk'*/
import {
  commonAssets,
  ForesightMarketIdInput,
  ForesightMarketListIdInput,
} from '@utils/Foresight'
import {
  SwitchboardRevokeOracleForm
} from '@utils/uiTypes/proposalCreationTypes'
import { PublicKey } from '@solana/web3.js'
import Input from '@components/inputs/Input'
import * as sbv2 from '@switchboard-xyz/switchboard-v2'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'
import * as anchor from '@project-serum/anchor'
import sbIdl from 'SwitchboardVotePlugin/switchboard_v2.json';
import gonIdl from 'SwitchboardVotePlugin/gameofnodes.json';
import { 
  QUEUE_LIST, 
  SWITCHBOARD_ID, 
  SWITCHBOARD_ADDIN_ID, 
  SWITCHBOARD_REVOKE_AUTHORITY,
  revokePermissionTx
} from 'SwitchboardVotePlugin/SwitchboardQueueVoterClient'
import { NewProposalContext } from '../../../new'

const SwitchboardRevokeOracle = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  /*const {
    inputProps,
    effector,
    governedAccountSelect,
    wallet,
  } = commonAssets<ForesightHasMarketId>(
    { marketListId: '', marketId: 0 },
    index,
    governance
  )
  async function ixCreator(form: ForesightHasMarketId) {
    const { ix } = await foresightGov.genInitMarketIx(
      Buffer.from(form.marketListId.padEnd(20)),
      utils.intToArray(form.marketId, 1),
      new PublicKey(consts.DEVNET_PID),
      wallet!.publicKey!
    )
    return ix
  }
  effector(ixCreator)*/

  /*return (
    <>
      {governedAccountSelect}
      <ForesightMarketListIdInput {...inputProps} />
      <ForesightMarketIdInput {...inputProps} />
    </>
  )*/

  const { realm } = useRealm()
  const [form, setForm] = useState<SwitchboardRevokeOracleForm>({})
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { handleSetInstructions, setGovernance } = useContext(NewProposalContext)

  /*useEffect(() => {

    async function getIdls() {
      const options = anchor.AnchorProvider.defaultOptions()
      const provider = new anchor.AnchorProvider(
        connection.current,
        (wallet as unknown) as anchor.Wallet,
        options
      )

      let idl = await anchor.Program.fetchIdl(sbv2.SBV2_MAINNET_PID, provider)
      if (!idl) {
        console.log("Off chain idl");
        idl = sbIdl as anchor.Idl
      }

      let addinIdl = await anchor.Program.fetchIdl(SWITCHBOARD_ADDIN_ID, provider)
      if (!addinIdl) {
        console.log("Off chain addin idl");
        addinIdl = gonIdl as anchor.Idl
      }

      const switchboardProgram = new anchor.Program(
        idl,
        SWITCHBOARD_ID,
        provider
      )
      console.log(switchboardProgram);

      const addinProgram = new anchor.Program(
        addinIdl,
        SWITCHBOARD_ADDIN_ID,
        provider
      )
      console.log(switchboardProgram);

      setPrograms({...programs, ['provider']: provider});
      setPrograms({...programs, ['addinProgram']: addinProgram});
      setPrograms({...programs, ['switchboardProgram']: switchboardProgram});
      setPrograms({...programs, ['addinIdl']: addinIdl});
      setPrograms({...programs, ['idl']: idl});

    }
    getIdls();

  }, [realm]);*/

  useEffect(() => {

    handleSetInstructions({
      governedAccount: SWITCHBOARD_REVOKE_AUTHORITY,
      getInstruction,
    }, index)

  }, [form]);

  /*useEffect(() => {
    async function getAndSetGov() {
      let gov = await getGovernance(connection.current, SWITCHBOARD_GRANT_AUTHORITY);
      console.log("GOT GOV");
      console.log(gov);
      setGovernance(SWITCHBOARD_GRANT_AUTHORITY);
      //console.log("And set it.");
    }
    getAndSetGov();
  }, [realm]);*/

  async function getInstruction(): Promise<UiInstruction> {

      const options = anchor.AnchorProvider.defaultOptions()
      const provider = new anchor.AnchorProvider(
        connection.current,
        (wallet as unknown) as anchor.Wallet,
        options
      )

      const switchboardProgram = new anchor.Program(
        sbIdl,
        SWITCHBOARD_ID,
        provider
      )

      const addinProgram = new anchor.Program(
        gonIdl,
        SWITCHBOARD_ADDIN_ID,
        provider
      )

      let [addinState] = await PublicKey.findProgramAddress(
        [
          Buffer.from('state'),
        ],
        addinProgram.programId,
      );

      let p = sbv2.PermissionAccount.fromSeed(
        switchboardProgram,
        addinState,
        new PublicKey(form.queuePubkey),
        new PublicKey(form.oraclePubkey),
      )[0];
      console.log("P:");
      console.log(p);

      let revokeTx = await revokePermissionTx(
        addinProgram,
        SWITCHBOARD_REVOKE_AUTHORITY,
        SWITCHBOARD_ID,
        p.publicKey
      );

      return {
        serializedInstruction: serializeInstructionToBase64(revokeTx.instructions[0]),
        isValid: true,
        governance: SWITCHBOARD_REVOKE_AUTHORITY,
      };
      /*const isValid = await validateInstruction()

      if (
        !connection ||
        !isValid ||
        !programId ||
        !form.governedAccount?.governance?.account ||
        !form.splTokenMintUIName ||
        !wallet?.publicKey
      ) {
        return {
          serializedInstruction: '',
          isValid: false,
          governance: form.governedAccount?.governance,
        }
      }

      const [tx] = await createAssociatedTokenAccount(
        // fundingAddress
        wallet.publicKey,

        // walletAddress
        form.governedAccount.governance.pubkey,

        // splTokenMintAddress
        getSplTokenMintAddressByUIName(form.splTokenMintUIName)
      )

      return {
        serializedInstruction: serializeInstructionToBase64(tx),
        isValid: true,
        governance: form.governedAccount.governance,
      }*/
    }

  return (
    /*onChange={(evt) =>
      props.handleSetForm({
      value: evt.target.value,
      propertyName: 'categoryId',
      })
      }*/
    //error={props.formErrors['categoryId']}
    //value={props.form.categoryId}
    <>
    <Input
      label="Oracle Pubkey"
      type="text"
      value={form.oraclePubkey}
      onChange={(text) => {
        setForm({ ...form, ['oraclePubkey']: text.target.value });
        setGovernance();
      }}
    />
    <Input
      label="Queue Pubkey"
      type="text"
      value={form.queuePubkey}
      onChange={(text) => {
        setForm({ ...form, ['queuePubkey']: text.target.value })
      }}
    />
    </>
  )
}

export default SwitchboardRevokeOracle
