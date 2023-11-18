import crypto, {KeyObject} from "crypto";
import NodeRSA from 'node-rsa'
export const generateRSAKeyPairs = () => {
    return new NodeRSA({ b: 2048 });
}

export const RSAEncrypt = (publicKeyPem: string, data: string) => {
    const key = new NodeRSA({ b: 2048 });
    return key.importKey(publicKeyPem, 'pkcs1-public-pem').encrypt(data, 'base64');
}
export const RSADecrypt = (privateKeyPem: string, data: string) => {
    const key = new NodeRSA({ b: 2048 });
    return key.importKey(privateKeyPem, 'pkcs1-private-pem').decrypt(data, 'utf8');
}

export const serializeRSAKey = (key: KeyObject) => {
    return key.export({
        type: "spki",
        format: "pem",
    })
}

export const serializePubKey = (key:  NodeRSA) => key.exportKey('pkcs1-public-pem');
export const serializePvtKey = (key:  NodeRSA) => key.exportKey('pkcs1-private-pem');

export const deserializeRSAPrivateKey = (serializedPrivateKey: string) => {
    return crypto.createPrivateKey({
        key: serializedPrivateKey,
        format: 'pem',
        type: 'pkcs1'
    });
}

export const deserializeRSAPublicKey = (key: string) => {
    return crypto.createPublicKey(key)
}