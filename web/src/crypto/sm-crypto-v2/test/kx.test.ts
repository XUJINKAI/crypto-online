import { sm2 } from '@/index';
import { describe, expect, it } from 'vitest';

describe('key exchange', () => {
  const keyPairA = sm2.generateKeyPairHex()
  const keyPairB = sm2.generateKeyPairHex()
  const ephemeralKeypairA = sm2.generateKeyPairHex()
  const ephemeralKeypairB = sm2.generateKeyPairHex()
  it('agree a key', () => {
    const sharedKeyFromA = sm2.calculateSharedKey(keyPairA, ephemeralKeypairA, keyPairB.publicKey, ephemeralKeypairB.publicKey, 233)
    const sharedKeyFromB = sm2.calculateSharedKey(keyPairB, ephemeralKeypairB, keyPairA.publicKey, ephemeralKeypairA.publicKey, 233, true)
    console.log({
      sharedKeyFromA,
      sharedKeyFromB,
    })
    expect(sharedKeyFromA).toEqual(sharedKeyFromB)
  })
  it('agree a key with user identity', () => {
    const sharedKeyFromA = sm2.calculateSharedKey(keyPairA, ephemeralKeypairA, keyPairB.publicKey, ephemeralKeypairB.publicKey, 233, false, 'alice@yahoo.com', 'bob@yahoo.com')
    const sharedKeyFromB = sm2.calculateSharedKey(keyPairB, ephemeralKeypairB, keyPairA.publicKey, ephemeralKeypairA.publicKey, 233, true, 'bob@yahoo.com', 'alice@yahoo.com')
    console.log({
      sharedKeyFromA,
      sharedKeyFromB,
    })
    expect(sharedKeyFromA).toEqual(sharedKeyFromB)
  })
})
