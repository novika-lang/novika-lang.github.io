/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      fontFamily: {
        main: ["Barlow", "Helvetica", "Arial", "sans-serif"],
        "variation-mono": ["Iosevka Curly", "monospace"],
      },
    },
  },

  plugins: [],
};

module.exports = config;
