const defaultTheme = require('tailwindcss/defaultTheme');

export default {
    content: [
        './src/**/*.{vue,js,html}',
        './node_modules/vx-vue/**/*.js'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                vxvue: {
                    DEFAULT: 'var(--vxvue-color)',
                    '50': 'var(--vxvue-color-50)',
                    '100': 'var(--vxvue-color-100)',
                    '200': 'var(--vxvue-color-200)',
                    '300': 'var(--vxvue-color-300)',
                    '400': 'var(--vxvue-color-400)',
                    '500': 'var(--vxvue-color-500)',
                    '600': 'var(--vxvue-color-600)',
                    '700': 'var(--vxvue-color-700)',
                    '800': 'var(--vxvue-color-800)',
                    '900': 'var(--vxvue-color-900)',
                },
                'vxvue-alt': {
                    DEFAULT: 'var(--vxvue-highlight)',
                    '50': 'var(--vxvue-highlight-50)',
                    '100': 'var(--vxvue-highlight-100)',
                    '200': 'var(--vxvue-highlight-200)',
                    '300': 'var(--vxvue-highlight-300)',
                    '400': 'var(--vxvue-highlight-400)',
                    '500': 'var(--vxvue-highlight-500)',
                    '600': 'var(--vxvue-highlight-600)',
                    '700': 'var(--vxvue-highlight-700)',
                    '800': 'var(--vxvue-highlight-800)',
                    '900': 'var(--vxvue-highlight-900)',
                },
                success: {
                    DEFAULT: 'var(--success-color)',
                    '50': 'var(--success-color-50)',
                    '100': 'var(--success-color-100)',
                    '200': 'var(--success-color-200)',
                    '300': 'var(--success-color-300)',
                    '400': 'var(--success-color-400)',
                    '500': 'var(--success-color-500)',
                    '600': 'var(--success-color-600)',
                    '700': 'var(--success-color-700)',
                    '800': 'var(--success-color-800)',
                    '900': 'var(--success-color-900)',
                },
                error: {
                    DEFAULT: 'var(--error-color)',
                    '50': 'var(--error-color-50)',
                    '100': 'var(--error-color-100)',
                    '200': 'var(--error-color-200)',
                    '300': 'var(--error-color-300)',
                    '400': 'var(--error-color-400)',
                    '500': 'var(--error-color-500)',
                    '600': 'var(--error-color-600)',
                    '700': 'var(--error-color-700)',
                    '800': 'var(--error-color-800)',
                    '900': 'var(--error-color-900)',
                },
                warn: {
                    DEFAULT: 'var(--warn-color)',
                    '50': 'var(--warn-color-50)',
                    '100': 'var(--warn-color-100)',
                    '200': 'var(--warn-color-200)',
                    '300': 'var(--warn-color-300)',
                    '400': 'var(--warn-color-400)',
                    '500': 'var(--warn-color-500)',
                    '600': 'var(--warn-color-600)',
                    '700': 'var(--warn-color-700)',
                    '800': 'var(--warn-color-800)',
                    '900': 'var(--warn-color-900)',
                },
                info: {
                    DEFAULT: 'var(--info-color)',
                    '50': 'var(--info-color-50)',
                    '100': 'var(--info-color-100)',
                    '200': 'var(--info-color-200)',
                    '300': 'var(--info-color-300)',
                    '400': 'var(--info-color-400)',
                    '500': 'var(--info-color-500)',
                    '600': 'var(--info-color-600)',
                    '700': 'var(--info-color-700)',
                    '800': 'var(--info-color-800)',
                    '900': 'var(--info-color-900)',
                },
            },
            spacing: {
                sidebar: '32rem'
            }
        }
    },
    plugins: [
        require('@tailwindcss/forms')({strategy: 'class'}),
        require('@tailwindcss/typography')
    ],
}
