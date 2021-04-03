#!/usr/bin/env sh
#
# Copyright (C) 2020,2021  CismonX <admin@cismon.net>
#
# Copying and distribution of this file, with or without modification, are
# permitted in any medium without royalty, provided the copyright notice and
# this notice are preserved. This file is offered as-is, without any warranty.
#

SRC_PATH=./node_modules/language-texinfo
DEST_PATH=./out/grammars
mkdir -p $DEST_PATH
# Convert TextMate grammar from CSON to JSON, as VSCode cannot recognize CSON ones.
cson2json $SRC_PATH/grammars/texinfo.cson | json5 > $DEST_PATH/texinfo.json

VERSION=$(json -f package.json version)
echo "@set VERSION $VERSION" > ./doc/version.texi
