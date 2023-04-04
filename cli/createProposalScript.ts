import { EndpointTypes } from '@models/types'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import chalk from 'chalk'
import figlet from 'figlet'
import promptly from 'promptly'
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { createBase64Proposal } from './helpers/createBase64Proposal'
import {
  getAllProposals,
  getInstructionDataFromBase64,
  getTokenOwnerRecord,
  getTokenOwnerRecordAddress,
} from '@solana/spl-governance'
import { tryParseKey } from '@tools/validators/pubkey'

const loadWalletFromFile = (walletPath: string): Keypair => {
  const walletJSON = readFileSync(walletPath, 'utf-8')
  const walletData = JSON.parse(walletJSON)
  return Keypair.fromSecretKey(new Uint8Array(walletData))
}

const VSR_PROGRAM_ID = '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo'

const ENDPOINT_URL = 'https://api.mainnet-beta.solana.com/'

const CLUSTER = 'mainnet'

const REALM = new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE')

const GOVERNANCE_PROGRAM = new PublicKey(
  'GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J'
)

export const PROPOSAL_MINT = new PublicKey(
  'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'
)

class GovernanceCli {
  #connectionContext = {
    cluster: CLUSTER as EndpointTypes,
    current: new Connection(ENDPOINT_URL, 'recent'),
    endpoint: ENDPOINT_URL,
  }
  wallet: NodeWallet
  walletKeyPair: Keypair
  vsrClient: VsrClient
  constructor(walletKeyPair: Keypair) {
    this.walletKeyPair = walletKeyPair
  }
  async setupKeyPairWallet() {
    console.log('Setting up wallet...')
    const tempPayerWallet = Keypair.fromSecretKey(this.walletKeyPair.secretKey)
    const tempWallet = new NodeWallet(tempPayerWallet)
    this.wallet = tempWallet
    console.log('Wallet ready')
  }
  async setupVoterClient() {
    console.log('Setting up vsr...')
    const options = AnchorProvider.defaultOptions()
    const provider = new AnchorProvider(
      this.#connectionContext.current,
      (this.wallet as unknown) as Wallet,
      options
    )
    const vsrClient = await VsrClient.connect(
      provider,
      new PublicKey(VSR_PROGRAM_ID),
      this.#connectionContext.cluster === 'devnet'
    )
    this.vsrClient = vsrClient
    console.log('Vsr ready')
  }
  async createProposal() {
    const instructionsCount = await promptly.prompt(
      'How many instructions you want to use?'
    )
    if (isNaN(instructionsCount)) {
      console.log('Error instruction count is not a number')
      return
    }
    const governancePk = await promptly.prompt(
      'Provide governance address for proposal: '
    )
    if (!tryParseKey(governancePk)) {
      console.log('Error invalid publickey')
      return
    }
    const delegatedWallet = await promptly.prompt(
      'Enter the address that delegated the token to you: '
    )
    if (!tryParseKey(delegatedWallet)) {
      console.log('Error invalid publickey')
      return
    }
    const title = await promptly.prompt('Title: ')
    const description = await promptly.prompt('Description: ')
    const instructions: string[] = []
    for (let i = 0; i < instructionsCount; i++) {
      const instructionNumber = i + 1
      const inst = await promptly.prompt(
        `Instruction ${instructionNumber} Base64: `
      )
      try {
        getInstructionDataFromBase64(inst)
      } catch (e) {
        console.log('Error while parsing instruction: ', e)
      }
      instructions.push(inst)
    }

    let tokenOwnerRecordPk: PublicKey | null = null
    if (delegatedWallet) {
      tokenOwnerRecordPk = await getTokenOwnerRecordAddress(
        GOVERNANCE_PROGRAM,
        REALM,
        PROPOSAL_MINT,
        new PublicKey(delegatedWallet)
      )
    } else {
      tokenOwnerRecordPk = await getTokenOwnerRecordAddress(
        GOVERNANCE_PROGRAM,
        REALM,
        PROPOSAL_MINT,
        this.wallet.publicKey
      )
    }
    const [tokenOwnerRecord, proposals] = await Promise.all([
      getTokenOwnerRecord(this.#connectionContext.current, tokenOwnerRecordPk),
      getAllProposals(
        this.#connectionContext.current,
        GOVERNANCE_PROGRAM,
        REALM
      ),
    ])
    const proposalIndex = proposals.flatMap((x) => x).length

    try {
      const address = await createBase64Proposal(
        this.#connectionContext.current,
        this.wallet,
        tokenOwnerRecord,
        new PublicKey(governancePk),
        REALM,
        GOVERNANCE_PROGRAM,
        PROPOSAL_MINT,
        title,
        description,
        proposalIndex,
        [...instructions],
        this.vsrClient
      )
      console.log(
        `Success proposal created url: https://realms.today/dao/${REALM.toBase58()}/proposal/${address.toBase58()}`
      )
    } catch (e) {
      console.log('ERROR: ', e)
    }
  }
  async init() {
    await Promise.all([this.setupKeyPairWallet(), this.setupVoterClient()])
  }
}

async function run() {
  console.log(
    chalk.red(
      figlet.textSync('spl-governance-cli', { horizontalLayout: 'full' })
    )
  )
  ;(async () => {
    //Load wallet from file system assuming its in default direction /Users/-USERNAME-/.config/solana/id.json
    const walletPath = join(homedir(), '.config', 'solana', 'id.json')
    const wallet = loadWalletFromFile(walletPath)
    const cli = new GovernanceCli(wallet)
    await cli.init()
    await cli.createProposal()
  })()
}

run()
