<script setup lang='ts'>
import { computed, type VNodeChild } from 'vue';
import { NSelect, type SelectOption } from 'naive-ui';
const props = defineProps<{
    value: string;
    placeholder?: string;
    options: { label: string; value: string }[];
}>();
const emit = defineEmits<{
    (event: 'update:value', value: string): void;
}>();

const value = computed({
    get: () => props.value,
    set: (v) => emit('update:value', v),
});

const renderTag = (props: { option: SelectOption, handleClose: () => void }): VNodeChild => {
    return props.option.value;
}
</script>

<template>
    <NSelect v-model:value="value" :options="options" :placeholder="placeholder" filterable tag :show-arrow="false"
        :render-tag="renderTag">
    </NSelect>
</template>

<style scoped></style>