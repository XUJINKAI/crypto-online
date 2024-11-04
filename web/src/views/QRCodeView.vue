<script setup lang='ts'>
import { computed, ref } from 'vue';
import { NQrCode, NButton, NSlider, NRadioButton, NRadioGroup } from 'naive-ui';
import DataBox from '@/components/DataBox.vue';
import ShareBox from '@/components/ShareBox.vue';

const data = ref('');
const size = ref(200);

const errorCorrectionLevel = ref('M')
const errorCorrectionOptions = [
    { value: 'L', label: 'L' },
    { value: 'M', label: 'M' },
    { value: 'Q', label: 'Q' },
    { value: 'H', label: 'H' }
]

const url = new URL(window.location.href);
if (url.searchParams.has('data')) {
    data.value = url.searchParams.get('data')!;
}
if (url.searchParams.has('size')) {
    size.value = parseInt(url.searchParams.get('size')!);
}
if (url.searchParams.has('error')) {
    errorCorrectionLevel.value = url.searchParams.get('error')!;
}

const share_url = computed(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('error', errorCorrectionLevel.value);
    url.searchParams.set('size', size.value.toString());
    url.searchParams.set('data', data.value);
    return url.href;
});

const handleDownloadQRCode = () => {
    const canvas = document
        .querySelector('#qr-code')
        ?.querySelector<HTMLCanvasElement>('canvas')
    if (canvas) {
        const url = canvas.toDataURL()
        const a = document.createElement('a')
        a.download = 'QRCode.png'
        a.href = url
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }
};
</script>

<template>
    <div>
        <h2>QR Code Generator</h2>

        <div class="flex-responsive-row" style="gap: 1rem; margin-top: 1rem;">
            <DataBox v-model:data="data">
                Error Correction Level:
                <NRadioGroup v-model:value="errorCorrectionLevel">
                    <NRadioButton v-for="errorCorrection in errorCorrectionOptions" :key="errorCorrection.value"
                        :value="errorCorrection.value" :label="errorCorrection.label" />
                </NRadioGroup>
                <p>
                    Size:
                    <NSlider v-model:value="size" :min="100" :max="500" />
                </p>
                <NButton @click="handleDownloadQRCode" style="margin-top: 1rem;">Download</NButton>
            </DataBox>
            <NQrCode id="qr-code" :value="data" :size="size" :error-correction-level="errorCorrectionLevel"
                style="width: 100%; max-width: 500px; margin: 0 auto;" />
        </div>

        <div style="height: 1rem;"></div>

        <div style="height: 1rem;"></div>
        <ShareBox :url="share_url" text="This page support URL parameter:" />
    </div>
</template>

<style scoped></style>