<script setup lang='ts'>
import { h, ref, watch, onMounted, onUnmounted, computed, nextTick, type Ref } from 'vue';
import {
    NLayoutSider, NLayout, NLayoutContent,
    NMenu, type MenuOption, NButton,
    NPopover,
    NInput,
    NModal, NCard,
    NScrollbar, type ScrollbarInst,
    useMessage, useDialog,
    NIcon,
    NCheckbox,
    NDropdown, type DropdownOption,
} from 'naive-ui';
import { LocalStorageSection } from '@/stores/LocalStorage';
import { MsgStore, MsgSession, MsgSessionHistory, type SessionHistoryItem } from '@/stores/MsgStore';

import { FormatTimestamp } from '@/crypto/DateTime';
import { help_EN, help_CN } from './MsgViewData';
import ShareBox from '@/components/ShareBox.vue';
import DataBox from '@/components/DataBox.vue';
import Icon from '@/components/Icon';
import StoragePanel from '@/components/StoragePanel.vue';
import MarkdownText from '@/components/MarkdownText.vue';

const message = useMessage();
const dialog = useDialog();
const storage = new LocalStorageSection('msg');
const msgStore = new MsgStore(storage);

const inputRef = ref<HTMLInputElement | null>(null);
const inputData = ref('');
const currentSession = ref<MsgSession | null>(null) as Ref<MsgSession | null>;
const currentHistory = computed(() => {
    scrollbarToBottom();
    const sid = currentSession.value?.index.sid;
    return msgStore.getHistory(sid);
});
const currentSessionName = computed({
    get: () => currentSession.value?.tag || '',
    set: (v) => {
        if (currentSession.value) {
            currentSession.value.tag = v;
            msgStore.saveSessions();
        }
    }
})

function EncryptAndCopyUrl_ClickEventHandler() {
    const input = inputData.value;
    if (!input || !currentSession.value) {
        return;
    }
    const encrypted = currentSession.value.encrypt(input);
    const item: SessionHistoryItem = {
        plainData: input,
        encrypted: encrypted,
        from: 'me',
        created: Date.now(),
    };
    currentHistory.value?.push(item);
    try {
        navigator.clipboard.writeText(BuildEncryptedUrl(currentSession.value, item));
        message.success('Encrypted Data URL Copied to Clipboard.');
        inputData.value = '';
        inputRef.value?.focus();
    } catch (e) {
        message.error('Error ' + e);
    }
}
function Decrypt_ClickEventHandler() {
    const input = inputData.value;
    if (!input || !currentSession.value) {
        return;
    }
    if (!/^([0-9a-fA-F]{32})+$/.test(input)) {
        message.error('Invalid Encrypted Data.');
        return;
    }
    try {
        const msg = currentSession.value.decrypt(input);
        const item: SessionHistoryItem = {
            plainData: msg,
            encrypted: input,
            from: 'other',
            created: Date.now(),
        };
        currentHistory.value?.push(item);
        inputData.value = '';
        inputRef.value?.focus();
    } catch (e) {
        message.error('Decrypt ' + e);
    }
}
function resetPrivateKey() {
    dialog.error({
        title: 'Reset New Key',
        content: 'Are you sure to regenrate a new private key?',
        positiveText: 'Reset',
        negativeText: 'Cancel',
        onPositiveClick: () => {
            msgStore.resetKeyPair();
        },
    });
}
function afterStorageClear() {
    localStorageShow.value = false;
    msgStore.resetKeyPair();
    window.location.reload();
}

// message options
function selectMsgOptionHandler(key: string | number, option: DropdownOption) {
    if (typeof option.onClick === 'function') {
        option.onClick();
    }
}
function getMsgOptions(msg: SessionHistoryItem) {
    return [
        {
            type: 'render',
            render: () => h('span', {
                class: 'created', style: {
                    'font-size': '.8rem',
                    'color': '#666',
                    'margin': '0 1rem',
                }
            }, FormatTimestamp(msg.created)),
        },
        {
            label: 'Copy Share URL',
            icon: () => h(Icon, { icon: 'link' }),
            onClick: () => {
                copyEncryptedUrl(msg);
            },
        },
        {
            label: 'Copy Encrypted Hex',
            icon: () => h(Icon, { icon: 'copy' }),
            onClick: () => {
                navigator.clipboard.writeText(msg.encrypted);
                message.success('Encrypted Hex Copied to Clipboard.');
            },
        },
        {
            label: 'Copy Plain Text',
            icon: () => h(Icon, { icon: 'copy' }),
            onClick: () => {
                navigator.clipboard.writeText(msg.plainData);
                message.success('Plain Text Copied to Clipboard.');
            },
        },
        {
            // divider
            type: 'render',
            render: () => h('div', {
                style: {
                    'height': '1px',
                    'background-color': '#ccc',
                    'margin': '.5rem 0',
                }
            }),
        },
        {
            label: 'Delete',
            props: { style: { color: 'red' } },
            icon: () => h(Icon, { icon: 'delete' }),
            onClick: () => {
                dialog.warning({
                    title: 'Delete Message',
                    content: 'Are you sure to delete this message?',
                    positiveText: 'Delete',
                    negativeText: 'Cancel',
                    onPositiveClick: () => {
                        currentHistory.value?.remove(msg.created);
                    }
                });
            },
        },
    ];
}

