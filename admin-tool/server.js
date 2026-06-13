require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const notion = require('./modules/notion');
const htmlGen = require('./modules/html-generator-v2');
const jsUpdater = require('./modules/js-updater-v2');
const deployer = require('./modules/deploy');
const { parseArticleContent, validateContent } = require('./modules/parser');
const { ensureRepo } = require('./modules/git-repo');

const app = express();
const PORT = process.env.PORT || 3001;
const SITE_ROOT = process.env.SITE_ROOT;
const CF_PROJECT = process.env.CF_PROJECT_NAME;

// ─── Basic 認証（ADMIN_USER / ADMIN_PASSWORD が設定されている場合のみ有効）───
if (process.env.ADMIN_USER && process.env.ADMIN_PASSWORD) {
  app.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="A-Inc Admin Tool"');
      return res.status(401).send('認証が必要です');
    }
    const [user, pass] = Buffer.from(auth.slice(6), 'base64').toString().split(':');
    if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASSWORD) {
      return next();
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="A-Inc Admin Tool"');
    return res.status(401).send('認証情報が正しくありません');
  });
  console.log('[Auth] Basic認証が有効です');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// コーポレートサイトのアセットをプレビュー用に配信（/assets, /howto, /insights 等）
if (SITE_ROOT) {
  app.use('/assets', express.static(path.join(SITE_ROOT, 'assets')));
  app.use('/howto', express.static(path.join(SITE_ROOT, 'howto')));
  app.use('/insights', express.static(path.join(SITE_ROOT, 'insights')));
}

const upload = multer({ dest: path.join(__dirname, 'tmp_uploads') });

// ─── プレビューキャッシュ（インメモリ）───
const previewCache = {};

app.get('/preview/:pageId', (req, res) => {
  const html = previewCache[req.params.pageId];
  if (!html) return res.status(404).send('プレビューがまだ生成されていません');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// ─── ヘルパー: アップロード済み画像一覧取得 ───
function getUploadedImages(bigCat, smallCat) {
  const imageDir = path.join(SITE_ROOT, htmlGen.getImageDir(bigCat, smallCat));
  return fs.existsSync(imageDir)
    ? fs.readdirSync(imageDir).filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f))
    : [];
}

// ─── ヘルパー: 記事一覧からページを取得 ───
async function findArticle(pageId) {
  const articles = await notion.getDeployReadyArticles();
  return articles.find(a => a.pageId === pageId);
}

// -------------------------------------------------------
// GET /api/articles  → デプロイ待ち記事一覧
// -------------------------------------------------------
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await notion.getDeployReadyArticles();
    res.json({ ok: true, articles });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// -------------------------------------------------------
