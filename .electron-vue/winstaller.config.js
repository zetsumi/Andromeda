const path = require('path')

module.exports = {
    appDirectory: path.join(__dirname, '..', 'build', `Andromeda-${process.env.BUILD_PLATFORM}-${process.env.BUILD_ARCHITECTURE}`),
    outputDirectory: path.join(__dirname, '..', 'build', `Andromeda-${process.env.BUILD_PLATFORM}-${process.env.BUILD_ARCHITECTURE}-installer`),
    authors: 'Astral-Studio',
    title: 'Andromeda',
    iconUrl: path.join(__dirname, 'build', 'icons', 'icon.ico'),
    exe: 'Andromeda.exe',
    setupExe: `setup_${process.env.BUILD_PLATFORM}_${process.env.BUILD_ARCHITECTURE}.exe`,
    setupIcon: path.join('build', 'icons', 'icon.ico'),
    noMsi: true,
    remoteReleases: `https://taurus.astral-studio.io/v1/${process.env.BUILD_PLATFORM}/${process.env.BUILD_ARCHITECTURE}`
}