// URL process
function copyCurrentSessionUrl() {
    if (!currentSession.value) {
        return;
    }
    let url = window.location.origin + window.location.pathname + `?sid=${currentSession.value?.index.sid}`;
    if (currentSession.value.index.params.type === 'ecdh') {
        url += `&share=${currentSession.value.index.params.my_public_key}`;
    }
    try {
        navigator.clipboard.writeText(url);
        message.success('Session URL Copied to Clipboard.');
    } catch (e) {
        message.error('Copy URL ' + e);
    }
}
function copyEncryptedUrl(msg: SessionHistoryItem) {
    try {
        navigator.clipboard.writeText(BuildEncryptedUrl(currentSession.value!, msg));
        message.success('Encrypted Data URL Copied to Clipboard.');
    } catch (e) {
        message.error('Copy URL ' + e);
    }
}
function BuildEncryptedUrl(session: MsgSession, msg: SessionHistoryItem) {
    let shareField = '';
    if (session.index.params.type === 'ecdh') {
        shareField = `share=${session.index.params.my_public_key}&`;
    }
    return window.location.origin + window.location.pathname + `?${shareField}sid=${session.index.sid}&encrypted=${msg.encrypted}&id=${msg.created}`;
}

const lastSelectedSessionSid = storage.getValueRef<string>('last_selected_session_sid');
watch(() => currentSession.value, (v) => {
    if (v) {
        lastSelectedSessionSid.value = v.index.sid;
    }
});

const url_decrypt_success = (msg: SessionHistoryItem) => {
    dialog.success({
        title: 'Decrypted',
        content: () => h(MarkdownText, {
            markdown: `
Decrypted Content:
\`\`\`
${msg.plainData}
\`\`\`
` }),
        positiveText: 'OK',
    });
}
const url_decrypt_error = (err: unknown, encrypted: string | null, sid: string | null) => {
    let md = '';
    if (err) {
        md = `${err}`;
    } else {
        md = 'Unknown Error';
    }
    dialog.error({
        title: 'Decrypt URL Error',
        content: () => h(MarkdownText, { markdown: md, }),
        positiveText: 'OK',
    });
}
function ProcessUrlParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const url_share = urlParams.get('share');
    const url_sid = urlParams.get('sid');
    const url_encrypted = urlParams.get('encrypted');
    const url_msg_id = urlParams.get('id');

    try {
        currentSession.value = msgStore.getSession(url_sid, url_share);
        if (url_encrypted) {
            if (currentSession.value) {
                const ts = parseInt(url_msg_id || '0') || Date.now();
                const r = currentSession.value.decrypt(url_encrypted);
                const item: SessionHistoryItem = {
                    plainData: r,
                    encrypted: url_encrypted,
                    from: 'other',
                    created: ts,
                };
                currentHistory.value?.push(item);
                url_decrypt_success(item);
            } else {
                throw new Error(`Session not found.

### PSK (Pre-Shared-Key) Situation:

Create a New Session with the **Same PSK**, then try again.
`);
            }
        } else if (!currentSession.value) {
            currentSession.value = msgStore.getSession(lastSelectedSessionSid.value);
        }
    } catch (e) {
        url_decrypt_error(e, url_encrypted, url_sid);
    }
}

nextTick(() => {
    ProcessUrlParameter();
});

