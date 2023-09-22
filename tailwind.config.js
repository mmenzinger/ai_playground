module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    plugins: [
        require('daisyui'),
        require('@tailwindcss/typography'),
    ],
    daisyui: {
        themes: [
            {
                c4f_light: {
                    "primary": "#f97316",
                    "secondary": "#38bdf8",
                    "accent": "#8b5cf6",
                    "neutral": "#2b3440",
                    "base-100": "#ffffff",
                    "info": "#3abff8",
                    "success": "#36d399",
                    "warning": "#fbbd23",
                    "error": "#f87272",
                },
            },
            {
                c4f_dark: {
                    "primary": "#000000",
                    "secondary": "#000000",
                    "accent": "#000000",
                    "neutral": "#000000",
                    "base-100": "#000000",
                    "info": "#3abff8",
                    "success": "#36d399",
                    "warning": "#fbbd23",
                    "error": "#f87272",
                },
            },
        ],
    }
};