// GET /api/articles/:pageId
//   → 記事詳細 + パース結果 + バリデーション + 画像状態
// -------------------------------------------------------
app.get('/api/articles/:pageId', async (req, res) => {
  try {
    const article = await findArticle(req.params.pageId);
    if (!article) return res.status(404).json({ ok: false, error: 'not found' });

    const rawBlocks = await notion.getArticleRawBlocks(req.params.pageId);
    const parsedContent = parseArticleContent(rawBlocks);

    const uploadedImages = getUploadedImages(article.bigCategory, article.smallCategory);
    const validation = validateContent(parsedContent, uploadedImages);

    const imageDir = htmlGen.getImageDir(article.bigCategory, article.smallCategory);
    const outputPath = htmlGen.getOutputPath(SITE_ROOT, article.bigCategory, article.smallCategory, article.articleId);

    res.json({
      ok: true,
      article,
      parsedContent,
      validation,
      uploadedImages,
      imageDir,
      outputPath,
      alreadyExists: fs.existsSync(outputPath)
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// -------------------------------------------------------
// POST /api/articles/:pageId/upload-images  → 画像アップロード
// -------------------------------------------------------
app.post('/api/articles/:pageId/upload-images', upload.array('images', 20), async (req, res) => {
  try {
    const article = await findArticle(req.params.pageId);
    if (!article) return res.status(404).json({ ok: false, error: 'not found' });

    const imageDir = path.join(SITE_ROOT, htmlGen.getImageDir(article.bigCategory, article.smallCategory));
    if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

    const saved = [];
    for (const file of req.files) {
      const dest = path.join(imageDir, file.originalname);
      fs.copyFileSync(file.path, dest);
      fs.unlinkSync(file.path);
      saved.push(file.originalname);
    }

    // アップロード後にバリデーションを再実行して返す
    const rawBlocks = await notion.getArticleRawBlocks(req.params.pageId);
    const parsedContent = parseArticleContent(rawBlocks);
    const uploadedImages = getUploadedImages(article.bigCategory, article.smallCategory);
    const validation = validateContent(parsedContent, uploadedImages);

    res.json({ ok: true, saved, uploadedImages, validation });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// -------------------------------------------------------
// GET /api/articles/:pageId/preview  → HTML プレビュー（書き込みなし）
// -------------------------------------------------------
app.get('/api/articles/:pageId/preview', async (req, res) => {
  try {
    const article = await findArticle(req.params.pageId);
    if (!article) return res.status(404).json({ ok: false, error: 'not found' });

    const rawBlocks = await notion.getArticleRawBlocks(req.params.pageId);
    const parsedContent = parseArticleContent(rawBlocks);
    const html = htmlGen.generateHtml(article, parsedContent);
    const outputPath = htmlGen.getOutputPath(SITE_ROOT, article.bigCategory, article.smallCategory, article.articleId);

    // プレビューをインメモリキャッシュに保存し URL で配信
    previewCache[req.params.pageId] = html;
    const previewUrl = `/preview/${req.params.pageId}`;

    res.json({ ok: true, previewUrl, outputPath });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// -------------------------------------------------------
// POST /api/articles/:pageId/deploy  → 生成 + JS更新 + デプロイ
// -------------------------------------------------------
app.post('/api/articles/:pageId/deploy', async (req, res) => {
  const pageId = req.params.pageId;
  try {
    const article = await findArticle(pageId);
    if (!article) return res.status(404).json({ ok: false, error: 'not found' });

    const rawBlocks = await notion.getArticleRawBlocks(pageId);
    const parsedContent = parseArticleContent(rawBlocks);

    // デプロイ前バリデーション（エラーがあれば止める）
    const uploadedImages = getUploadedImages(article.bigCategory, article.smallCategory);
    const validation = validateContent(parsedContent, uploadedImages);
    if (validation.errors.length > 0) {
      return res.status(400).json({ ok: false, step: 'validation', errors: validation.errors });
    }

    // 1. HTML生成 & ファイル書き込み
    const html = htmlGen.generateHtml(article, parsedContent);
    const outputPath = htmlGen.getOutputPath(SITE_ROOT, article.bigCategory, article.smallCategory, article.articleId);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html, 'utf8');

    // 2. JSデータ更新 + titleMap更新
    const breadcrumbId = htmlGen.getBreadcrumbId(article.bigCategory, article.smallCategory, article.articleId);
    jsUpdater.updateArticleJs(SITE_ROOT, article, parsedContent);
    jsUpdater.updateTitleMap(SITE_ROOT, breadcrumbId, article.title);

    // 3. 公開URL更新 (Notionへ)
    const publicUrl = `https://a-inc.info${htmlGen.getArticleUrl(article.bigCategory, article.smallCategory, article.articleId)}`;
    await notion.setPublicUrl(pageId, publicUrl);

    // 4. git commit
    let gitLog = '';
    try {
      gitLog = deployer.gitCommit(SITE_ROOT, `feat: 記事追加 - ${article.title}`);
    } catch (gitErr) {
      return res.status(500).json({ ok: false, step: 'git-commit', error: gitErr.message });
    }

    // 5. Cloudflare Pagesデプロイ
    let deployOutput = '';
    try {
      deployOutput = deployer.deploy(SITE_ROOT, CF_PROJECT);
    } catch (deployErr) {
      await notion.updateArticleStatus(pageId, '差し戻し', `デプロイエラー: ${deployErr.message}`);
      return res.status(500).json({ ok: false, step: 'deploy', error: deployErr.message });
    }

    // 6. Notionステータス → 掲載完了
    await notion.updateArticleStatus(pageId, '掲載完了');

    res.json({ ok: true, outputPath, publicUrl, gitLog, deployOutput });
  } catch (e) {
    await notion.updateArticleStatus(pageId, '差し戻し', e.message).catch(() => {});
    res.status(500).json({ ok: false, error: e.message });
  }
});

async function main() {
  // 本番環境: GitHubリポジトリをクローン or プル
  if (process.env.GITHUB_REPO_URL && SITE_ROOT) {
    try {
      ensureRepo(
        SITE_ROOT,
        process.env.GITHUB_REPO_URL,
        process.env.GITHUB_USER_NAME,
        process.env.GITHUB_USER_EMAIL
      );
    } catch (e) {
      console.error('[起動] リポジトリ初期化失敗:', e.message);
      console.error('GITHUB_REPO_URL の設定を確認してください');
    }
  }

  app.listen(PORT, () => {
    console.log(`記事アップロード管理ツール起動中: http://localhost:${PORT}`);
    checkDataSync();
  });
}

main();

// ─── 起動時データ整合性チェック ───
async function checkDataSync() {
  const SITE_URL = 'https://a-inc.info';
  const targets = [
    { remote: `${SITE_URL}/assets/js/insights.js`,  local: path.join(SITE_ROOT, 'assets/js/insights.js'),  arrayName: 'insightsData' },
    { remote: `${SITE_URL}/assets/js/howto.js`,     local: path.join(SITE_ROOT, 'assets/js/howto.js'),     arrayName: 'articlesData' },
  ];

  for (const t of targets) {
    try {
      const res = await fetch(t.remote, { headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) { console.warn(`[起動チェック] ${t.remote} 取得失敗 (${res.status})`); continue; }
      const remoteText = await res.text();
      const localText  = fs.readFileSync(t.local, 'utf8');

      const countRemote = (remoteText.match(/\bid:/g) || []).length;
      const countLocal  = (localText.match(/\bid:/g)  || []).length;

      const idRemote = (remoteText.match(/id:\s*'([^']+)'/) || [])[1] ?? '?';
      const idLocal  = (localText.match(/id:\s*'([^']+)'/)  || [])[1] ?? '?';

      if (countRemote !== countLocal || idRemote !== idLocal) {
        console.warn(`\n⚠️  [起動チェック] ${t.arrayName} に差異があります`);
        console.warn(`   デプロイ済み: ${countRemote}件 / 先頭ID: ${idRemote}`);
        console.warn(`   ローカル    : ${countLocal}件 / 先頭ID: ${idLocal}`);
        console.warn(`   → ローカルが最新でない可能性があります。確認してください。\n`);
      } else {
        console.log(`✅ [起動チェック] ${t.arrayName}: ローカル = デプロイ済み (${countLocal}件)`);
      }
    } catch (e) {
      console.warn(`[起動チェック] ${t.arrayName} チェックエラー: ${e.message}`);
    }
  }
}
