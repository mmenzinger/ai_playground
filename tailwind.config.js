module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    plugins: [
        require('daisyui'),
        require('@tailwindcss/typography'),
    ],
    darkMode: 'class',
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["[data-theme=light]"],
                    "primary": "#f97316",
                },
            },
            {
                dark: {
                    ...require("daisyui/src/theming/themes")["[data-theme=dracula]"],
                    "primary": "#f97316",
                },
            },
        ],
    }
};