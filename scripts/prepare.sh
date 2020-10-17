#!/usr/bin/env sh

SRC_PATH=./node_modules/language-texinfo
DEST_PATH=./out/grammars
mkdir -p $DEST_PATH
cp $SRC_PATH/LICENSE.md $DEST_PATH
# Convert TextMate grammar from CSON to JSON, as VSCode cannot recognize CSON ones.
cson2json $SRC_PATH/grammars/texinfo.cson > $DEST_PATH/texinfo.json
