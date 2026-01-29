const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  const pkgDir = process.cwd();
  console.log('Running prepublish smoke check...');

  // 1. pack the package
  const tarball = execSync('npm pack', { encoding: 'utf8' }).trim();
  console.log('Created tarball:', tarball);

  // 2. create a temp dir
  const tmp = path.join(pkgDir, '.tmp_publish_test');
  if (fs.existsSync(tmp)) {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  fs.mkdirSync(tmp);

  // 3. npm init -y and install the tarball
  execSync('npm init -y', { cwd: tmp, stdio: 'inherit' });
  execSync(`npm install ../${tarball}`, { cwd: tmp, stdio: 'inherit' });

  console.log('Smoke install succeeded. Cleaning up...');
  fs.rmSync(tmp, { recursive: true, force: true });
  // remove tarball
  fs.unlinkSync(path.join(pkgDir, tarball));
  console.log('Prepublish check passed.');
  process.exit(0);
} catch (err) {
  console.error('Prepublish check failed:', err);
  process.exit(1);
}
