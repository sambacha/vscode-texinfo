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
sed -i '' -e '2d' package.json
json5 -o language-configuration.json{,}
# Remove comments from Markdown files.
sed -i '' -e '1,8d' README.md CHANGELOG.md
cd ../..

# Re-package .vsix file.
node ./scripts/make-vsix.js $VSIX_FILE_NAME
rm -r $VSIX_FILE_NAME.d
