import * as anchor from '@project-serum/anchor'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import log from 'loglevel'
import fetch from 'node-fetch'
import { stat } from 'fs/promises'
import { calculate } from '@metaplex/arweave-cost'
import { ARWEAVE_PAYMENT_WALLET } from './constants'
import { sendTransactionWithRetryWithKeypair } from './transactions'

const ARWEAVE_UPLOAD_ENDPOINT = 'https://us-central1-metaplex-studios.cloudfunctions.net/uploadFile'

export async function fetchAssetCostToStore(fileSizes: number[]) {
	// THIS IS USING THE ARBUNDLER WHICH WE ARE NOT. Price is here: https://arweave.net/price/1, not https://node1.bundlr.network/price/1000
	console.log('in cost estimater')
	console.log(fileSizes)
	const result = await calculate(fileSizes)
	console.log('Arweave cost estimates:', result)
	console.log('Arweave cost file size:', fileSizes)

	// Roughly a 20x between winstons of non budled uploads
	return result.solana * anchor.web3.LAMPORTS_PER_SOL * 20
}

export async function uploadToArweave(data: FormData) {
	return await (
		await fetch(ARWEAVE_UPLOAD_ENDPOINT, {
			method: 'POST',
			// @ts-ignore
			body: data,
		})
	).json()
}

export function estimateManifestSize(filenames: string[]) {
	const paths = {}

	for (const name of filenames) {
		paths[name] = {
			id: 'artestaC_testsEaEmAGFtestEGtestmMGmgMGAV438',
			ext: path.extname(name).replace('.', ''),
		}
	}

	const manifest = {
		manifest: 'arweave/paths',
		version: '0.1.0',
		paths,
		index: {
			path: 'metadata.json',
		},
	}

	const data = Buffer.from(JSON.stringify(manifest), 'utf8')
	log.debug('Estimated manifest size:', data.length)
	return data.length
}
