<script setup lang='ts'>
import { computed, nextTick, ref, watch } from 'vue';
import { NButton, NInput, NUpload, useDialog, useMessage } from 'naive-ui'
import MarkdownText from '@/components/MarkdownText.vue';
import { EcdhClass } from '@/crypto/EcdhClass';
import { LocalStorageSection } from '@/stores/LocalStorage';
import { sm3 } from '@/crypto/sm-crypto-v2/src';
import StoragePanel from '@/components/StoragePanel.vue';
import { FormatTimestamp } from '@/crypto/DateTime';
import EcdhHelp from './EcdhHelp';
import SelectableInput from '@/components/SelectableInput.vue';

const ecdh = new EcdhClass();
const storage = new LocalStorageSection('ecdh');
const dialog = useDialog();
const message = useMessage();

const plainText = ref('');
const encryptedText = ref('');
const ls_my_private_key_ref = storage.getValueRef<string>('my_private_key');
const ls_others_public_key_array_ref = storage.getSortedUniqueArrayRef<{
    pk: string,
    sid: string,
}>('other_public_key_array', 20, (a, b) => a.pk === b.pk);

const secret_id = computed(() => {
    if (!ecdh.secret.value) return '';
    if (!/^[0-9a-fA-F]{64}$/.test(ecdh.secret.value)) return ''
    return calcSid_secret(ecdh.secret.value);
})

function calcSid_secret(secret: string) {
    return sm3(secret).toString().substring(0, 8);
}

function storageRender(key: string, value: any) {
    if (key === storage.getKey('my_private_key')) {
        return {
            title: 'My Private Key',
            code: value,
        };
    } else if (key === storage.getKey('other_public_key_array')) {
        let v = value as typeof ls_others_public_key_array_ref.data.value;
        return {
            title: 'Other\'s Public Key Memory',
            code: v.map(item => `${FormatTimestamp(item.timestamp)}: sid=${item.value.sid}, pk=${item.value.pk}`).join('\n'),
        };
    }
    return null;
}

function onStorageClear() {
    ecdh.secret.value = '';
    ecdh.others_public_key.value = '';
    ecdh.my_key_pair.value.public = '';
    ecdh.my_key_pair.value.private = '';
}

function generateKey() {
    const askDialog = dialog.warning({
        title: 'Generate New Key',
        content: 'Current key will lost, everything encrypted by current key will cannot be decrypted. Are you sure?',
        positiveText: 'Yes',
        negativeText: 'Cancel',
        maskClosable: true,
        onPositiveClick: () => {
            ecdh.generateNewKey();
            message.success('Generate New Key Success');
        },
    });
}
async function encryptData() {
    const data = await ecdh.encrypt(plainText.value);
    encryptedText.value = data as string;
}
async function decryptData() {
    const data = await ecdh.decrypt(encryptedText.value);
    plainText.value = data as string;
}
function EncryptEventHandler() {
    encryptData().then(() => {
        message.success('Encrypt Success');
    }).catch(e => {
        message.error('Encrypt Error: ' + e);
    });
}
function DecryptEventHandler() {
    decryptData().then(() => {
        message.success('Decrypt Success');
    }).catch(e => {
        message.error('Decrypt Error: ' + e);
    });
}

