import pinataSDK from '@pinata/sdk';
import * as fs from 'fs'

const pinata = new pinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY as string,
    pinataSecretApiKey: process.env.PINATA_SECRET_KEY as string
});

export const pinFileToIPFS = async (filename: string, metadata: any, name: string) => {
    const readableStreamForFile = fs.createReadStream(`C:\\Users\\joshi\\Downloads\\webapp\\server\\dist\\uploads\\${filename}`);
    const options = {
        pinataMetadata: {
            name: name,
            keyvalues: metadata
        },
        pinataOptions: {
            cidVersion: 0 as 0 | 1
        }
    };

    return pinata.pinFileToIPFS(readableStreamForFile, options)
}

export const getPinnedFiles = async (hash: string) => {
    return pinata.pinList({
        hashContains: hash
    })
}
