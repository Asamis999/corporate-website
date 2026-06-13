const { execSync } = require('child_process');
const path = require('path');
const { pushToGitHub } = require('./git-repo');

const ADMIN_TOOL_DIR = path.join(__dirname, '..');

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

  // 本番環境: デプロイ前に最新をプル
  if (process.env.GITHUB_REPO_URL) {
    try {
      execSync('git pull origin main', { cwd: siteRoot, stdio: 'pipe' });
    } catch (e) {
      console.warn('[Deploy] git pull スキップ:', e.message);
    }
  }

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
    { cwd: ADMIN_TOOL_DIR, stdio: 'pipe', env: { ...process.env } }
  );

  // 本番環境: デプロイ後にGitHubへプッシュして同期
  pushToGitHub(siteRoot);

  return output.toString();
}

module.exports = { gitCommit, deploy };
