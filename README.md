# Dependency Zeros

## `/data`

This directory contains the dataset, sourced from: https://zenodo.org/records/7388963. If downloading from GitHub, please download the original dataset zip file and place it in the `data` directory.

### `dependencies.json`

Collated dependencies for each quarter from `dep-contri_congruence/Ecosystem_congruence_analysis(RQ1)/dependencies_changes_quarter`, for ease of read-in. The repository names are also matched to package names from `dep-contri_congruence/Ecosystem_congruence_analysis(RQ1)/packages-info.json`.

### `mine.js`

The script for mining libraries.io and NPM.

### `extract.py`

Extracts the zip file dataset into the `data` directory. Use this script on windows as some filenames contain illegal characters. Subsequently, if you're running on other OSes you might need to rename files after extraction.

### `collate_dependencies.py`

The file used to generate `dependencies.json`.

## `/analysis`

### `analysis.ipynb`

Jupyter notebook with data analysis.