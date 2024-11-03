<script setup lang='ts'>
import { computed, ref, toRefs } from 'vue';
import { NButton, NCard, NModal, useDialog } from 'naive-ui';
import MarkdownText from './MarkdownText.vue';
import { type LocalStorageSection } from '@/stores/LocalStorage';

const props = defineProps<{
    storage: LocalStorageSection,
    renderer?: (key: string, value: any) => { title: string, code: string } | null,
}>();

const emit = defineEmits<{
    (e: 'storage:clear', data: void): void;
}>();

const dialog = useDialog();
const { storage } = toRefs(props);

const show_storage_panel = ref(false);
const rendered = ref('');

function defaultRender(key: string, value: any) {
    if (typeof value === 'string') {
        return {
            title: key,
            code: value,
        };
    } else {
        return {
            title: key,
            code: JSON.stringify(value, null, 4),
        };
    }
}

function refreshRendered() {
    let keys = Object.keys(storage.value.data);
    let result = '';
    for (let key of keys) {
        let value = storage.value.data[key];
        let render = props.renderer || defaultRender;
        let { title, code } = render(key, value) || defaultRender(key, value);
        result += `## ${title}\n\`\`\`json\n${code}\n\`\`\`\n\n`;
    }
    rendered.value = result;
}

function clearStorageEventHandler() {
    dialog.error({
        title: 'Clear Local Storage',
        content: 'All data will lost. Are you sure?',
        positiveText: 'Yes',
        negativeText: 'Cancel',
        maskClosable: true,
        onPositiveClick: () => {
            emit('storage:clear');
            storage.value.clear();
            refreshRendered();
        },
    });
}
</script>

<template>
    <a href="javascript:void(0)" @click="refreshRendered(); show_storage_panel = true">LocalStorage</a>
    <NModal v-model:show="show_storage_panel">
        <NCard class="card" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <div class="header">
                <NButton type="error" @click="clearStorageEventHandler">Clean Storage</NButton>
                <NButton type="default" @click="show_storage_panel = false">Close</NButton>
            </div>
            <MarkdownText :markdown="rendered" />
        </NCard>
    </NModal>
</template>

<style scoped>
.card {
    max-width: 800px;
}

.header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}
</style>