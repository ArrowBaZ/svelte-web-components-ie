import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import banner from 'rollup-plugin-banner'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'
import babel from 'rollup-plugin-babel'
import svg from 'rollup-plugin-svg'
import copy from 'rollup-plugin-copy'
import modify from 'rollup-plugin-modify'
import del from 'rollup-plugin-delete'

const components = [
    'cta/index'
]

const ie11Build = process.env.PAP_LEGACY_BUILD
const production = !process.env.ROLLUP_WATCH
const name = pkg.name
                .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
                .replace(/^\w/, m => m.toUpperCase())
                .replace(/-\w/g, m => m[1].toUpperCase())

function serve () {
    let started = false

    return {
        writeBundle () {
            if (!started) {
                started = true

                require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                    stdio: ['ignore', 'inherit', 'inherit'],
                    shell: true
                })
            }
        }
    }
}

const configDev = {
    input: 'src/main.js',
    output: {
        format: 'cjs',
        dir: 'public/build/'
    },
    plugins: [
        svelte({
            // enable run-time checks when not in production
            dev: !production,
            customElement: true,
            // we'll extract any component CSS out into
            // a separate file - better for performance
            css: css => {
                css.write('public/build/bundle.css')
            }
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
        commonjs(),
        modify({
            find: 'process.env.NODE_ENV',
            replace: '\'development\''
        }),
        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('public'),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
}

const configProd = x => {
    const prodOutput = []
    const folder = x.replace('/index', '')
    const pkg = require(`./src/${folder}/package.json`)
    const options = {}

    if (ie11Build) {
        prodOutput.push({
            dir: `build/${folder}`,
            format: 'cjs',
            strict: false,
            entryFileNames: `[name].legacy.min.js`
        })
    } else {
        prodOutput.push({
            dir: `build/${folder}`,
            entryFileNames: `[name].es.min.js`,
            format: 'es'
        })
    }

    return {
        input: `src/${x}.svelte`,
        output: prodOutput,
        plugins: [
            !ie11Build && del({ targets: 'build/*' }),
            copy({
                targets: [
                    { src: `src/${folder}/package.json`, dest: `build/${folder}` },
                    { src: `src/${folder}/preview.*`, dest: `build/${folder}` },
                    { src: `src/${folder}/schema.json`, dest: `build/${folder}` }
                ]
            }),
            modify({
                find: 'process.env.NODE_ENV',
                replace: '\'prod\''
            }),
            svelte({
                dev: !production,
                customElement: true
            }),
            svg(),
            resolve(),
            commonjs(),
            ie11Build &&
            babel({
                extensions: ['.js', '.mjs', '.html', '.svelte'],
                runtimeHelpers: true,
                exclude: ['node_modules/@babel/**', 'node_modules/core-js/**'],

                babelrc: false,
                plugins: [
                    '@babel/plugin-transform-runtime'
                ],
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                'browsers': [
                                    '> 1%',
                                    'last 2 versions',
                                    'Firefox ESR',
                                    'not op_mini all',
                                    'ie >= 10'
                                ]
                            },
                            modules: false,
                            useBuiltIns: 'entry',
                            corejs: 3
                        }
                    ]
                ],
                sourceType: 'unambiguous'
            }),
            terser(),
            banner(`${pkg.name} ${pkg.version} ${new Date().toLocaleDateString('en-US', options)} ${new Date().toLocaleTimeString('en-US')}`)
        ],
        watch: {
            clearScreen: false
        }
    }
}
const runBuild = () => production ? components.map(x => configProd(x)) : configDev
export default runBuild()
