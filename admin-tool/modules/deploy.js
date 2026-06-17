const { execSync, spawnSync } = require('child_process');
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
      execSync('git pull origin main --rebase', { cwd: siteRoot, stdio: 'pipe' });
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

  const wrangler = spawnSync(
    'npx',
    ['wrangler', 'pages', 'deploy', tmpDir, '--project-name', cfProject, '--commit-dirty=true'],
    { cwd: ADMIN_TOOL_DIR, env: { ...process.env }, encoding: 'utf8' }
  );

  const wranglerStdout = wrangler.stdout || '';
  const wranglerStderr = wrangler.stderr || '';
  const wranglerOutput = [wranglerStdout, wranglerStderr].filter(Boolean).join('\n');

  console.log('[Deploy] wrangler exit:', wrangler.status);
  console.log('[Deploy] wrangler stdout:', wranglerStdout.slice(0, 500));
  console.log('[Deploy] wrangler stderr:', wranglerStderr.slice(0, 500));

  // 本番環境: wrangler の成否に関わらず GitHub へプッシュ
  // (Cloudflare Pages の GitHub 自動デプロイが有効な場合はこちらが主経路)
  pushToGitHub(siteRoot);

  if (wrangler.status !== 0) {
    const err = new Error(`wrangler 失敗 (exit ${wrangler.status}): ${wranglerStderr || wranglerStdout}`);
    err.wranglerOutput = wranglerOutput;
    throw err;
  }

  return wranglerOutput;
}

module.exports = { gitCommit, deploy };
