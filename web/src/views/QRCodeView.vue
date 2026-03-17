<script setup lang='ts'>
import { computed, ref } from 'vue';
import { NQrCode, NButton, NSlider, NRadioButton, NRadioGroup, NModal, NCard, useMessage } from 'naive-ui';
import { QrcodeStream } from 'vue-qrcode-reader';
import DataBox from '@/components/DataBox.vue';
import ShareBox from '@/components/ShareBox.vue';

const data = ref('https://xujinkai.net');
const size = ref(200);
const message = useMessage();

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

const showScanner = ref(false);
const showResultDialog = ref(false);
const scanResult = ref({ success: false, text: '', error: '' });

const onDetect = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
        const resultText = detectedCodes[0].rawValue;
        data.value = resultText;
        scanResult.value = { success: true, text: resultText, error: '' };
        showScanner.value = false;
        showResultDialog.value = true;
    }
};

const onCameraError = (err: Error) => {
    console.error('Camera error:', err);
    scanResult.value = { success: false, text: '', error: err.message };
    showScanner.value = false;
    showResultDialog.value = true;
};

const handleCopyResult = async () => {
    try {
        await navigator.clipboard.writeText(scanResult.value.text);
        message.success('Copied to clipboard');
    } catch (err) {
        message.error('Failed to copy');
        console.error('Failed to copy: ', err);
    }
};
</script>

<template>
    <div style="padding: 0 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;">
            <h2 style="margin: 0;">QR Code Generator & Scanner</h2>
            <NButton type="primary" @click="showScanner = true">Scan QR Code</NButton>
        </div>

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

        <ShareBox :url="share_url" text="This page support URL parameter:" />

        <!-- Scanner Modal -->
        <NModal v-model:show="showScanner">
            <NCard style="width: 600px; max-width: 90vw;" title="Scan QR Code" closable @close="showScanner = false"
                role="dialog" aria-modal="true">
                <div v-if="showScanner">
                    <QrcodeStream @detect="onDetect" @error="onCameraError"></QrcodeStream>
                </div>
            </NCard>
        </NModal>

        <!-- Result Modal -->
        <NModal v-model:show="showResultDialog">
            <NCard style="width: 400px; max-width: 90vw;" :title="scanResult.success ? 'Scan Result' : 'Scan Failed'" closable @close="showResultDialog = false"
                role="dialog" aria-modal="true">
                
                <div v-if="scanResult.success">
                    <p style="word-break: break-all; margin-bottom: 1.5rem;">{{ scanResult.text }}</p>
                    <div style="display: flex; justify-content: flex-end;">
                         <NButton type="primary" @click="handleCopyResult">Copy Result</NButton>
                    </div>
                </div>

                <div v-else>
                    <p style="color: red; word-break: break-all;">Error: {{ scanResult.error }}</p>
                    <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
                         <NButton @click="showResultDialog = false">Close</NButton>
                    </div>
                </div>

            </NCard>
        </NModal>
    </div>
</template>

<style scoped></style>