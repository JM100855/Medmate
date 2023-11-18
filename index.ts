import express from 'express';
import  { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs'

dotenv.config();

import {getPinnedFiles, pinFileToIPFS} from "./provider/pinata";
import {deployRecordContract, getRecordContract, getVaultContract} from "./utils/contracts";
import {ethers} from "ethers";
import {getRow, insertRow, supabase} from "./provider/supabase";
import {session} from "./middleware/session";
import {provider} from "./utils/ethers";
import {
    deserializeRSAPrivateKey,
    deserializeRSAPublicKey,
    generateRSAKeyPairs,
    RSADecrypt,
    RSAEncrypt, serializePubKey, serializePvtKey,
    serializeRSAKey
} from "./utils/RSA";

const app: Express = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads')); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname + '.pdf'); 
    },
});

const upload = multer({ storage: storage });

app.post('/doctor/login', async (req: Request, res: Response) => {
    const {id, password} = req.body

    const {data, error} = await getRow('Doctors', 'id', id);

   if(error) {
       return res.json({
           error: error.message,
       }).status(500)
   }

   if(password !== data.password) {
       return res.json({
           error: 'Invalid Password'
       }).status(500)
   }

   return res.json({
       doctor: data,
       status: "success"
   })

})

app.get('/record/:hash', async (req: Request, res: Response) => {
    const { hash } = req.params;
    const { viewerId, patientId } = req.query
    console.log(req.params, req.query)

    let privateKey: string | undefined = undefined

    const {data, error: getRSAKeyPairsError} = await getRow("KeyPairs", "user_id", (patientId || viewerId) as string)

    if(getRSAKeyPairsError) {
        console.log(getRSAKeyPairsError)
        return res.status(500).json({
            error: getRSAKeyPairsError.message,
        })
    }

    privateKey = data.private_key as string

    const decryptedHash = RSADecrypt(privateKey, hash)
    return res.json({ipfs: decryptedHash}).status(200)
})

app.post('/account/new', session ,async (req: Request, res: Response) => {
    try {
        const password: string = req.body.password;
        const name: string = req.body.name;

        const wallet = ethers.Wallet.createRandom();
        const encryptedWalletJSON = await wallet.encrypt(password)

        const {error, data: user} = await insertRow(
            'Users',
            {
                wallet: wallet.address,
                name,
                email: (req as any)?.user?.email
            }
        )

        if(error) {
            console.log(error)
            return res.status(500).json({
                error: error.message,
            })
        }

        const {error: createWalletErr} =await insertRow(
            'Wallets',
            {
                encryptedJSON: encryptedWalletJSON,
                user_id: user.id
            }
        )

        if(createWalletErr) {
            return res.status(500).json({
                error: createWalletErr.message,
            })
        }

        const key = generateRSAKeyPairs()

        const serializedPublicKey = serializePubKey(key)
        const serializedPrivateKey = serializePvtKey(key)

        const {error: createKeyPairError} =await insertRow(
            'KeyPairs',
            {
                public_key: serializedPublicKey,
                private_key: serializedPrivateKey,
                user_id: user.id
            }
        )

        if(createKeyPairError) {
            console.log(createKeyPairError)
            return res.status(500).json({
                error: createKeyPairError.message,
            })
        }

        return res.json({
            encryptedWalletJSON: JSON.parse(encryptedWalletJSON),
            wallet: wallet.address
        }).status(201)
    } catch (err: unknown) {
        console.log(err)
    }
})

app.post('/record/new', upload.single('file') , async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }

        const {metadata, name, patientId} = req.body;

        const {data: user, error} = await getRow('Users', 'id', patientId)

        if(error) {
            console.log(error)
            return res.status(500).json({
                error: error.message,
            })
        }

        const pinned = await pinFileToIPFS(req?.file?.filename, JSON.parse(metadata), name)

        const {data, error: getRSAKeyPairsError} = await getRow("KeyPairs", "user_id", patientId)

        if(getRSAKeyPairsError) {
            return res.status(500).json({
                error: getRSAKeyPairsError.message,
            })
        }

        const encryptedHash = RSAEncrypt(data.public_key, pinned?.IpfsHash)

        const deployment = await deployRecordContract(name, encryptedHash)
        await deployment.waitForDeployment()
        const recordAddress = await deployment.getAddress()

        const recordContract =  getRecordContract(recordAddress)

        const record = {
            id: 1,
            recordAddress: recordAddress,
            metadata: metadata,
            name: name,
            ipfs: encryptedHash,
            patientUid: user?.id || '', // Ensure patientUid is set to a default value if user?.id is undefined
        };

        let tx = await (getVaultContract()).addRecord(record).catch(console.log)

        await tx.wait()

        tx = await recordContract.transferOwnership(user.wallet)

        fs.unlinkSync(req?.file?.path as string);

        return res.json({
            record: recordAddress,
            transactionHash: tx.hash,
        }).status(201)

    } catch (err) {
        console.log(err)
    }
})

app.post('/record/access', async (req: Request, res: Response) => {
    const {doctorId, recordId} = req.body

    if(req.query?.revoke) {
        const {data, error} = await supabase.from('Records').delete().eq('address', recordId).eq('doctor_id', doctorId)

        if(error) {
            return res.json({
                error: error.message,
            }).status(500)
        }

        return res.json({
            data,
        })
    }

    const {data, error} = await insertRow('Records', {
        address: recordId,
        doctor_id: doctorId,
    })

    if(error) {
        return res.json({
            error: error.message,
        }).status(500)
    }

    return res.json({
        data,
    })

})

app.get('/record/access/:doctorId', async (req: Request, res: Response) => {
    const {doctorId} = req.params

    const {data, error} = await supabase.from('Records').select('*').eq('doctor_id', doctorId)

    if(error) {
        return res.json({
            error: error.message,
        }).status(500)
    }

    return res.json({
        data,
    })

})

app.get('/record/get-allowed-doctors/:recordId', async (req: Request, res: Response) => {
    const {recordId} = req.params

    const {data, error} =
        await supabase
            .from('Records')
            .select('*, doctor:doctor_id(id, name, hospital, address)')
            .eq('address', recordId)

    return res.json({
        data
    })

})

app.post('/transaction/write', async (req: Request, res: Response) => {
    const {userId, method, abi, params, password, address} = req.body

    const {data: user, error} = await getRow('Wallets', 'user_id', userId)

    if(error) {
        return res.json({
            error: error.message,
        }).status(500)
    }

    const wallet = await ethers.Wallet.fromEncryptedJson(user.encryptedJSON, password)
    const signer = wallet.connect(provider)
    const contract = new ethers.Contract(address, abi, signer)

    const tx = await contract[method](...params)
    await tx.wait()

    return res.json({
        txHash: tx.hash,
    })
})


app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
