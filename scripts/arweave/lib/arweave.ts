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


export async function uploadToArweave(data: FormData, json?: any) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 7500)

	try {
		return await(
			await fetch(ARWEAVE_UPLOAD_ENDPOINT, {
				method: 'POST',
				signal: controller.signal,
				// @ts-ignore
				body: data,
			})
		).json()
	} catch {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", "Basic b2xpdmU6Z3RCZnJvNW4zaVJhUGg=");
		var requestOptions = {
			method: 'GET',
			headers: myHeaders,
			redirect: 'follow'
		};

		return await(
			await fetch('https://api.p2-test.rhove.com/social/asset-upload-link?extension=.json', requestOptions)
			.then((response) => response.json())
			.then((result) => {
				const presignedUrl = result?.pre_signed_url;
				const cdnUrl = result?.cdn_url;

				return fetch(result.pre_signed_url, {
					method: "PUT",
					body: json
				})
				.then(() => cdnUrl);
			})
		)
	}
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
