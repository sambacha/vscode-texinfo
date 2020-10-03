#!/usr/bin/env sh

mkdir -p ./out

# Convert TextMate grammar from CSON to JSON (VSCode cannot recognize CSON ones).
TMGRAMMAR_CSON=./node_modules/language-texinfo/grammars/texinfo.cson
TMGRAMMAR_JSON=./out/texinfo.tmGrammar.json
cson2json $TMGRAMMAR_CSON > $TMGRAMMAR_JSON
