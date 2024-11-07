<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { Base64Encode, Base64Decode } from '@/crypto/base64';
import DataBox from '@/components/DataBox.vue';
import ShareBox from '@/components/ShareBox.vue';
import { NCheckbox } from 'naive-ui';

const plainData = ref('');
const base64Data = ref('');
const errorMsg = ref<any>(null);

const pauseWatcher = ref(false);
watch(plainData, () => {
    if (pauseWatcher.value) {
        return;
    }
    pauseWatcher.value = true;
    Base64Encode(plainData.value).then((res) => {
        base64Data.value = res;
        errorMsg.value = null;
    }).catch(e => {
        errorMsg.value = e;
    }).finally(() => {
        pauseWatcher.value = false;
    });
})
watch(base64Data, () => {
    if (pauseWatcher.value) {
        return;
    }
    pauseWatcher.value = true;
    Base64Decode(base64Data.value).then((res) => {
        plainData.value = res;
        errorMsg.value = null;
    }).catch(e => {
        errorMsg.value = e;
    }).finally(() => {
        pauseWatcher.value = false;
    });
})

const url = new URL(window.location.href);
if (url.searchParams.has('data')) {
    const mode = url.searchParams.get('mode');
    if (mode === 'decode') {
        base64Data.value = url.searchParams.get('data') || '';
    } else {
        plainData.value = url.searchParams.get('data') || '';
    }
}

const share_url_mode_decode = ref(false);
const share_url = computed(() => {
    const url = new URL(window.location.href);
    if (share_url_mode_decode.value) {
        url.searchParams.set('data', base64Data.value);
        url.searchParams.set('mode', 'decode');
    } else {
        url.searchParams.set('data', plainData.value);
        url.searchParams.set('mode', 'encode');
    }
    return url.href;
});
</script>

<template>
    <div style="padding: 0 1rem;">
        <div class="flex-responsive-row" style="gap: 1rem;">
            <DataBox v-model:data="plainData" title="Plain Data:" />
            <DataBox v-model:data="base64Data" title="Base64 Data:" :error="errorMsg != null" />
        </div>
        <p class="error">{{ errorMsg }}</p>

        <div style="height: 1rem;"></div>
        <NCheckbox v-model:checked="share_url_mode_decode">Decode mode URL</NCheckbox>
        <ShareBox :url="share_url" text="This page support URL parameter:" />
    </div>
</template>

<style scoped>
.error {
    word-break: break-all;
    margin-top: 1rem;
    color: red;
}
</style>