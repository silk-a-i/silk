import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Silk CLI",
  description: "A powerful CLI tool for quick task automation using LLMs.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get started', link: '/installation' }
    ],

    sidebar: [
      {
        // text: 'Examples',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Usage', link: '/usage' },
          { text: 'Configuration', link: '/configuration' },
          // { text: 'Plugins', link: '/plugins' },
          { text: 'Examples', link: '/examples' },
          { text: 'API Reference', link: '/api' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/silk-a-i' }
    ]
  }
})
