# Dependency Zeros

## `/data`

This directory contains the dataset.


### `most_depended_upon10.json`

The top ten dependencies, mined from librairies.io

### `dependency_chain10.json`

The dependency chain, mined from the NPM registry, for the top ten libraires.

### `registry_entries.json`

The full registry entries for analysed packages.

### `mine.js`

The script for mining libraries.io and NPM. `WARNING:` May crash mining NPM registry for the 100 and 500 datasets due to using too much RAM, needs to be optimized.

## `/analysis`

### `analysis.ipynb`

Jupyter notebook with data analysis.