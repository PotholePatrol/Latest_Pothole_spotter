// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetIcons, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),         // gives Tailwind-like utilities
    presetAttributify(), // allows writing attributes like <div flex="~ col" />
    presetIcons(),       // use icon classes (i-heroicons-home)
    presetTypography(),  // optional, for prose/text styling like Tailwind's typography plugin
  ],
})
