<script setup lang='ts'>
import MarkdownText from '@/components/MarkdownText.vue';
import { EcdhClass } from '@/crypto/EcdhClass';

const ecdh = new EcdhClass();
ecdh.generateNewKey();

const help = `
## Help:

1. Send **My Public Key** to other one
2. Paste **Other's Public Key** into the box
3. You and the other one shares the same Secret to enc/dec

Use Copy URL to boost the process, the URL contains the public key and encrypted text.  
Private key will be stored in local storage, use generate button to generate a new one.

**Be careful:** DO NOT send private key to anyone; If you lose the private key, you will lose the data.
      </pre>

## Detail:

\`\`\`
sk = your private key
pk = your public key = sk * G
share = other's public key

secret = kdf(sk * share, 32)
enc/dec: sm4-cbc, key = secret[0..16], iv = secret[16..]
\`\`\`
`;
</script>

<template>
    <div class="wrapper">
        {{ ecdh.my_key_pair }}
        <MarkdownText :markdown="help"></MarkdownText>
    </div>
</template>

<style scoped></style>