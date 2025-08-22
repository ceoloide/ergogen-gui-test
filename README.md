# Ergogen GUI

This is a web interface for [Ergogen](https://github.com/mrzealot/ergogen) by @MrZealot.

Original work by [@MvEerd](https://github.com/MvEerd).

> [!WARNING]
> This repo currently relies on an outdated Webpack 4, moving to Webpack 5 is non-trivial due to outdated dependencies like openjscad which depend on browserify and node polyfills

> [!WARNING]
> This repo currently relies on Node 20, it will not build with node 22 due to outdated dependencies.

This adds some additional features like

- Live preview reloading
- VSCode editor (Monaco)
- Live 3D model previews
- Auto regenerate outlines, 3D models and PCBs
- Bundles custom footprints from [github.com/ceoloide/ergogen-footprints](https://github.com/ceoloide/ergogen-footprints)

See the live demo at [https://ceoloide.github.io/ergogen-gui/](https://ceoloide.github.io/ergogen-gui/) or [https://ergogen.ceoloide.com](https://ergogen.ceoloide.com)

### Running locally

#### `yarn install` - installs dependencies

#### `yarn start` - starts a development server at [http://localhost:3000](http://localhost:3000)

### Using an Ergogen branch on github

To use this GUI with any github branch you can do the following;

Clone this repository to your local machine;

```shell
git clone https://github.com/ceoloide/ergogen-gui.git
```

Modify the following line in `package.json`

```json
"ergogen": "^3.*",
```

to use a branch on github refer to it like so `<username>/<repo>#<branch>`

```json
"ergogen": "ergogen/ergogen#develop",
```

Then run `yarn install && yarn start` to start Ergogen GUI locally with the specified branch.  
It will be available at <http://localhost:3000/>
