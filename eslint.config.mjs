// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

/**
 * @param {{ pattern: string, message: string }[]} patterns
 * @returns {import('eslint').Linter.RulesRecord}
 */
const layerImportRule = patterns => ({
  'no-restricted-imports': ['error', { patterns: patterns.map(group => ({ group: [group.pattern], message: group.message })) }],
})

export default withNuxt(
  {
    name: 'project/strict-typing',
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true, 'ts-expect-error': true, 'ts-nocheck': true }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    name: 'project/sfc-style',
    files: ['**/*.vue'],
    rules: {
      'vue/block-lang': ['error', { script: { lang: 'ts' }, style: { lang: 'scss' } }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/enforce-style-attribute': ['error', { allow: ['scoped'] }],
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    name: 'project/domain-purity',
    files: ['app/domain/**/*.ts'],
    rules: layerImportRule([
      { pattern: '~/application/*', message: 'Domain 不得依賴 Application' },
      { pattern: '~/infrastructure/*', message: 'Domain 不得依賴 Infrastructure' },
      { pattern: '~/components/*', message: 'Domain 不得依賴元件' },
      { pattern: 'vue', message: 'Domain 不認識 Vue' },
      { pattern: 'ofetch', message: 'Domain 不認識 HTTP' },
    ]),
  },
  {
    name: 'project/application-purity',
    files: ['app/application/**/*.ts'],
    rules: layerImportRule([
      { pattern: '~/infrastructure/*', message: 'Application 只透過介面使用 Proxy' },
      { pattern: '~/components/*', message: 'Application 不認識元件' },
      { pattern: 'vue', message: 'Application 不碰 ref / reactive' },
    ]),
  },
  {
    name: 'project/atom-purity',
    files: ['app/components/atoms/**/*.vue'],
    rules: layerImportRule([
      { pattern: '~/domain/*', message: 'Atoms 不認識領域概念' },
      { pattern: '~/application/*', message: 'Atoms 不認識 Application' },
      { pattern: '~/components/molecules/*', message: 'Atoms 不得依賴上層元件' },
      { pattern: '~/components/organisms/*', message: 'Atoms 不得依賴上層元件' },
      { pattern: '~/components/templates/*', message: 'Atoms 不得依賴上層元件' },
    ]),
  },
  {
    name: 'project/molecule-composition',
    files: ['app/components/molecules/**/*.vue'],
    rules: layerImportRule([
      { pattern: '~/components/organisms/*', message: 'Molecules 不得依賴上層元件' },
      { pattern: '~/components/templates/*', message: 'Molecules 不得依賴上層元件' },
      { pattern: '~/infrastructure/*', message: '元件只認識 Application 與 DTO' },
      { pattern: '~/domain/service/*', message: '元件只認識 Application 與 DTO' },
    ]),
  },
  {
    name: 'project/organism-composition',
    files: ['app/components/organisms/**/*.vue', 'app/components/templates/**/*.vue', 'app/pages/**/*.vue', 'app/layouts/**/*.vue'],
    rules: layerImportRule([
      { pattern: '~/infrastructure/*', message: '元件只認識 Application 與 DTO' },
      { pattern: '~/domain/service/*', message: '元件只認識 Application 與 DTO' },
      { pattern: '~/domain/models/entities/*', message: '元件只認識 Application 與 DTO' },
      { pattern: '~/domain/models/domains/*', message: '元件只認識 Application 與 DTO' },
    ]),
  },
  {
    name: 'project/proxy-only-browser-access',
    files: ['app/**/*.ts', 'app/**/*.vue'],
    ignores: ['app/infrastructure/proxy/**'],
    rules: {
      'no-restricted-globals': ['error',
        { name: 'localStorage', message: 'localStorage 只准出現在 Proxy' },
        { name: 'sessionStorage', message: 'sessionStorage 只准出現在 Proxy' },
        { name: 'fetch', message: 'fetch 只准出現在 Proxy' },
        { name: '$fetch', message: '$fetch 只准出現在 Proxy' },
      ],
    },
  },
)
