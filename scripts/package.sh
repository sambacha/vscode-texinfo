#!/usr/bin/env bash
#
# Copyright (C) 2021  CismonX <admin@cismon.net>
#
# Copying and distribution of this file, with or without modification, are
# permitted in any medium without royalty, provided the copyright notice and
# this notice are preserved. This file is offered as-is, without any warranty.
#

VSIX_FILE_NAME=texinfo-$(json -f package.json version).vsix
PACKAGE_JSON_CLEANUP_JS=$(cat ./scripts/package-json-cleanup.js)

vsce package --baseContentUrl=$(json -f package.json repository.url)/tree

unzip -d $VSIX_FILE_NAME{.d,}
cd $VSIX_FILE_NAME.d
minify-xml --output \[Content_Types\].xml{,}
minify-xml --output extension.vsixmanifest{,}
cd extension
# Minify JSON files.
json -j0 -I -e "$PACKAGE_JSON_CLEANUP_JS" -f package.json
perl -pi -e 'chomp if eof' package.json
json5 -o language-configuration.json{,}
# Remove comments from Markdown files.
tail -n +9 README.md > _ && mv _ README.md
tail -n +9 CHANGELOG.md > _ && mv _ CHANGELOG.md
cd ext
# Minify Perl scripts.
if [ -x "$(command -v perltidy)" ]; then
    perltidy --mangle -dac -b html-preview.pm
    rm html-preview.pm.bak
fi
cd ../../..

# Re-package .vsix file.
node ./scripts/make-vsix.js $VSIX_FILE_NAME
rm -r $VSIX_FILE_NAME.d
