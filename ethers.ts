import {ethers} from 'ethers'

export const provider = new ethers.JsonRpcProvider('https://moonbase-alpha.public.blastapi.io')

export const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider)

export const getCurrentNonce = async () =>
    (await signer.getNonce()).toString()