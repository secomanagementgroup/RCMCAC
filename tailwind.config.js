/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-blue-500',
    'bg-cyan-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-blue-600',
    'bg-cyan-600',
    'bg-amber-600',
    'bg-violet-600',
    'bg-emerald-600',
    'bg-rose-600',
  ],
};
