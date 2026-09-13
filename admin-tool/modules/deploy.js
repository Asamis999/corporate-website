const { execSync, spawnSync } = require('child_process');
const path = require('path');
const { pushToGitHub } = require('./git-repo');

/**
 * Cloudflare CDNキャッシュをパージする
 * CLOUDFLARE_ZONE_ID と CLOUDFLARE_API_TOKEN が設定されている場合のみ実行
 * @param {string[]} urls - パージするURL一覧（省略時は全キャッシュパージ）
 */
async function purgeCloudflareCache(urls = null) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const token  = process.env.CLOUDFLARE_API_TOKEN;
  if (!zoneId || !token) {
    console.log('[Cache] CLOUDFLARE_ZONE_ID 未設定 → キャッシュパージをスキップ');
    return;
  }
  const body = urls ? JSON.stringify({ files: urls }) : JSON.stringify({ purge_everything: true });
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    }
  );
  const data = await res.json();
  if (data.success) {
    console.log('[Cache] Cloudflareキャッシュパージ完了', urls ? `(${urls.length}件)` : '(全件)');
  } else {
    console.warn('[Cache] Cloudflareキャッシュパージ失敗:', JSON.stringify(data.errors));
  }
}

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

async function deploy(siteRoot, cfProject) {
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

  if (wrangler.status !== 0) {
    const err = new Error(`wrangler 失敗 (exit ${wrangler.status}): ${wranglerStderr || wranglerStdout}`);
    err.wranglerOutput = wranglerOutput;
    throw err;
  }

  // 本番環境: wrangler 成功後に GitHub へプッシュ（失敗しても警告のみ）
  try {
    pushToGitHub(siteRoot);
  } catch (gitErr) {
    console.warn('[Deploy] GitHub push 失敗（Cloudflare Pagesデプロイは完了済み）:', gitErr.message);
  }

  // Cloudflare CDN キャッシュをパージ（失敗しても警告のみ）
  try {
    await purgeCloudflareCache();
  } catch (cacheErr) {
    console.warn('[Cache] キャッシュパージ中にエラー:', cacheErr.message);
  }

  return wranglerOutput;
}

module.exports = { gitCommit, deploy };
