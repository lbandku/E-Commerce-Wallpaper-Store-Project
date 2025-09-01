// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',                 // ← REQUIRED
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",    // ← make sure files are under src/
  ],
  theme: { extend: {} },
  plugins: [],
};

