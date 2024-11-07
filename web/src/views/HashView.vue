<script setup lang='ts'>
import { computed, ref } from 'vue';
import { sm3 } from '@/crypto/sm-crypto-v2/src';
import { MD5, SHA1, SHA224, SHA256, SHA384, SHA3, SHA512 } from 'crypto-js';
import DataBox from '@/components/DataBox.vue';
import ShareBox from '@/components/ShareBox.vue';

const data = ref('');

const result_sm3 = computed(() => {
    return sm3(data.value);
});
const result_md5 = computed(() => {
    return MD5(data.value).toString();
});
const result_sha1 = computed(() => {
    return SHA1(data.value).toString();
});
const result_sha224 = computed(() => {
    return SHA224(data.value).toString();
});
const result_sha256 = computed(() => {
    return SHA256(data.value).toString();
});
const result_sha384 = computed(() => {
    return SHA384(data.value).toString();
});
const result_sha3 = computed(() => {
    return SHA3(data.value).toString();
});
const result_sha512 = computed(() => {
    return SHA512(data.value).toString();
});

const url = new URL(window.location.href);
if (url.searchParams.has('data')) {
    data.value = url.searchParams.get('data')!;
}

const share_url = computed(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('data', data.value);
    return url.href;
});
</script>

<template>
    <div style="padding: 0 1rem;">
        <DataBox v-model:data="data" title="Input:" />

        <div style="height: 1rem;"></div>
        <p><span class="title">SM3: </span><span class="result">{{ result_sm3 }}</span></p>
        <p><span class="title">MD5: </span><span class="result">{{ result_md5 }}</span></p>
        <p><span class="title">SHA1: </span><span class="result">{{ result_sha1 }}</span></p>
        <p><span class="title">SHA224: </span><span class="result">{{ result_sha224 }}</span></p>
        <p><span class="title">SHA256: </span><span class="result">{{ result_sha256 }}</span></p>
        <p><span class="title">SHA384: </span><span class="result">{{ result_sha384 }}</span></p>
        <p><span class="title">SHA3: </span><span class="result">{{ result_sha3 }}</span></p>
        <p><span class="title">SHA512: </span><span class="result">{{ result_sha512 }}</span></p>

        <div style="height: 1rem;"></div>
        <ShareBox :url="share_url" text="This page support URL parameter:" />
    </div>
</template>

<style scoped>
p .title {
    font-weight: bold;
}

.result {
    user-select: all;
    word-break: break-all;
}
</style>