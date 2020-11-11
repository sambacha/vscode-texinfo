# vscode-texinfo

[![Build Status](https://travis-ci.com/texinfo-lang/vscode-texinfo.svg)](https://travis-ci.com/github/texinfo-lang/vscode-texinfo)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Texinfo language support for Visual Studio Code.

## Features

* **Syntax Highlighting**
  * Provided by the same [TextMate grammar](https://github.com/Alhadis/language-texinfo/blob/v1.0.0/grammars/texinfo.cson) as [used in GitHub](https://github.com/github/linguist/pull/4589).
* **Code Completion**
  * Completion for most @\-commands.
  * Code snippets for block and brace commands.
* **Folding**
  * Fold on nodes, block commands, headers and multiline comments.
  * Breadcrumb navigation of folding blocks.
* **Preview**
  * Display HTML preview in a webview.
  * Texinfo to HTML conversion is provided by [GNU Texinfo](https://www.gnu.org/software/texinfo).

<details>
<summary>Screenshots:</summary>

Display preview:
![preview](https://user-images.githubusercontent.com/19173506/98842831-15355880-2485-11eb-9a12-a709d930ac05.png)

Code completion:
![completion](https://user-images.githubusercontent.com/19173506/98842873-254d3800-2485-11eb-8cef-78a534b08b84.png)

Breadcrumb navigation:
![navigation](https://user-images.githubusercontent.com/19173506/98842850-1ebec080-2485-11eb-8da7-2d167ea86ccf.png)

Folding:
![folding](https://user-images.githubusercontent.com/19173506/98842863-21b9b100-2485-11eb-85f9-d6c9d317d307.png)

Analytics:
![analytics](https://user-images.githubusercontent.com/19173506/98842883-28482880-2485-11eb-9399-6046e8873014.png)

</details>

## Requirements

* Visual Studio Code version >= 1.40.0. Legacy versions may also work.
* A latest version of GNU Texinfo.

## Extension Settings

See `File -> Preferences -> Settings -> Extensions -> Texinfo` for details. The settings are self-explanatory.

## Notes

* If syntax highlighting is not satisfactory, try another color theme (e.g. Solarized Light/Dark, Monokai) where keyword/operator colors are distinct.
* Preview content is updated on document save rather than document change.
* For macOS users: Preinstalled GNU Texinfo distribution is very old. Use a latest one instead. This can be easily done by `brew install texinfo` and change extension setting `texinfo.makeinfo` value.

## Future Plans

* Implement [Language Server Protocol](https://microsoft.github.io/language-server-protocol) for the Texinfo language, preferably by extending GNU Texinfo, to alleviate the limitations of the current implementaion.