// UI data
const sidebarSelectedValue = computed(() => {
    return currentSession.value?.index.sid || '__new';
});
const sidebarOptions = computed<MenuOption[]>(() => {
    return [{
        label: 'New Session',
        key: '__new',
        icon: () => h(Icon, { icon: 'add' }),
        onClick: () => {
            newSessionModalShow.value = true;
        },
    },
    {
        type: 'divider',
    },
    ...msgStore.sessions.value.map((session) => ({
        label: session.isMe ? 'ME' : session.index.tag,
        key: session.index.sid,
        icon: () => h(Icon, { icon: getIconName(session.type) }),
        onClick: () => {
            currentSession.value = session as MsgSession;
        },
    }))];
});
function getIconName(type?: string) {
    return type == 'psk' ? 'peopleGroup'
        : type == 'me' ? 'face' : 'lock';
}
// local storage modal
const localStorageShow = ref(false);
function storageRenderer(key: string, value: any) {
    // array
    if (key === 'msg_my_private_key') {
        return {
            title: key,
            code: '******** (Hidden)',
        };
    }
    if (Array.isArray(value)) {
        return {
            title: key,
            code: Array.from(value).map(i => JSON.stringify(i)).join('\n'),
        };
    }
    return null;
}
// help modal
const helpModalShow = ref(false);
const helpChineseChecked = ref(false);
const helpText = computed(() => {
    return helpChineseChecked.value ? help_CN : help_EN;
});
// setting modal
const settingModalShow = ref(false);
// new session modal
const newSessionModalShow = ref(false);
const newSessionUrl = computed(() => {
    return window.location.origin + window.location.pathname + `?share=${msgStore.my_key_pair.public}`;
})
const newSessionPsk = ref('');
function newSessionPskStart() {
    if (newSessionPsk.value) {
        currentSession.value = msgStore.getPskSession(newSessionPsk.value);
        newSessionPsk.value = '';
        newSessionModalShow.value = false;
    } else {
        //
    }
}
// current session
const currentSessionInfoShow = ref(false);
function deleteCurrentSession() {
    dialog.warning({
        title: 'Delete Session',
        content: 'Are you sure to delete this session?',
        positiveText: 'Delete',
        negativeText: 'Cancel',
        onPositiveClick: () => {
            currentSessionInfoShow.value = false;
            if (currentHistory.value) {
                currentHistory.value.clear();
            }
            if (currentSession.value) {
                const sid = currentSession.value.index.sid;
                msgStore.removeSession(sid);
                currentSession.value = null;
            }
        },
    });
}
// history scrollbar
const scrollbarRef = ref<ScrollbarInst | null>(null);
const historyRef = ref<HTMLElement | null>(null);
const scrollbarToBottom = () => {
    scrollbarRef.value?.scrollTo({ top: historyRef.value?.scrollHeight, behavior: 'instant' })
}

// check screen size
const isSmallScreen = ref(false);
const checkScreenSize = () => {
    isSmallScreen.value = window.innerWidth <= 768;
};
onMounted(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    // inputRef.value?.focus();
});
onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize);
});
</script>

