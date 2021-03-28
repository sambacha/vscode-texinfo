/**
 * Copyright (C) 2021  CismonX <admin@cismon.net>
 *
 * Copying and distribution of this file, with or without modification, are
 * permitted in any medium without royalty, provided the copyright notice and
 * this notice are preserved. This file is offered as-is, without any warranty.
 */

// Removes entries from package.json which is not required in the .vsix file,
// so that the file size can be reduced.
delete this._copyrightNotice;
delete this.devDependencies;
delete this.eslintConfig;
delete this.scripts.build;
delete this.scripts.prepare;
delete this.scripts.lint;
delete this.scripts.watch;
