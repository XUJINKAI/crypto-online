<script setup lang='ts'>
import { computed, ref } from 'vue';
import { NInput, NButton, useMessage } from 'naive-ui';
const props = withDefaults(defineProps<{
    title?: string;
    text?: string;
    url: string;
    share?: boolean;
}>(), {
});
const message = useMessage();

async function CopyToClipboard() {
    try {
        if (!props.url) {
            message.error('Nothing to Copy');
            return;
        }
        await navigator.clipboard.writeText(props.url);
        message.success('Copied to Clipboard');
    } catch (e) {
        // message.error('Failed to Copy to Clipboard');
    }
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const canShare = computed(() => {
    return !!navigator.share && props.share && isMobile();
    return true;
});

async function ClickEventHandler(e: MouseEvent) {
    await CopyToClipboard();
}

function preventDefault(e: MouseEvent) {
    e.preventDefault();
}

async function Share(e: MouseEvent) {
    e.preventDefault();
    await navigator.share({
        title: props.title,
        text: props.text,
        url: props.url,
    });
}
</script>

<template>
    <div class="share" @click="ClickEventHandler" title="Click to Copy">
        <NButton class="share-button" v-if="canShare" @click="Share" size="small" type="primary">Share</NButton>
        <span v-if="text">{{ text }}</span><br v-if='text'>
        <a :href="url" @click="preventDefault">{{ url }}</a>
    </div>
</template>

<style scoped>
.share {
    cursor: pointer;
    user-select: all;
    padding: 10px;
    border: 1px solid #000;
    border-radius: 5px;
    max-height: 6rem;
    overflow: auto;
    color: rgb(5, 18, 9);
    background-color: rgb(221, 221, 221);
}

.share span,
.share br {
    font-size: small;
    word-break: break-all;
    user-select: none;
}

.share a {
    text-decoration: none;
    color: inherit;
    word-break: break-all;
    font-size: small;
    text-overflow: ellipsis;
    font-weight: bold;
}

.share a:focus-visible {
    outline: 0;
    outline-offset: 0;
}

.share-button {
    margin-left: 1rem;
    float: right;
    height: 1.3rem;
}
</style>