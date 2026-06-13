const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 本番環境起動時にGitHubリポジトリをクローン or プルする
 * GITHUB_REPO_URL が設定されていない場合はスキップ（ローカル開発モード）
 */
function ensureRepo(siteRoot, repoUrl, userName, userEmail) {
  if (!repoUrl || !siteRoot) {
    console.log('[Git] GITHUB_REPO_URL 未設定 → ローカル開発モードで起動します');
    return;
  }

  const parentDir = path.dirname(siteRoot);

  if (!fs.existsSync(path.join(siteRoot, '.git'))) {
    console.log(`[Git] リポジトリをクローン中: ${siteRoot}`);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    execSync(`git clone "${repoUrl}" "${siteRoot}"`, { stdio: 'inherit' });
    console.log('[Git] クローン完了');
  } else {
    console.log(`[Git] 最新の変更をプル中: ${siteRoot}`);
    try {
      execSync('git pull origin main', { cwd: siteRoot, stdio: 'pipe' });
      console.log('[Git] プル完了');
    } catch (e) {
      console.warn('[Git] プル失敗（ローカル変更が存在する可能性）:', e.message);
    }
  }

  const name = userName || 'Admin Tool';
  const email = userEmail || 'admin@a-inc.info';
  execSync(`git config user.name "${name}"`, { cwd: siteRoot, stdio: 'pipe' });
  execSync(`git config user.email "${email}"`, { cwd: siteRoot, stdio: 'pipe' });

  console.log(`[Git] リポジトリ準備完了 (user: ${name})`);
}

/**
 * デプロイ後にGitHubへプッシュしてリモートを同期する
 */
function pushToGitHub(siteRoot) {
  if (!process.env.GITHUB_REPO_URL) return;
  try {
    execSync('git push origin main', { cwd: siteRoot, stdio: 'pipe' });
    console.log('[Git] GitHubへのプッシュ完了');
  } catch (e) {
    console.warn('[Git] プッシュ失敗:', e.message);
  }
}

module.exports = { ensureRepo, pushToGitHub };
