import { ref, toValue } from "vue";

export function formatFilesize (size, sep = '.') {
    const formatted = ref("0B"), bytes = toValue(size);
    if (bytes) {
        const i = Math.floor(Math.floor(Math.log(bytes) / Math.log(1000)));
        formatted.value = (bytes / Math.pow(1000, i)).toFixed(i ? 2 : 0).toString().replace('.', sep || '.') + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }
    return { formatted }
}
