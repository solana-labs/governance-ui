/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
    Keypair,
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    SYSVAR_RENT_PUBKEY,
    SystemProgram,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
  } from '@solana/web3.js';
  import { serializeInstructionToBase64 } from '@solana/spl-governance'
  import { MintLayout, Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
  import { Borsh } from '@metaplex-foundation/mpl-core';
  import { WalletAdapter } from '@solana/wallet-adapter-base'
  import type { ConnectionContext } from 'utils/connection'
  import { DataV2, CreateMetadataV2Args} from '@metaplex-foundation/mpl-token-metadata';
  import {METADATA_SCHEMA} from './metaplexSchema';
  import * as borsh from 'borsh';

  import {
    GovernedTokenAccount,
  } from './tokens'
  import { UiInstruction } from './uiTypes/proposalCreationTypes'

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const TOKR_PROGRAM = new PublicKey(
      "9e78qsrsE2e5Q97T1biobry8mSot8NorEDJHJnMa5CpN"
  );

  export class MintArgs extends Borsh.Data<{
    name: string;
    symbol: string;
    uri: string;
  }> {
    static readonly SCHEMA = this.struct([
      ['instruction', 'u8'],
      ['name', 'string'],
      ['symbol', 'string'],
      ['uri', 'string']
    ]);
  
    instruction = 0;
    name: string;
    symbol: string;
    uri: string;
  }
  
  // const daoKey = new PublicKey("CRtSDiPfYHkeecFDUt7cG2sBGJFzkJt24B16HZ4kcCL6");
/**
 * Say hello
 * TODO integrate into 
 */
export async function getTokrInstruction2({
    schema,
    form,
    programId,
    connection,
    wallet,
    currentAccount,
    setFormErrors,
    }: {
    schema: any
    form: any
    programId: PublicKey | undefined
    connection: ConnectionContext
    wallet: WalletAdapter | undefined
    currentAccount: GovernedTokenAccount | undefined
    setFormErrors: any
    }): Promise<UiInstruction> {
    const isValid =  true; // todo: await validateInstruction({ schema, form, setFormErrors })


    let serializedInstruction = ''
    const prerequisiteInstructions: TransactionInstruction[] = []
    // Generate a mint
    
    const mint = (await PublicKey.findProgramAddress([wallet!.publicKey!.toBuffer(), Buffer.from("test2", "utf-8")], TOKR_PROGRAM))[0];

    console.log("Payer: {}", wallet!.publicKey!.toBase58());
    console.log("Mint:", mint.toBase58());
    console.log("token program {}", TOKEN_PROGRAM_ID.toBase58());

    const data = MintArgs.serialize({
        name: 'hello',
        symbol: 'world',
        uri: 'www.google.com'
      });
    

    const instruction = new TransactionInstruction(
    {
        keys: [
            {pubkey: wallet!.publicKey!, isSigner: true, isWritable: true}, 
            {pubkey: mint, isSigner: false, isWritable: true}, 
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
            {pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false}
        ],
        programId: TOKR_PROGRAM,
        data: data
    }
    );
    serializedInstruction = serializeInstructionToBase64(instruction)

    const obj: UiInstruction = {
        serializedInstruction,
        isValid,
        governance: currentAccount?.governance,
        prerequisiteInstructions: prerequisiteInstructions,
    }
    return obj
}
    
  /**
   * Say hello
   * TODO integrate into 
   */
   export async function getTokrInstruction({
    schema,
    form,
    programId,
    connection,
    wallet,
    currentAccount,
    setFormErrors,
  }: {
    schema: any
    form: any
    programId: PublicKey | undefined
    connection: ConnectionContext
    wallet: WalletAdapter | undefined
    currentAccount: GovernedTokenAccount | undefined
    setFormErrors: any
  }): Promise<UiInstruction> {
    const isValid =  true; // todo: await validateInstruction({ schema, form, setFormErrors })

        // Allocate memory for the account
    const mintRent = await connection.current.getMinimumBalanceForRentExemption(
      MintLayout.span,
    );
    let serializedInstruction = ''
    const prerequisiteInstructions: TransactionInstruction[] = []
    // Generate a mint
    let mint = Keypair.generate();
    const instructions: TransactionInstruction[] = [];
  
    console.log("Rent lamports: {}", mintRent);
    console.log("Payer: {}", wallet!.publicKey!.toBase58());
    console.log("Mint:", mint.publicKey.toBase58());
    console.log("token program {}", TOKEN_PROGRAM_ID.toBase58());
  
  
    prerequisiteInstructions.push(SystemProgram.createAccount({
      fromPubkey: wallet!.publicKey!,
      newAccountPubkey: mint.publicKey,
      lamports: mintRent,
      space: MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    }));
  
    // console.log(ints)
    // console.log(ints.data)
  
    prerequisiteInstructions.push(
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        0,
        wallet!.publicKey!,
        wallet!.publicKey!,
      ),
    );
    
  
    const ATAAddress = await getTokenWallet(
      wallet!.publicKey!,
      mint.publicKey,
    );
  

    console.log("ATA address:", ATAAddress.toBase58())
  
    prerequisiteInstructions.push(
      createAssociatedTokenAccountInstruction(
        ATAAddress,
        wallet!.publicKey!,
        wallet!.publicKey!,
        mint.publicKey,
      ),
    );
  
  
    // Create metadata
    const metadataAccount = await getMetadata(mint.publicKey);
    console.log("Metadata account:", metadataAccount);
  
    const data = new DataV2({
      symbol: "hellow",
      name: "world",
      uri: "https://d2jcpdpj3m9ych.cloudfront.net/genericAssetDirectory/2022-03-01T15:39:51.094582719Z.NA",
      sellerFeeBasisPoints: 0,
      creators: null,   //todo fill this out
      collection: null,
      uses: null,
    });
  
    let txnData = Buffer.from(
      borsh.serialize(
        new Map([
          DataV2.SCHEMA,
          ...METADATA_SCHEMA,
          ...CreateMetadataV2Args.SCHEMA,
        ]),
        new CreateMetadataV2Args({ data, isMutable: false }),
      ),
    );
  
    prerequisiteInstructions.push(
      createMetadataInstruction(
        metadataAccount,
        mint.publicKey,
        wallet!.publicKey!,
        wallet!.publicKey!,
        wallet!.publicKey!,
        txnData,
      ),
    );
  
    const transferIx = Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        ATAAddress,
        wallet!.publicKey!,
        [],
        1,
    );
    serializedInstruction = serializeInstructionToBase64(transferIx)

    const obj: UiInstruction = {
        serializedInstruction,
        isValid,
        governance: currentAccount?.governance,
        prerequisiteInstructions: prerequisiteInstructions,
      }
      return obj
  }

  export function createMetadataInstruction(
    metadataAccount: PublicKey,
    mint: PublicKey,
    mintAuthority: PublicKey,
    payer: PublicKey,
    updateAuthority: PublicKey,
    txnData: Buffer,
  ) {
    const keys = [
      {
        pubkey: metadataAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: mintAuthority,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: payer,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: updateAuthority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
    return new TransactionInstruction({
      keys,
      programId: TOKEN_METADATA_PROGRAM_ID,
      data: txnData,
    });
  }
  
  export function createAssociatedTokenAccountInstruction(
    associatedTokenAddress: PublicKey,
    payer: PublicKey,
    walletAddress: PublicKey,
    splTokenMintAddress: PublicKey,
  ) {
    const keys = [
      {
        pubkey: payer,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: associatedTokenAddress,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: walletAddress,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: splTokenMintAddress,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
    return new TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([]),
    });
  }
  
  
  
  export const getMetadata = async (
    mint: PublicKey,
  ): Promise<PublicKey> => {
    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      )
    )[0];
  };
  
  export const getTokenWallet = async function (
    wallet: PublicKey,
    mint: PublicKey,
  ) {
    return (
      await PublicKey.findProgramAddress(
        [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )
    )[0];
  };