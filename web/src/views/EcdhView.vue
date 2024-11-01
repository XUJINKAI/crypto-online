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
    if (ecdh.secret.value === '') {
        return '';
    }
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
const description = `A simple app that uses ECDH to securely exchange keys and encrypt/decrypt data.`;
const help_CN = `
### 快速使用：

如果你收到一个此页面的链接，且这个链接包含一个对方的公钥，那么此时 Secret 栏会自动计算出共享密钥。此时你只需要：

1. 在左侧文本框输入明文并加密。
2. 点击右侧文本框下的 Copy URL 复制链接，发回给对方。

此链接会附带你自己的公钥和加密后的文本，此文本只有对方可以解密。

### 完整步骤：

1. 发送**我的公钥**给对方 (My Public Key);  
或点击Copy URL复制带公钥的链接给对方.
2. 将**对方的公钥**粘贴到输入框 (Other's Public Key);  
或通过带公钥的链接自动填写.
3. 此时你和对方共享同一个密钥，可以进行加密/解密操作.  
通过加密文本框下的链接可以快速复制加密后的文本或带加密文本的链接.

### 说明：

利用 ECDH 密钥交换，生成共享密钥，进行加密/解密操作。  
私钥请妥善保存，不要发送到公共区域。  
页面会自动生成一个私钥并保存到本地(localStorage), 你可以点击 Generate 生成新的私钥.  
`;
const help_EN = `
### Quick Start:

If you receive a link to this page, and the link contains the other's public key, the **Secret** field will auto filled.   
At this point, you only need to:

1. Enter plaintext in the left text box and encrypt it.
2. Click **Copy URL** below the encrypted box and send it back to the other party.

The link will include your own public key and the encrypted text, which only the other party can decrypt.

### Full Steps:

1. Send **My Public Key** to the other party;  
Or click Copy URL and send to the other party.
2. Paste **Other's Public Key** into the box;  
Or auto fill through the link.
3. Then you and the other party share the same secret key.  
You can quickly copy the encrypted text or the link with the encrypted text by clicking the link below the encrypted text box.

## Detail:

Use ECDH key exchange to generate a shared secret key for encryption/decryption.  
Please keep your private key safe and do not send it to public area.  
The page will automatically generate a private key and save it to local storage, you can click Generate to generate a new private key.

## Algorithm:

\`\`\`
sk = your private key (sm2 key)
pk = your public key = sk * G
share = other's public key

secret = kdf(sk * share, 32)
enc/dec: sm4-cbc, key = secret[0..16], iv = secret[16..]
\`\`\`
`;
</script>

<template>
    <div class="wrapper">
        <p>{{ description }}</p>

        <h2>Config</h2>
        <div class="config-item">
            <span>My Private Key:</span>
            <NInput v-model:value="ecdh.my_key_pair.value.private" type="password" show-password-on="click" />
            <button @click="ecdh.generateNewKey">Generate</button>
        </div>
        <div class="config-item">
            <span>My Public Key:</span>
            <span
                style="user-select: all; color: green; background-color: yellow; text-wrap: wrap; word-break: break-all;">
                {{ ecdh.my_key_pair.value.public }}
            </span>
            <a :href="BuildUrl(['share'])" @click="CopyAHrefToClipboard">Copy URL</a>
        </div>
        <p class="config-item">
            <span>Other's Public Key:</span>
            <NInput v-model:value="ecdh.others_public_key.value" />
        </p>
        <p class="config-item">
            <span>Secret:</span>
            <NInput v-model:value="ecdh.secret.value" type="password" show-password-on="click" />
            <span style="margin-left: 20px;">{{ secret_digest_str }}</span>
        </p>

        <h2>Encrypt/Decrypt</h2>
        <div class="enc-dec-wrapper flex-responsive">
            <NInput v-model:value="plainText" type="textarea" style="flex: 1" rows="5" />
            <!-- <textarea v-model="plainText" /> -->
            <div class="enc-dec-button-wrapper">
                <NButton @click="encryptData" type="info">{{ '>> Encrypt' }}</NButton>
                <NButton @click="decryptData" type="success">{{ 'Decrypt <<' }}</NButton>
            </div>
            <div style="flex: 1; width: 100%;">
                <NInput v-model:value="encryptedText" type="textarea" rows="5" />
                <!-- <textarea v-model="encryptedText" /> -->
                <span style="display: flex; gap: 2rem;">
                    <a href="javascript:void(0)" @click="() => CopyTextToClipboard(encryptedText)">Copy Text</a>
                    <a :href="BuildUrl(['share', 'encrypted'])" @click="CopyAHrefToClipboard">Copy Url</a>
                </span>
            </div>
        </div>

        <div style="display: flex; gap: 2rem;" class="flex-responsive">
            <MarkdownText :markdown="help_CN" style="flex: 1;"></MarkdownText>
            <MarkdownText :markdown="help_EN" style="flex: 1;"></MarkdownText>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    margin: 0 auto;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.config-item {
    display: flex;
    align-items: center;
}

.config-item span,
.config-item a {
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