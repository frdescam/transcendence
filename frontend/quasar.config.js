/* eslint-env node */

const { configure } = require('quasar/wrappers');
const { transformAssetUrls } = require('@quasar/vite-plugin');
const process = require('process');
const path = require('path');

module.exports = configure(() =>
{
	let apiUrl = 'http://';
	apiUrl += (process.env.BACK_IP) ? process.env.BACK_IP : '127.0.0.1';
	apiUrl += ':';
	apiUrl += (process.env.BACK_PORT) ? process.env.BACK_PORT : '8080';
	apiUrl += '/api/';

	return {
		eslint: {
			fix: false,
			include: [],
			exclude: [],
			rawOptions: {},
			warnings: true,
			errors: true
		},

		// https://v2.quasar.dev/quasar-cli-vite/boot-files
		boot: [
			'axios',
			'i18n',
			'socketio'
		],

		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
		css: [
			'app.scss'
		],

		// https://github.com/quasarframework/quasar/tree/dev/extras
		extras: [
			'roboto-font-latin-ext',
			'material-icons',
			'mdi-v6'
		],

		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
		build: {
			target: {
				browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
				node: 'node16'
			},
			vueRouterMode: 'history',
			analyze: true,
			minify: 'esbuild',
			vueDevtools: true,
			vueOptionsAPI: false,
			rebuildCache: false,
			alias: {
				'@': path.resolve(__dirname, './src')
			},
			rawDefine: {
				__api: JSON.stringify(apiUrl)
			},
			env: {},
			distDir: 'dist',
			vitePlugins: [
				['@intlify/vite-plugin-vue-i18n', {
					compositionOnly: true, // `false` for Vue I18n Legacy API
					include: path.resolve(__dirname, './src/i18n/**')
				}]
			],
			viteVuePluginOptions: {
				template: { transformAssetUrls }
			}
		},

		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
		devServer: {
			https: false,
			host: process.env.VITE_IP,
			port: parseInt(process.env.VITE_PORT, 10) | 3000,
			open: false
		},

		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
		framework: {
			iconSet: 'material-icons',
			lang: 'en-US',
			// config: {},
			// components: [],
			// directives: [],
			plugins: [
				'Notify',
				'Dialog',
				'AppFullscreen'
			]
		},

		// https://v2.quasar.dev/options/animations
		animations: 'all',

		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
		sourceFiles: {
			rootComponent: 'src/views/App.vue',
			router: 'src/router/index'
			//   store: 'src/store/index',
			//   registerServiceWorker: 'src-pwa/register-service-worker',
			//   serviceWorker: 'src-pwa/custom-service-worker',
			//   pwaManifestFile: 'src-pwa/manifest.json',
			//   electronMain: 'src-electron/electron-main',
			//   electronPreload: 'src-electron/electron-preload'
		}
	};
});
