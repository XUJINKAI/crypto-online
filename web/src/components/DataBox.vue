<script setup lang='ts'>
import { computed, ref, toRefs, withDefaults } from 'vue';
import { NInput, NButton, type InputInst } from 'naive-ui';
import { type HexString } from '@/crypto/Data';

const props = defineProps<{
    data: HexString;
    title?: string;
    error?: boolean;
}>()
const emit = defineEmits<{
    (e: 'update:data', data: HexString): void;
    (e: 'ctrl+enter'): void;
}>();

const { data } = toRefs(props);

function keydownProcess(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'Enter') {
        emit('ctrl+enter');
    }
}

const inputRef = ref<InputInst | null>(null);
</script>

<template>
    <div class="input-box">
        <slot name="title">
            <h3>{{ title }}</h3>
        </slot>
        <NInput ref="inputRef" class="input" :value="data" @update:value="d => emit('update:data', d)"
            :status="error === true ? 'error' : 'success'" @keydown="keydownProcess" type="textarea" rows="5"
            placeholder="Input Data..." />
        <slot> </slot>
    </div>
</template>

<style scoped>
.input-box {
    width: 100%;
}

.input {
    /* width: 100%; */
}
</style>