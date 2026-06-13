const { execSync } = require('child_process');
const path = require('path');

function gitCommit(siteRoot, message) {
  try {
    execSync('git add -A', { cwd: siteRoot, stdio: 'pipe' });
    const result = execSync(`git commit -m "${message}"`, { cwd: siteRoot, stdio: 'pipe' });
    return result.toString().trim();
  } catch (e) {
    const msg = e.stdout?.toString() ?? e.message;
    if (msg.includes('nothing to commit')) return 'nothing to commit (skipped)';
    throw e;
  }
}

function deploy(siteRoot, cfProject) {
  const tmpDir = '/tmp/cf-deploy';

  execSync(
    `rsync -a --delete \
      --exclude='node_modules' \
      --exclude='.git' \
      --exclude='admin-tool' \
      --exclude='.wranglerignore' \
      ${siteRoot}/ ${tmpDir}/`,
    { stdio: 'pipe' }
  );

  const output = execSync(
    `npx wrangler pages deploy ${tmpDir} --project-name ${cfProject} --commit-dirty=true`,
    { cwd: siteRoot, stdio: 'pipe' }
  );

  return output.toString();
}

module.exports = { gitCommit, deploy };
