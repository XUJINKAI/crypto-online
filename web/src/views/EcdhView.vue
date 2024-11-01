<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { NButton, NInput } from 'naive-ui'
import MarkdownText from '@/components/MarkdownText.vue';
import { EcdhClass } from '@/crypto/EcdhClass';
import LocalStorage from '@/stores/LocalStorage';
import md5 from 'crypto-js/md5'

const ecdh = new EcdhClass();

const plainText = ref('');
const encryptedText = ref('');
const sk_my_private_key = 'ecdh_private_key'
const secret_digest_str = computed(() => {
    return "Digest: " + md5(ecdh.secret.value).toString().substring(0, 8);
});

function encryptData() {
    encryptedText.value = ecdh.encrypt(plainText.value) || '';
}
function decryptData() {
    plainText.value = ecdh.decrypt(encryptedText.value) || '';
}

// 初始化数据
setTimeout(() => {
    // 设置自己的私钥
    const local_key = LocalStorage.getItem<string>(sk_my_private_key);
    if (local_key) {
        ecdh.my_key_pair.value.private = local_key;
    } else {
        ecdh.generateNewKey();
        LocalStorage.setItem(sk_my_private_key, ecdh.my_key_pair.value.private);
    }

    // 监听私钥变化，保存到本地
    watch(() => ecdh.my_key_pair.value.private, () => {
        LocalStorage.setItem(sk_my_private_key, ecdh.my_key_pair.value.private);
    }, { immediate: false });

    // 根据URL设置对方公钥和加密文本
    const urlParams = new URLSearchParams(location.search);
    const share = urlParams.get('share');

    if (share) {
        ecdh.others_public_key.value = share;
    }

    const encrypted = urlParams.get('encrypted');
    if (encrypted) {
        encryptedText.value = encrypted;
        setTimeout(() => {
            decryptData();
        }, 0);
    }
}, 0);

// build url
type UrlPart = 'sk' | 'share' | 'secret' | 'plain' | 'encrypted';
function BuildUrl(parts: UrlPart[]): string {
    let url = `${location.origin}${location.pathname}?`;
    parts.forEach((part) => {
        switch (part) {
            // case 'sk':
            //   url += `sk=${data.my_key_pair.value.private}&`;
            //   break;
            case 'share':
                url += `share=${ecdh.my_key_pair.value.public}&`;
                break;
            // case 'secret':
            //   url += `secret=${data.secret.value}&`;
            //   break;
            // case 'plain':
            //   url += `plain=${plainText.value}&`;
            //   break;
            case 'encrypted':
                url += `encrypted=${encryptedText.value}&`;
                break;
        }
    });
    if (url.endsWith('&')) {
        url = url.slice(0, -1);
    }
    return url;
}

// event
function CopyTextToClipboard(text: string) {
    navigator.clipboard.writeText(text);
}

function CopyAHrefToClipboard(e: MouseEvent) {
    e.preventDefault();
    const url = (e.target as HTMLAnchorElement).href;
    navigator.clipboard.writeText(url);
}

// 文档
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
        <p>A simple app that uses ECDH to securely exchange keys and encrypt/decrypt data.</p>

        <h2>Config</h2>
        <p class="input">
            <span>My Private Key:</span>
            <NInput v-model:value="ecdh.my_key_pair.value.private" type="password" show-password-on="click" />
            <button @click="ecdh.generateNewKey">Generate</button>
        </p>
        <p class="input">
            <span>My Public Key:</span>
            <span style="user-select: all; color: green; background-color: yellow;">
                {{ ecdh.my_key_pair.value.public }}
            </span>
            <a :href="BuildUrl(['share'])" @click="CopyAHrefToClipboard">Copy URL</a>
        </p>
        <p class="input">
            <span>Other's Public Key:</span>
            <NInput v-model:value="ecdh.others_public_key.value" />
        </p>
        <p class="input">
            <span>Secret:</span>
            <NInput v-model:value="ecdh.secret.value" type="password" show-password-on="click" />
            <span style="margin-left: 20px;">{{ secret_digest_str }}</span>
        </p>

        <h2>Encrypt/Decrypt</h2>
        <div class="enc-dec-wrapper">
            <NInput v-model:value="plainText" type="textarea" style="flex: 1" rows="5" />
            <!-- <textarea v-model="plainText" /> -->
            <div class="enc-dec-button-wrapper">
                <NButton @click="encryptData" type="info">{{ '>> Encrypt' }}</NButton>
                <NButton @click="decryptData" type="success">{{ 'Decrypt <<' }}</NButton>
            </div>
            <div style="flex: 1">
                <NInput v-model:value="encryptedText" type="textarea" rows="5" />
                <!-- <textarea v-model="encryptedText" /> -->
                <span style="display: flex; gap: 2rem;">
                    <a href="javascript:void(0)" @click="() => CopyTextToClipboard(encryptedText)">Copy Text</a>
                    <a :href="BuildUrl(['share', 'encrypted'])" @click="CopyAHrefToClipboard">Copy Url</a>
                </span>
            </div>
        </div>

        <MarkdownText :markdown="help"></MarkdownText>
    </div>
</template>

<style scoped>
.wrapper {
    margin: 0 auto;
    height: 100%;
    width: 100%;
    max-width: 1000px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

p.input {
    display: flex;
    align-items: center;
}

p.input span {
    text-wrap: nowrap;
    margin-right: 10px;
}

input {
    width: 100%;
}

.enc-dec-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
}

.enc-dec-wrapper textarea {
    width: 100%;
    height: 200px;
    flex: 1;
}

.enc-dec-button-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
}
</style>