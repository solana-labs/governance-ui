import * as anchor from '@coral-xyz/anchor'
import { getRealm, serializeInstructionToBase64 } from '@solana/spl-governance'
import { DRIFT_PROGRAM_ID, DRIFT_STAKE_VOTER_PLUGIN } from './constants'
import { DriftVoterClient } from './DriftVoterClient'
import { IDL } from './idl/driftStakeVoter'
const { PublicKey, Keypair, SystemProgram } = anchor.web3
const { BN, Program } = anchor

const provider = anchor.AnchorProvider.env()
anchor.setProvider(provider)

const createRegistrarIx = async () => {
  const realmPk = new PublicKey('4BUycYqX31hVXCipknkHwCp96G3udbXwDnSmf3Tk1WNA') // TODO
  const pluginProgramId = new PublicKey(DRIFT_STAKE_VOTER_PLUGIN) // TODO
  //const governanceProgramId = new PublicKey('') // TODO

  const program = new Program(IDL, pluginProgramId, provider)
  const sdk = new DriftVoterClient(program, true)

  const realm = await getRealm(provider.connection, realmPk)
  const realmAuthority = realm.account.authority!
  const governanceProgramId = realm.owner
  const communityMintPk = realm.account.communityMint

  const { registrar } = sdk.getRegistrarPDA(realmPk, communityMintPk)
  const ix = await program.methods
    .createRegistrar(0)
    .accountsStrict({
      realm: realmPk,
      registrar,
      governingTokenMint: communityMintPk,
      governanceProgramId,
      realmAuthority,
      payer: new PublicKey('3P7wJdEXb4CiLyRPqF46bKBfR5ovsuSkmP1DSv1v2v1q'),
      systemProgram: SystemProgram.programId,
      driftProgramId: new PublicKey(DRIFT_PROGRAM_ID),
    })
    .instruction()
  const s = serializeInstructionToBase64(ix)
  console.log(s)
  return s
}

createRegistrarIx()