<template>
    <div class="msgWrapper">
        <div style="margin: 0rem 1rem; margin-bottom: .5rem;">
            Off-line Crypto Message Tool.
            <div style='float: right;'>
                <NButton v-if="isSmallScreen" :render-icon="() => h(Icon, { icon: 'add' })"
                    @click="newSessionModalShow = true">New Session
                </NButton>
                <NButton :render-icon="() => h(Icon, { icon: 'help' })" @click="helpModalShow = true">Help</NButton>
                <NButton :render-icon="() => h(Icon, { icon: 'setting' })" @click="settingModalShow = true"></NButton>
            </div>
        </div>
        <NLayout has-sider style="">
            <NLayoutSider v-if="!isSmallScreen" bordered :width="250">
                <NMenu :options="sidebarOptions" :value='sidebarSelectedValue' />
            </NLayoutSider>
            <NLayoutContent content-style="padding: 0 15px; display: flex; flex-direction: column; gap: 0;">
                <!-- Session 标题栏 -->
                <div style="display: flex; margin-bottom: 1rem; align-items: center">
                    <NPopover trigger="hover" placement="bottom" v-if="isSmallScreen">
                        <template #trigger>
                            <NButton :render-icon="() => h(Icon, { icon: 'menu' })"></NButton>
                        </template>
                        <NMenu :options="sidebarOptions" :value='sidebarSelectedValue' />
                    </NPopover>
                    <NPopover trigger="hover" placement="bottom-start">
                        <template #trigger>
                            <div style='flex: 1; display: flex; align-items: center;'>
                                <div v-if="currentSession"
                                    style="width: 24px; height: 24px; font-size: 20px; margin: 0 8px;">
                                    <Icon :icon="getIconName(currentSession.type)" />
                                </div>
                                <span style='flex: 1; font-weight: bold; font-size: 1.2rem;'>
                                    {{ currentSession?.isMe ? 'ME' : currentSession?.tag }}
                                </span>
                            </div>
                        </template>
                        <div style='display: flex; flex-direction: column; gap: .1rem;'>
                            <div>
                                <span style="font-weight: bold;">Type: </span>
                                <span>{{ currentSession?.index.params.type }}</span>
                            </div>
                            <div>
                                <span style="font-weight: bold;">Session ID: </span>
                                <span>{{ currentSession?.index.sid }}</span>
                            </div>
                            <div>
                                <span style="font-weight: bold;">Created: </span>
                                <span>{{ FormatTimestamp(currentSession!.index.created) }}</span>
                            </div>
                        </div>
                    </NPopover>
                    <NButton :render-icon="() => h(Icon, { icon: 'info' })" @click='currentSessionInfoShow = true'
                        :disabled="!currentSession">
                    </NButton>
                </div>
                <!-- 聊天记录 -->
                <div class="history">
                    <NScrollbar ref='scrollbarRef'>
                        <div ref="historyRef" class="inner-history">
                            <div class="message-box" v-for="msg in currentHistory?.value">
                                <div class="message" :class="msg.from">
                                    <NDropdown trigger="hover" size="small" :options="getMsgOptions(msg)"
                                        @select="selectMsgOptionHandler">
                                        <p class="plain">{{ msg.plainData }}</p>
                                    </NDropdown>
                                    <!-- <NPopover trigger="hover" placement="bottom">
                                        <template #trigger>
                                            <p class="plain">{{ msg.plainData }}</p>
                                        </template>
                                        <div style='display: flex; flex-direction: column; gap: .3rem;'>
                                            <NButton :render-icon="() => h(Icon, { icon: 'share' })" type='info'
                                                size='small' @click="copyEncryptedUrl(msg)">Copy Share URL</NButton>
                                            <NButton :render-icon="() => h(Icon, { icon: 'copy' })" size='small'>Copy
                                                Plain Text
                                            </NButton>
                                            <NButton :render-icon="() => h(Icon, { icon: 'copy' })" size='small'>Copy
                                                Encrypted Hex
                                            </NButton>
                                            <NButton :render-icon="() => h(Icon, { icon: 'delete' })" type='error'
                                                size='small'>Delete
                                            </NButton>
                                            <span class="created">{{ FormatTimestamp(msg.created) }}</span>
                                        </div>
                                    </NPopover> -->
                                </div>
                            </div>
                        </div>
                    </NScrollbar>
                </div>
                <NInput ref='inputRef' v-model:value="inputData" placeholder="Input Data..." type="textarea"
                    style="max-height: 5rem;" :disabled="!currentSession" />
                <div style="margin-top: .5rem;">
                    <NButton type="info" @click="Decrypt_ClickEventHandler"
                        :render-icon="() => h(Icon, { icon: 'lockOn' })" :disabled="!currentSession">
                        Decrypt
                    </NButton>
                    <NButton style="float: right;" type="success" @click="EncryptAndCopyUrl_ClickEventHandler"
                        :render-icon="() => h(Icon, { icon: 'lock' })" :disabled="!currentSession">
                        Encrypt And Copy URL
                    </NButton>
                </div>
            </NLayoutContent>
        </NLayout>
        <!-- New Session Modal -->
        <NModal v-model:show="newSessionModalShow">
            <NCard :bordered="false" size="huge" role="dialog" aria-modal="true" style="max-width: 600px;">
                <p style="font-weight: bold; font-size: 1.2rem;">Negotiate Session:</p>
                <p>1. Share URL to Other.</p>
                <p>2. Open Other's URL to start New session.</p>
                <ShareBox :url="newSessionUrl" />

                <p style="margin-top: 2rem; font-weight: bold; font-size: 1.2rem;">Or use PSK (pre-shared-key):</p>
                <div class="flex-responsive-row">
                    <NInput v-model:value='newSessionPsk' placeholder="Pre-Shared-Key..." type="password"
                        show-password-on='click' />
                    <NButton @click="newSessionPskStart">Start</NButton>
                </div>
            </NCard>
        </NModal>
        <!-- setting panel modal -->
        <NModal v-model:show="settingModalShow">
            <NCard :bordered="false" size="huge" role="dialog" aria-modal="true" style="max-width: 600px;">
                <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                    <div>
                        <h3>My Private Key:</h3>
                        <NInput v-model:value='msgStore.my_key_pair.private' type='password' show-password-on='click'
                            :autofocus="false" style="max-height: 5rem;" />
                        <p>
                            <span style="background-color: #f0f0f0; font-weight: bold; font-size: 1.1rem;">
                                Please take care of your private key.
                            </span>
                        </p>
                        <NButton :render-icon="() => h(Icon, { icon: 'reset' })" type="warning"
                            @click='resetPrivateKey'>
                            Regenerate New Key
                        </NButton>
                    </div>
                    <div>
                        <h3>My Public Key:</h3>
                        <p style='background-color: #f0f0f0; user-select: all;'>{{ msgStore.my_key_pair.public }}</p>
                    </div>
                    <div>
                        <h3>Local Storage:</h3>
                        <NButton @click="localStorageShow = true" type='info'>Manage Local Storage</NButton>
                    </div>
                </div>
            </NCard>
        </NModal>
        <StoragePanel v-model:show="localStorageShow" :button-visible='false' :storage="storage"
            :renderer="storageRenderer" @storage:clear="afterStorageClear">
        </StoragePanel>
        <!-- Session Info Modal -->
        <NModal v-model:show="currentSessionInfoShow">
            <NCard :bordered="false" size="huge" role="dialog" aria-modal="true" style="max-width: 600px;">
                <div style="display: flex; flex-direction: column; gap: .4rem;">
                    <div>
                        <span style="font-weight: bold;">Session ID: </span>
                        <span>{{ currentSession?.index.sid }}</span>
                        <NButton :render-icon="() => h(Icon, { icon: 'copy' })" @click='copyCurrentSessionUrl'
                            style='margin-left: 1rem;'>
                            Copy URL
                        </NButton>
                    </div>
                    <div>
                        <span style="font-weight: bold;">Session Name: </span>
                        <span v-if='currentSession?.isMe'>ME</span>
                        <NInput v-else style="display: inline-block;" v-model:value='currentSessionName'
                            placeholder="Session Name..." />
                    </div>
                    <div>
                        <span style="font-weight: bold;">Created: </span>
                        <span>{{ FormatTimestamp(currentSession?.index.created || null) }}</span>
                    </div>
                    <div>
                        <span style="font-weight: bold;">Type: </span>
                        <span>{{ currentSession?.index.params.type }}</span>
                    </div>
                    <div v-if="currentSession?.index.params.type === 'ecdh'">
                        <span style="font-weight: bold;">My Public Key: </span>
                        <span style='word-break: break-all; user-select: all;'>
                            {{ currentSession?.index.params.my_public_key }}</span>
                        <br />
                        <span style="font-weight: bold;">Other's Public Key: </span>
                        <span style='word-break: break-all; user-select: all;'>
                            {{ currentSession?.index.params.other_public_key }}</span>
                    </div>
                    <div>
                        <span style="font-weight: bold;">Danger:</span><br />
                        <NButton :render-icon="() => h(Icon, { icon: 'delete' })" type="error"
                            @click='deleteCurrentSession'>
                            Delete Session
                        </NButton>
                    </div>
                </div>
            </NCard>
        </NModal>
        <NModal v-model:show="helpModalShow">
            <NCard :bordered="false" size="huge" role="dialog" aria-modal="true"
                style="max-width: 600px; margin: 2rem auto;">
                <NCheckbox v-model:checked='helpChineseChecked'>中文说明</NCheckbox>
                <MarkdownText :markdown="helpText" />
                <NButton @click="helpModalShow = false" style='margin-top: 2rem;'>Close</NButton>
            </NCard>
        </NModal>
    </div>
</template>

<style scoped>
.msgWrapper {
    margin: 0 auto;
    width: 100%;
    max-width: 800px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.history {
    min-height: 50px;
    border: 1px solid #ccc;
    border-radius: .5rem;
    flex: 1 1 auto;
    height: 0;
}

.inner-history {
    display: flex;
    flex-direction: column;
    margin-right: 1.2rem;
}

.message-box {
    width: 100%;
    display: block;
    margin: .1rem .5rem;
}

.message {
    padding: .5rem;
    margin: .5rem;
    border-radius: .5rem;
    word-break: break-all;
    display: block;
}

.message.me {
    background-color: #95ec69;
    float: right;
    margin-left: 3rem;
}

.message.other {
    background-color: #f0f0f0;
    float: left;
    margin-right: 3rem;

}
</style>