#!/bin/sh
# Pull @ceoloide and @infused-kim footprint libraries
if [ ! -d node_modules/ergogen ]; then
  echo "Installing Ergogen..."
  npm install ergogen
fi  
if [ -d node_modules/ergogen ]; then
  echo "Patching Ergogen..."
  if [ -d node_modules/ergogen/src/footprints/ceoloide ]; then 
    echo "Removing existing @ceoloide's footprint library"
    rm -rf node_modules/ergogen/src/footprints/ceoloide
  fi
  git clone https://github.com/ceoloide/ergogen-footprints.git node_modules/ergogen/src/footprints/ceoloide
  if [ -d node_modules/ergogen/src/footprints/infused-kim ]; then 
    echo "Removing existing @infused-kim's footprint library"
    rm -rf node_modules/ergogen/src/footprints/infused-kim
  fi
  git clone https://github.com/infused-kim/kb_ergogen_fp.git node_modules/ergogen/src/footprints/infused-kim
  # Add the footprints to the index
  echo "Patching footprints/index.js..."
  cp -f patch/footprints_index.js node_modules/ergogen/src/footprints/index.js
else
  echo "Directory node_modules/ergogen not found."
fi

# Patch rollup.config.mjs to use Node 20+ JSON import syntax
if [ -f node_modules/ergogen/rollup.config.mjs ]; then
  node <<'NODE'
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('node_modules/ergogen/rollup.config.mjs');
const original = fs.readFileSync(filePath, 'utf8');
const updated = original.replace(
  "import pkg from './package.json' assert { type: 'json' }",
  "import pkg from './package.json' with { type: 'json' }",
);

if (original !== updated) {
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('Patched node_modules/ergogen/rollup.config.mjs for Node 20+ JSON import syntax.');
} else {
  console.log('No patch needed for node_modules/ergogen/rollup.config.mjs.');
}
NODE
else
  echo "File node_modules/ergogen/rollup.config.mjs not found."
fi