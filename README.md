# vscode-texinfo

[![Build Status](https://travis-ci.com/texinfo-lang/vscode-texinfo.svg)](https://travis-ci.com/github/texinfo-lang/vscode-texinfo)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Texinfo language support for Visual Studio Code.

## Features

* **Syntax Highlighting**
  * Provided by the same [TextMate grammar](https://github.com/Alhadis/language-texinfo/blob/v1.0.0/grammars/texinfo.cson) as [used in GitHub](https://github.com/github/linguist/pull/4589).
* **Code Completion**
  * Completion for most @\-commands.
  * Code snippets for blocks and commands with arguments.
* **Folding**
  * Fold on blocks, headers and multiline comments.
* **Preview**
  * Display HTML preview in a webview.
  * Texinfo to HTML conversion is provided by [GNU Texinfo](https://www.gnu.org/software/texinfo/).

<details>
<summary>Screenshots:</summary>

</details>

## Requirements

* Visual Studio Code version >= 1.40.0. Legacy versions may also work.
* A latest version of GNU Texinfo.

## Extension Settings

See `File -> Preferences -> Settings -> Extensions -> Texinfo` for details. The settings are self-explanatory.

## Notes

* If syntax highlighting is not satisfactory, try another color theme where keyword/operator colors are distinct (e.g. Solarized Light/Dark, Monokai).
* Preview content is updated on document save rather than document change.
* For macOS users: Preinstalled GNU Texinfo distribution is very old. Use a latest one instead. This can be easily done by `brew install texinfo` and change extension setting `texinfo.makeinfo` value.

## Future Plans

* Implement [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) for the Texinfo language, preferably by extending GNU Texinfo, to alleviate the limitations of the current implementaion.
