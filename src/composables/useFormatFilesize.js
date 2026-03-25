import { computed, toValue } from 'vue'

export function useFormatFilesize (size, sep = '.') {
    const formatted = computed(() => {
        const bytes = Number(toValue(size))
        if (!Number.isFinite(bytes) || bytes <= 0) return '0B'

        const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
        const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1);
        const value = bytes / (1000 ** exp);
        return (!exp ? String(value) : value.toFixed(2)).replace('.', sep) + units[exp]
    })
    return { formatted }
}
