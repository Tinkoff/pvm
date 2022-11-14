/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const fs = require('fs')
const path = require('path')

const projectName = 'pvm'
let baseUrl = process.env.CI ? `/${projectName}/` : '/'

if (process.env.DOCS_BASE_URL) {
  baseUrl = process.env.DOCS_BASE_URL
}

const siteConfig = {
  title: 'Pvm',
  tagline: 'Automates releases for your project',
  url: `https://tinkoff.github.io/pvm`, // Your website URL
  onBrokenLinks: 'log',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // Docs folder path relative to website dir.
          path: 'docs',
          // Sidebars file relative to website dir.
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsible: false,
          beforeDefaultRemarkPlugins: [[require('@pvm/cli-inline-remark-plugin'), {
            cwd: path.join(process.cwd(), '..'),
          }]],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  baseUrl, // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.iofooterIcon',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName,
  organizationName: 'Tinkoff Bank',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  /* path to images for header/footer */
  favicon: 'img/pvm-64.png',

  themeConfig: {
    prism: {
      additionalLanguages: ['bash', 'toml'],
    },
    navbar: {
      title: 'Pvm',
      logo: {
        alt: 'PVM',
        src: 'img/pvm.svg',
      },
      items: [
        {
          to: 'docs/book/get-started/overview',
          label: 'Book',
        },
        {
          to: 'docs/config/configuration',
          label: 'Configuration',
        },
        {
          to: 'docs/how-to/move-to-dedicated-versions',
          label: 'How-To',
        },
        {
          label: 'References',
          to: `docs/api/modules/pvm_pvm`,
        },
        {
          to: 'docs/arch/c4/context',
          label: 'Architecture',
        },
        {
          label: 'Github',
          href: 'https://github.com/Tinkoff/pvm',
          position: 'right',
        },
      ],
    },
    footer: {
      logo: { },
      copyright: `Copyright © ${new Date().getFullYear()} Tinkoff Bank`, // You can also put own HTML here.
    },
    gtag: {
      trackingID: 'G-5NPX143GCY',
      anonymizeIP: true,
    },
    image: 'img/pvm.svg',
  },

  plugins: [
    [
      require.resolve('docusaurus-lunr-search'),
      {
        languages: ['ru', 'en'],
      },
    ],
    [
      require.resolve('docusaurus-plugin-typedoc'),
      {
        ...require('./typedoc'),
      },
    ],
    [
      require.resolve('./plugins/plantuml'),
      {
        plantumlVersion: '1.2021.14',
      },
    ],
  ],

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [],
}

const sourceChangelogPath = path.resolve(__dirname, '../changelog.md')
if (fs.existsSync(sourceChangelogPath)) {
  if (!fs.existsSync('docs/changelogs')) {
    fs.mkdirSync('docs/changelogs')
  }
  fs.copyFileSync(sourceChangelogPath, path.resolve(__dirname, 'docs/changelogs/index.md'))
  siteConfig.themeConfig.navbar.items.push({
    to: 'docs/changelogs/index',
    label: 'Changelog',
    position: 'right',
  })
}
siteConfig.themeConfig.navbar.items.push({
  label: 'Performance',
  href: 'https://tinkoff.github.io/pvm/metrics.html',
  position: 'right',
})

module.exports = siteConfig
