import { ref, watch } from 'vue'
import { sm2, sm4 } from './sm-crypto-v2/src'
import { sm2Curve } from './sm-crypto-v2/src/sm2/ec'
import { hkdf } from './sm-crypto-v2/src/sm2/kx'
import { hexToArray, leftPad } from './sm-crypto-v2/src/sm2'
import { bytesToHex, hexToNumber, numberToHexUnpadded } from '@noble/curves/abstract/utils'

export class EcdhClass {
  my_key_pair = ref({
    private: '',
    public: '',
  })
  others_public_key = ref('')
  secret = ref('')

  encrypt(text: string) {
    return ErrorNullValue(() => {
      if (!this.secret.value) return ''
      const key = this.secret.value.slice(0, 32)
      const iv = this.secret.value.slice(32)
      return sm4.encrypt(text, key, { mode: 'cbc', iv: iv, output: 'string' })
    })
  }

  decrypt(text: string) {
    return ErrorNullValue(() => {
      if (!this.secret.value) return ''
      const key = this.secret.value.slice(0, 32)
      const iv = this.secret.value.slice(32)
      return sm4.decrypt(text, key, { mode: 'cbc', iv: iv, output: 'string' })
    })
  }

  generateNewKey() {
    this.my_key_pair.value.private = GenerateInitKey().private
  }

  constructor() {
    watch(() => this.my_key_pair.value.private, () => {
      this.my_key_pair.value.public = ErrorNullValue(() => {
        if (!this.my_key_pair.value.private) return '';
        const pub = sm2.getPublicKeyFromPrivateKey(this.my_key_pair.value.private);
        return sm2.compressPublicKeyHex(pub);
      }, (e) => e) || '';
    })
    watch(() => [this.my_key_pair.value.private, this.others_public_key.value], () => {
      this.secret.value = ErrorNullValue(() => {
        return GenerateSecretKey(this.my_key_pair.value.private, this.others_public_key.value)
      }, (e) => e) || '';
    })
  }
}

function GenerateSecretKey(my_private_key: string, others_public_key: string) {
  if (!my_private_key || !others_public_key) return '';
  const pub = sm2Curve.ProjectivePoint.fromHex(others_public_key);
  const pri = hexToNumber(my_private_key);

  // m = pub * pri
  const m = pub.multiply(pri);
  const mHex = leftPad(numberToHexUnpadded(m.x), 32) + leftPad(numberToHexUnpadded(m.y), 32);

  const s = hkdf(hexToArray(mHex), 32);
  return bytesToHex(s);
}

function GenerateInitKey() {
  const keypair = sm2.generateKeyPairHex()
  return {
    private: keypair.privateKey,
    public: sm2.compressPublicKeyHex(keypair.publicKey)
  }
}

function ErrorNullValue<T>(fn: () => T, onError?: (any) => T | undefined): T | undefined {
  try {
    return fn()
  } catch (e) {
    if (!onError) return e as any
    return onError(e)
  }
}