async function initData() {
    // 监听私钥变化，保存到本地
    watch(() => ecdh.my_key_pair.value.private, () => {
        ls_my_private_key_ref.value = ecdh.my_key_pair.value.private;
    }, { immediate: false });

    // 监听公钥变化，保存到本地列表
    watch(() => secret_id.value, () => {
        if (secret_id.value) {
            ls_others_public_key_array_ref.Push({
                pk: ecdh.others_public_key.value,
                sid: secret_id.value,
            });
        }
    }, { immediate: false });

    let msg = '';
    // 设置自己的私钥
    if (ls_my_private_key_ref.value) {
        ecdh.my_key_pair.value.private = ls_my_private_key_ref.value;
        msg += 'Private Key: From LocalStorage';
    } else {
        ecdh.generateNewKey();
        ls_my_private_key_ref.value = ecdh.my_key_pair.value.private;
        msg += 'Private Key: Random Generate';
    }

    await nextTick();
    // 设置对方的公钥
    const urlParams = new URLSearchParams(location.search);
    const sid = urlParams.get('sid') as string;
    const share = urlParams.get('share');

    let _pk = '';
    let _pk_msg = '';

    if (ls_others_public_key_array_ref.data.value.length > 0) {
        _pk = ls_others_public_key_array_ref.data.value[0].value.pk;
        _pk_msg = '; Other\'s Public Key: Recent from LoadStorage';
    }
    if (share) {
        _pk = share;
        _pk_msg = '; Other\'s Public Key: From URL';
    }
    if (sid) {
        const find_pk = ls_others_public_key_array_ref.Find(item => sid === item.sid)?.pk;
        if (find_pk) {
            _pk = find_pk;
            _pk_msg = '; Other\'s Public Key: select sid from LoadStorage';
        }
    }
    ecdh.others_public_key.value = _pk;
    msg += _pk_msg;

    await nextTick();
    // 解密文本
    const encrypted = urlParams.get('encrypted');
    if (encrypted) {
        encryptedText.value = encrypted;
        decryptData().then(() => {
            message.success("Decrypt From URL Success");
        }).catch(() => {
            message.error("Decrypt From URL Error");
        });
    } else {
        message.info(msg, { duration: 10000 });
    }
}

initData();

// build url
type UrlPart = 'share' | 'encrypted' | 'sid';
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
            case 'sid':
                url += `sid=${secret_id.value}&`;
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
</script>

<template>
    <div class="wrapper">
        <p>{{ EcdhHelp.description }}
            <StoragePanel :storage="storage" :renderer="storageRender" @storage:clear="onStorageClear"></StoragePanel>
        </p>

        <h2>Config</h2>
        <div class="config-item">
            <span>My Private Key:</span>
            <NInput v-model:value="ecdh.my_key_pair.value.private" type="password" show-password-on="click" />
            <NButton @click="generateKey" type="warning">Generate</NButton>
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
            <SelectableInput v-model:value="ecdh.others_public_key.value" placeholder="Input Other's Public Key"
                :options="ls_others_public_key_array_ref.data.value.map(item => ({ label: `${item.value.sid} : ${item.value.pk}`, value: item.value.pk }))" />
        </p>
        <p class="config-item">
            <span>Secret:</span>
            <NInput v-model:value="ecdh.secret.value" type="password" show-password-on="click"
                placeholder="Secret Key = (My Private Key) * (Other's Public Key)" />
            <span style="margin-left: 20px;">sid: {{ secret_id }}</span>
        </p>

        <h2>Encrypt/Decrypt</h2>
        <div class="enc-dec-wrapper flex-responsive-row">
            <div style="flex: 1; width: 100%;">
                <NInput v-model:value="plainText" type="textarea" placeholder="Plain Text..." style="flex: 1"
                    rows="5" />
            </div>

            <div class="flex-responsive-column" style="gap: 1rem;">
                <NButton @click="EncryptEventHandler" type="info"> {{ '>> Encrypt' }}</NButton>
                <NButton @click="DecryptEventHandler" type="success"> {{ 'Decrypt <<' }}</NButton>
            </div>

            <div style="flex: 1; width: 100%;">
                <NInput v-model:value="encryptedText" type="textarea" placeholder="Encrypted Text..." rows="5" />
                <span style="display: flex; gap: 2rem;">
                    <a href="javascript:void(0)" @click="() => CopyTextToClipboard(encryptedText)">Copy Text</a>
                    <a :href="BuildUrl(['share', 'encrypted', 'sid'])" @click="CopyAHrefToClipboard">Copy Url</a>
                </span>
            </div>
        </div>

        <div style="display: flex; gap: 2rem;" class="flex-responsive-row">
            <MarkdownText :markdown="EcdhHelp.help_CN" style="flex: 1;"></MarkdownText>
            <MarkdownText :markdown="EcdhHelp.help_EN" style="flex: 1;"></MarkdownText>
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
    align-items: flex-start;
    gap: 2rem;
}

.enc-dec-wrapper textarea {
    width: 100%;
    height: 200px;
    flex: 1;
}
</style>