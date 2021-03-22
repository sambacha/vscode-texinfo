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
    json -j0 -f $file.$BACKUP_SUFFIX > $file
done
json -j0 -I -e 'delete this.eslintConfig; delete this.devDependencies;' -f package.json
vsce package --baseContentUrl=`json -f package.json repository.url`
for file in ${JSON_FILES[@]}; do
    mv $file.$BACKUP_SUFFIX $file
done
