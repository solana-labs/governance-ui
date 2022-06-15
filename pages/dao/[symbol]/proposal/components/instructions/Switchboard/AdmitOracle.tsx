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
  SwitchboardAdmitOracleForm
} from '@utils/uiTypes/proposalCreationTypes'
import { PublicKey } from '@solana/web3.js'
import Input from '@components/inputs/Input'
import * as sbv2 from '@switchboard-xyz/switchboard-v2'
import useWalletStore from 'stores/useWalletStore'
import * as anchor from '@project-serum/anchor'
import sbIdl from 'SwitchboardVotePlugin/switchboard_v2.json';
import gonIdl from 'SwitchboardVotePlugin/gameofnodes.json';
import { 
  SWITCHBOARD_ID, 
  SWITCHBOARD_ADDIN_ID, 
  SWITCHBOARD_GRANT_AUTHORITY,
  grantPermissionTx
} from 'SwitchboardVotePlugin/SwitchboardQueueVoterClient'
import { NewProposalContext } from '../../../new'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

const SwitchboardAdmitOracle = ({
  index,
  _governance,
}: {
  index: number
  _governance: ProgramAccount<Governance> | null
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

  const [form, setForm] = useState<SwitchboardAdmitOracleForm>({oraclePubkey: undefined, queuePubkey: undefined})
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { handleSetInstructions } = useContext(NewProposalContext)

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
      governedAccount: SWITCHBOARD_GRANT_AUTHORITY,
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
        sbIdl as anchor.Idl,
        SWITCHBOARD_ID,
        provider
      )

      const addinProgram = new anchor.Program(
        gonIdl as anchor.Idl,
        SWITCHBOARD_ADDIN_ID,
        provider
      )

      const [addinState] = await PublicKey.findProgramAddress(
        [
          Buffer.from('state'),
        ],
        addinProgram.programId,
      );

      let qPk;
      if (form === undefined) {
        qPk = PublicKey.default
      }
      else {
        qPk = form.queuePubkey
      }
      let oPk;
      if (form === undefined) {
        oPk = PublicKey.default
      }
      else {
        oPk = form.oraclePubkey
      }
      const p = sbv2.PermissionAccount.fromSeed(
        switchboardProgram,
        addinState,
        new PublicKey(qPk),
        new PublicKey(oPk),
      )[0];
      console.log("P:");
      console.log(p);

      const grantTx = await grantPermissionTx(
        addinProgram,
        SWITCHBOARD_GRANT_AUTHORITY,
        SWITCHBOARD_ID,
        p.publicKey
      );

      const gov = await getGovernance(connection.current, SWITCHBOARD_GRANT_AUTHORITY);
      return {
        serializedInstruction: serializeInstructionToBase64(grantTx.instructions[0]),
        isValid: true,
        governance: gov,
      };
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
      value={
        (() => {
          let oPk;
          if (form === undefined) {
            oPk = PublicKey.default
          }
          else {
            oPk = form.oraclePubkey
          }
          return oPk
        })()
      }
      onChange={(text) => {
        setForm({ ...form, ['oraclePubkey']: new PublicKey(text.target.value) });
        //setGovernance();
      }}
    />
    <Input
      label="Queue Pubkey"
      type="text"
      value={
        (() => {
          let qPk;
          if (form === undefined) {
            qPk = PublicKey.default
          }
          else {
            qPk = form.queuePubkey
          }
          return qPk
        })()
      }
      onChange={(text) => {
        setForm({ ...form, ['queuePubkey']: new PublicKey(text.target.value) })
      }}
    />
    </>
  )
}

export default SwitchboardAdmitOracle
