import { computed, ref, watch } from 'vue'
import { sm2, sm4 } from './sm-crypto-v2/src'
import { sm2Curve } from './sm-crypto-v2/src/sm2/ec'
import { hkdf } from './sm-crypto-v2/src/sm2/kx'
import { hexToArray, leftPad } from './sm-crypto-v2/src/sm2'
import { bytesToHex, hexToNumber, numberToHexUnpadded } from '@noble/curves/abstract/utils'
import type { HexString, Utf8String } from './Data'

export class EcdhClass {
  static isValidSecretKey = (secret: string) => /^[0-9a-fA-F]{64}$/.test(secret);

  my_key_pair = ref<{
    private: HexString,
    public: HexString,
  }>({
    private: '',
    public: '',
  })
  others_public_key = ref<HexString>('');
  secret = ref<HexString>('')
  my_public_error = ref<string>('')
  secret_error = ref<string>('')

  encrypt(text: Utf8String | Uint8Array) {
    return new Promise<HexString | Uint8Array>((resolve, reject) => {
      if (!this.secret.value) return reject('No secret key')
      if (!/^[0-9a-fA-F]{64}$/.test(this.secret.value)) return reject('Invalid secret key')
      const key = this.secret.value.slice(0, 32)
      const iv = this.secret.value.slice(32)
      if (typeof text === 'string') {
        const data = sm4.encrypt(text, key, { mode: 'cbc', iv: iv, output: 'string' })
        resolve(data)
      } else if (text instanceof Uint8Array) {
        const data = sm4.encrypt(text, key, { mode: 'cbc', iv: iv, output: 'array' })
        resolve(data)
      } else {
        reject('Invalid input')
      }
    })
  }

  decrypt(text: HexString | Uint8Array) {
    return new Promise<Utf8String | Uint8Array>((resolve, reject) => {
      if (!this.secret.value) return reject('No secret key')
      if (!/^[0-9a-fA-F]{64}$/.test(this.secret.value)) return reject('Invalid secret key')
      const key = this.secret.value.slice(0, 32)
      const iv = this.secret.value.slice(32)
      if (typeof text === 'string') {
        const data = sm4.decrypt(text, key, { mode: 'cbc', iv: iv, output: 'string' })
        resolve(data)
      } else if (text instanceof Uint8Array) {
        const data = sm4.decrypt(text, key, { mode: 'cbc', iv: iv, output: 'array' })
        resolve(data)
      } else {
        reject('Invalid input')
      }
    })
  }

  generateNewKey() {
    this.my_key_pair.value.private = GenerateInitKey().private
  }

  constructor() {
    watch(() => this.my_key_pair.value.private, () => {
      GetCompressPublicKeyFromPrivateKey(this.my_key_pair.value.private)
        .then(pub => {
          this.my_key_pair.value.public = pub
          this.my_public_error.value = ''
        })
        .catch(e => {
          this.my_key_pair.value.public = ''
          this.my_public_error.value = e
        });
    })
    watch(() => [this.my_key_pair.value.private, this.others_public_key.value], () => {
      GenerateSecretKey(this.my_key_pair.value.private, this.others_public_key.value)
        .then(secret => {
          this.secret.value = secret
          this.secret_error.value = ''
        })
        .catch(e => {
          this.secret.value = ''
          this.secret_error.value = e
        });
    })
  }
}

export function GetCompressPublicKeyFromPrivateKey(private_key: string) {
  return new Promise<string>((resolve, reject) => {
    try {
      if (!private_key) reject('No private key')
      const pub = sm2.getPublicKeyFromPrivateKey(private_key);
      resolve(sm2.compressPublicKeyHex(pub));
    } catch (e) {
      reject(e)
    }
  });
}

function GenerateSecretKey__(my_private_key: string, others_public_key: string) {
  if (!my_private_key) return new Error('No private key');
  if (!others_public_key) return new Error('No public key');

  // 验证私钥合法
  if (!/^[0-9a-fA-F]{64}$/.test(my_private_key)) return new Error('Invalid private key');

  const pub = sm2Curve.ProjectivePoint.fromHex(others_public_key);
  const pri = hexToNumber(my_private_key);

  // m = pub * pri
  const m = pub.multiply(pri);
  const mHex = leftPad(numberToHexUnpadded(m.x), 32) + leftPad(numberToHexUnpadded(m.y), 32);

  const s = hkdf(hexToArray(mHex), 32);
  return bytesToHex(s);
}

export function GenerateSecretKey(my_private_key: string, others_public_key: string) {
  return new Promise<string>((resolve, reject) => {
    try {
      const result = GenerateSecretKey__(my_private_key, others_public_key)
      if (result instanceof Error) {
        reject(result.message);
      } else {
        resolve(result)
      }
    } catch (e) {
      reject(e)
    }
  });
}

function GenerateInitKey() {
  const keypair = sm2.generateKeyPairHex()
  return {
    private: keypair.privateKey,
    public: sm2.compressPublicKeyHex(keypair.publicKey)
  }
}