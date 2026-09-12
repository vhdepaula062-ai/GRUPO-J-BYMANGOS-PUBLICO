/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui-web/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#034EFE",
          primaryHover: "#023ECC",
          navy: "#00091D",
          surfaceSubtle: "#F4F6FB"
        }
      }
    }
  },
  plugins: []
};
