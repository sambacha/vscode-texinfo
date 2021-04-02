#!/usr/bin/env bash
#
# Copyright (C) 2021  CismonX <admin@cismon.net>
#
# Copying and distribution of this file, with or without modification, are
# permitted in any medium without royalty, provided the copyright notice and
# this notice are preserved. This file is offered as-is, without any warranty.
#

BACKUP_SUFFIX=vsce-pre-package-backup
JSON_FILES=(package.json language-configuration.json)
for file in ${JSON_FILES[@]}; do
    mv $file $file.$BACKUP_SUFFIX
    json5 -o $file $file.$BACKUP_SUFFIX
done
MD_FILES=(README.md CHANGELOG.md)
for file in ${MD_FILES[@]}; do
    mv $file $file.$BACKUP_SUFFIX
    tail -n +9 $file > $file
done
json -j0 -I -e "$(cat ./scripts/package-json-cleanup.js)" -f package.json
vsce package --baseContentUrl=$(json -f package.json repository.url)
for file in ${JSON_FILES[@]}; do
    mv $file.$BACKUP_SUFFIX $file
done
for file in ${MD_FILES[@]}; do
    mv $file.$BACKUP_SUFFIX $file
done
