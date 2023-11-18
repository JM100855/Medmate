
const ethers = require('ethers');

const json = {
    "address":"c0d1907817993281a1efd569fa9365d0914832a8",
    "id":"24f7b137-2728-4b13-92b9-211183bfd619",
    "version":3,
    "Crypto":{
       "cipher":"aes-128-ctr",
       "cipherparams":{
          "iv":"3e3c1f35fadad091952c150196e63208"
       },
       "ciphertext":"614f44b5722892bbf05dad6218f7528f31571ee2ab468507970a8c72762991da",
       "kdf":"scrypt",
       "kdfparams":{
          "salt":"56f0352e90aca369b80596fb251a9a6ad99b22a7cbb83cc93aebb733b22c502e",
          "n":131072,
          "dklen":32,
          "p":1,
          "r":8
       },
       "mac":"c7cc141ad5b1beac28aec482d1be7fe2e8dcbf991c11b00bf1e4b8011f72146f"
    },
    "x-ethers":{
       "client":"ethers/6.7.1",
       "gethFilename":"UTC--2023-11-17T06-40-58.0Z--c0d1907817993281a1efd569fa9365d0914832a8",
       "path":"m/44'/60'/0'/0/0",
       "locale":"en",
       "mnemonicCounter":"f6387f851ac3c3d092082bd24f53f98f",
       "mnemonicCiphertext":"124ca9e00816bd77f0d7b49f9514d324",
       "version":"0.1"
    }
 }

ethers.Wallet.fromEncryptedJson(JSON.stringify(json), "12345678").then((wallet: any) => {
    console.log(wallet.privateKey)
})