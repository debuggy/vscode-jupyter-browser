# Jupyter Browser for VS Code

[![MIT licensed](https://img.shields.io/badge/license-MIT-yellow.svg)](https://github.com/debuggy/JupyterTools4AI/blob/master/LICENSE.txt)

This extension aims to support opening a jupyter server browser inside vscode editor.

## Features

1. Load external jupyter server and open inside vscode.

2. Start a jupyter server and render local jupyter notebook files (.ipynb) inside vscode.

## How it works

This extension holds a jupyter server manager inside. The jupyter server will start a server when opening .ipynb file and close when exit vscode.

This extension using vscode.previewHtml command to render a jupyter browser inside vscode.

## Known Issues

1. There is a slim chance that the jupyter server might not be stopped properly. Which means you could see the server by running "jupyter notebook list" outside vscode.  


