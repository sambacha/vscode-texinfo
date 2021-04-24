/**
 * Copyright (C) 2021  CismonX <admin@cismon.net>
 *
 * Copying and distribution of this file, with or without modification, are
 * permitted in any medium without royalty, provided the copyright notice and
 * this notice are preserved. This file is offered as-is, without any warranty.
 */

const fs = require('fs');
const yazl = require('yazl');

async function addPathToZipFile(zipFile, path) {
    for (file of await fs.promises.readdir(path, { withFileTypes: true })) {
        const name = `${path}/${file.name}`;
        if (file.isDirectory()) {
            await addPathToZipFile(zipFile, name);
        } else {
            zippedPath = name.substr(name.indexOf('/') + 1);
            console.log(`+ ${zippedPath}`);
            zipFile.addFile(name, zippedPath);
        }
    }
}

(async () => {
    const vsixFile = process.argv.pop();
    console.log(`Creating ${vsixFile}:`);
    const zipFile = new yazl.ZipFile();
    zipFile.outputStream.pipe(fs.createWriteStream(vsixFile))
        .on('close', () => console.log(`Finish creating ${vsixFile}`));
    await addPathToZipFile(zipFile, `${vsixFile}.d`);
    zipFile.end();
})()
