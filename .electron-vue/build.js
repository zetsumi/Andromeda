'use strict'

process.env.NODE_ENV = 'production';

const pkg = require('../package.json')
const fs = require('fs')
const archiver = require('archiver-promise')
const path = require('path')
const {say} = require('cfonts')
const chalk = require('chalk')
const del = require('del')
const packager = require('electron-packager')
const webpack = require('webpack')
const MultiSpinner = require('multispinner')
const winstaller = require('electron-winstaller')

const buildConfig = require('./packager.config')
const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')
const winstallerConfig = require('./winstaller.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

if (process.env.BUILD_TARGET === 'clean') clean()
else build()

function clean() {
    del.sync(['build/*', '!build/icons', '!build/icons/icon.*'])
    console.log(`\n${doneLog}\n`)
    process.exit()
}

function build() {
    greet()

    del.sync(['dist/electron/*', '!.gitkeep'])

    const tasks = ['main', 'renderer']
    const m = new MultiSpinner(tasks, {
        preText: 'building',
        postText: 'process'
    })

    let results = ''

    m.on('success', async () => {
        process.stdout.write('\x1B[2J\x1B[0f')
        console.log(`\n\n${results}`)
        console.log(`${okayLog}take it away ${chalk.yellow('`electron-packager`')}\n`)
        await bundleApp()
        await bundleInstaller()
        await bundleArchives()
    })

    packWithWebpack(mainConfig)
        .then(result => {
            results += result + '\n\n'
            m.success('main')
        })
        .catch(err => {
            m.error('main')
            console.log(`\n  ${errorLog}failed to build main process`)
            console.error(`\n${err}\n`)
            process.exit(1)
        })

    packWithWebpack(rendererConfig)
        .then(result => {
            results += result + '\n\n'
            m.success('renderer')
        })
        .catch(err => {
            m.error('renderer')
            console.log(`\n  ${errorLog}failed to build renderer process`)
            console.error(`\n${err}\n`)
            process.exit(1)
        })
}

function packWithWebpack(config) {
    return new Promise((resolve, reject) => {
        config.mode = 'production'
        webpack(config, (err, stats) => {
            if (err) reject(err.stack || err)
            else if (stats.hasErrors()) {
                let err = ''

                stats.toString({
                    chunks: false,
                    colors: true
                })
                    .split(/\r?\n/)
                    .forEach(line => {
                        err += `    ${line}\n`
                    })

                reject(err)
            } else {
                resolve(stats.toString({
                    chunks: false,
                    colors: true
                }))
            }
        })
    })
}

async function bundleApp() {
    buildConfig.mode = 'production'

    try {
        await packager(buildConfig)
        console.log(`\n${doneLog}\n`)
    } catch (error) {
        console.log(`\n${errorLog}${chalk.yellow('`electron-packager`')} says...\n`)
        console.log(error + '\n')
    }
}

async function bundleInstaller() {
    try {
        await winstaller.createWindowsInstaller(winstallerConfig)
        console.log(`\n${doneLog}\n`)
    } catch (error) {
        console.log(`\n${errorLog}${chalk.yellow('`electron-winstaller`')} says...\n`)
        console.log(error + '\n')
    }
}

async function bundleArchives() {
    try {
        let archive = archiver(path.join(winstallerConfig.outputDirectory, `nupkg_${process.env.BUILD_PLATFORM}_${process.env.BUILD_ARCHITECTURE}.zip`))
        archive.append(fs.createReadStream(path.join(winstallerConfig.outputDirectory, `andromeda-${pkg.version}-full.nupkg`)), {
            name: `andromeda-${pkg.version}-full.nupkg`
        })
        archive.append(fs.createReadStream(path.join(winstallerConfig.outputDirectory, `andromeda-${pkg.version}-delta.nupkg`)), {
            name: `andromeda-${pkg.version}-delta.nupkg`
        })
        archive.append(fs.createReadStream(path.join(winstallerConfig.outputDirectory, `RELEASES`)), {
            name: `RELEASES`
        })
        await archive.finalize()
        console.log(`\n${doneLog}\n`)
    } catch (error) {
        console.log(`\n${errorLog}${chalk.yellow('`electron-winstaller`')} says...\n`)
        console.log(error + '\n')
    }
}

function greet() {
    const cols = process.stdout.columns
    let text = ''

    if (cols > 85) text = 'lets-build'
    else if (cols > 60) text = 'lets-|build'
    else text = false

    if (text && !isCI) {
        say(text, {
            colors: ['yellow'],
            font: 'simple3d',
            space: false
        })
    } else console.log(chalk.yellow.bold('\n  lets-build'))
    console.log()
}
