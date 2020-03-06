# Andromeda

> Designed by Zetsumi and Tadraes.

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](http://forthebadge.com)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
[![discord](https://discordapp.com/api/guilds/294405146300121088/widget.png)](https://discord.gg/fZP7TWq)

## Prérequis

L'exécution ou la compilation de l'application nécessite au préalable d'avoir installé les dépendences du projet via NPM.

```bash
npm install
```

## Exécution

Pour tester l'application dans un environnement de déboguage, utiliser la commande ci-dessous.

```bash
npm run dev
```

> En mode développeur, une banderole défile en pied de page.

## Compilation

Selon la plateforme cible, chaque installateur a sa propre commande de compilation afin de configurer le binaire en conséquence (OS et architecture CPU).

| OS      | CPU     | Comande                    |
|:-------:|:-------:|----------------------------|
| Windows | 32 bits | `npm run build:win32:ia32` |
| Windows | 64 bits | `npm run build:win32:x64`  |

L'installateur compilé sera présent dans le dossier `build/[appname]-[os]-[cpu]-installer/`.

### Compilation multi-plateforme

Le tableau suivant décrit les possibilités de compilation d'un OS vers un autre.
Les **lignes sont les OS source** et les **colonnes sont les OS cibles**.

|         | Windows    | macOS    | Linux    |
|:-------:|:----------:|:--------:|:--------:|
| Windows | &#10003;   | &#10005; | &#10003; |
| macOS   | &#10003; * | &#10003; | &#10003; |
| Linux   | &#10003;   | &#10005; | &#10003; |

> *La compilation de macOS vers Windows nécessite d'installer [Wine](https://www.davidbaumgold.com/tutorials/wine-mac/#what-is-wine?) et [Mono](https://www.mono-project.com/download/stable/).

## Publication

> Les étapes ci-dessous ne concernent que **Windows**.

### GitHub

Il est nécessaire de publier les artéfacts suivants :
- Installateurs nommés `setup_[paltform]_[architecture].[extension]`
- Fichiers de mise à jour nommés `nupkg_[paltform]_[architecture].zip` *

> *L'archive de mise à jour contient les artéfacts `full`, `delta` ainsi que le fichier `RELEASES` par `electron-winstaller`.

### Taurus

Sur le SFTP du serveur, publier les fichiers suivants dans le répertoire `/var/www/taurus/v1/[platform]/[architecture]/` :
- `andromeda-[version]-full.nupkg`
- `andromeda-[version]-delta.nupkg`
- `RELEASES`

> Veillez à télécharger ces fichiers dans cet ordre ou du moins en finissant par `RELEASES` car c'est lui qui liste les versions disponibles aux clients et il faut que les fichiers de mise à jour soient disponible avant de les proposer.

Plus d'informations sur ces fichiers [ici][1].

[1]: https://blog.avocode.com/get-that-damn-windows-auto-update-working-on-electron-b60945a6cfdf