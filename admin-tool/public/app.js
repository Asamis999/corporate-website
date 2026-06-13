/* ─── 状態管理 ─── */
let currentArticle = null;
let currentDetail = null;
let previewGenerated = false;

const $$ = id => document.getElementById(id);
const sectionList = $$('section-list');
const sectionDetail = $$('section-detail');

/* ─── 初期化 ─── */
document.addEventListener('DOMContentLoaded', () => {
  loadArticles();
  $$('btn-refresh').addEventListener('click', loadArticles);
  $$('btn-back').addEventListener('click', showList);
  $$('btn-reload-content').addEventListener('click', () => selectArticle(currentArticle.pageId));
  $$('image-files').addEventListener('change', onFileSelect);
  $$('btn-upload').addEventListener('click', uploadImages);
  $$('btn-preview').addEventListener('click', generatePreview);
  $$('btn-deploy').addEventListener('click', confirmAndDeploy);
});

/* ─── 一覧取得 ─── */
async function loadArticles() {
  $$('article-list-loading').classList.remove('hidden');
  $$('article-table').classList.add('hidden');
  $$('article-list-empty').classList.add('hidden');

  const res = await fetch('/api/articles').then(r => r.json());
  $$('article-list-loading').classList.add('hidden');

  if (!res.ok || !res.articles.length) {
    $$('article-list-empty').classList.remove('hidden');
    return;
  }

  $$('article-list-body').innerHTML = res.articles.map(a => `
    <tr>
      <td>${a.title}</td>
      <td><span class="badge badge-${a.bigCategory}">${a.bigCategory}</span></td>
      <td>${a.smallCategory}</td>
      <td><code>${a.articleId || '(親記事)'}</code></td>
      <td>${a.updatedAt}</td>
      <td><button class="btn btn-primary" onclick="selectArticle('${a.pageId}')">作業開始</button></td>
    </tr>
  `).join('');
  $$('article-table').classList.remove('hidden');
}

/* ─── 記事選択 ─── */
async function selectArticle(pageId) {
  sectionList.classList.add('hidden');
  sectionDetail.classList.remove('hidden');
  previewGenerated = false;
  $$('btn-deploy').disabled = true;
  $$('deploy-status').classList.add('hidden');
  $$('preview-area').classList.add('hidden');
  $$('validation-area').innerHTML = '<span style="color:#718096">読み込み中...</span>';
  $$('meta-preview').classList.add('hidden');
  $$('toc-preview').classList.add('hidden');

  try {
    const r = await fetch(`/api/articles/${pageId}`);
    const res = await r.json();

    if (!res.ok) {
      $$('validation-area').innerHTML = `<div class="val-item error">❌ 取得エラー: ${res.error || r.status}</div>`;
      return;
    }

    currentArticle = res.article;
    currentDetail = res;

    renderDetailInfo(res);
    renderValidation(res.parsedContent, res.validation);
    renderImageCheck(res);
    updateDeployChecklist();

    $$('image-dir-path').textContent = res.imageDir;
    $$('output-path').textContent = res.outputPath;
  } catch (err) {
    $$('validation-area').innerHTML = `<div class="val-item error">❌ 通信エラー: ${err.message}</div>`;
  }
}

function showList() {
  sectionDetail.classList.add('hidden');
  sectionList.classList.remove('hidden');
  currentArticle = null;
}

/* ─── 詳細情報 ─── */
function renderDetailInfo(res) {
  const a = res.article;
  $$('detail-info').innerHTML = [
    ['記事タイトル', a.title],
    ['大カテゴリ', a.bigCategory],
    ['小カテゴリ', a.smallCategory],
    ['記事ID', a.articleId || '(親記事)'],
    ['更新日', a.updatedAt],
    ['既存HTML', res.alreadyExists ? '⚠️ 上書き' : '新規作成']
  ].map(([k, v]) => `
    <div class="detail-item"><label>${k}</label><span>${v}</span></div>`).join('');
}

/* ─── バリデーション表示 ─── */
function renderValidation(parsed, validation) {
  const { errors, warnings } = validation;
  let html = '';

  if (errors.length === 0 && warnings.length === 0) {
    html = '<div class="val-ok">✅ バリデーション通過 - デプロイ可能です</div>';
  } else {
    if (errors.length) {
      html += errors.map(e => `<div class="val-item error">❌ ${e}</div>`).join('');
    }
    if (warnings.length) {
      html += warnings.map(w => `<div class="val-item warning">⚠️ ${w}</div>`).join('');
    }
  }
  $$('validation-area').innerHTML = html;

  // META プレビュー
  if (parsed?.meta) {
    const m = parsed.meta;
    const tagsHtml = (m.tags || []).map(t => `<span class="meta-tag">${t}</span>`).join('');
    $$('meta-preview').innerHTML = `
      <h4>META</h4>
      <div class="meta-grid">
        <span class="meta-key">date</span><span class="meta-val">${m.date || '-'}</span>
        <span class="meta-key">excerpt</span><span class="meta-val">${m.excerpt || '-'}</span>
        <span class="meta-key">tags</span><span class="meta-val"><div class="meta-tags">${tagsHtml}</div></span>
        <span class="meta-key">description</span><span class="meta-val">${m.description || '-'}</span>
      </div>`;
    $$('meta-preview').classList.remove('hidden');
  }

  // TOC プレビュー
  if (parsed?.toc?.length) {
    const items = parsed.toc.map((item, i) =>
      `<li><a href="#${item.anchor}">${item.text}</a></li>`).join('');
    $$('toc-preview').innerHTML = `<h4>TOC (${parsed.toc.length}項目)</h4><ol>${items}</ol>`;
    $$('toc-preview').classList.remove('hidden');
  }
}

/* ─── 画像チェック（IMAGESセクション連動） ─── */
function renderImageCheck(res) {
  const parsed = res.parsedContent;
  const uploaded = res.uploadedImages || [];
  const chips = [];

  if (parsed?.images) {
    for (const [key, img] of Object.entries(parsed.images)) {
      const fn = img['ファイル名'] || '';
      const found = uploaded.some(f => f.toLowerCase() === fn.toLowerCase());
      chips.push(`<span class="img-chip ${found ? 'ok' : 'missing'}">${found ? '✅' : '❌'} ${key}: ${fn}</span>`);
    }
  } else if (uploaded.length) {
    chips.push(`<span class="img-chip ok" style="background:#edf2f7;color:#4a5568">アップロード済み: ${uploaded.join(', ')}</span>`);
  }

  $$('image-check-list').innerHTML = chips.join('') || '<span style="color:#a0aec0;font-size:12px">IMAGESセクションなし</span>';
}

/* ─── ファイル選択 ─── */
function onFileSelect() {
  const files = $$('image-files').files;
  $$('upload-file-count').textContent = files.length ? `${files.length}ファイル選択中` : '';
  $$('btn-upload').disabled = files.length === 0;
}

/* ─── 画像アップロード ─── */
async function uploadImages() {
  const files = $$('image-files').files;
  if (!files.length) return;
  const formData = new FormData();
  for (const f of files) formData.append('images', f, f.name);

  $$('btn-upload').disabled = true;
  $$('upload-result').textContent = 'アップロード中...';

  try {
    const res = await fetch(`/api/articles/${currentArticle.pageId}/upload-images`, {
      method: 'POST', body: formData
    }).then(r => r.json());

    if (res.ok) {
      $$('upload-result').textContent = `✅ 保存: ${res.saved.join(', ')}`;
      currentDetail.uploadedImages = res.uploadedImages || [];
      renderImageCheck({ parsedContent: currentDetail.parsedContent, uploadedImages: currentDetail.uploadedImages });
      if (res.validation) renderValidation(currentDetail.parsedContent, res.validation);
      updateDeployChecklist();
    } else {
      $$('upload-result').textContent = `❌ エラー: ${res.error}`;
    }
  } catch (err) {
    $$('upload-result').textContent = `❌ エラー: ${err.message}`;
  }
  $$('btn-upload').disabled = false;
}

/* ─── HTMLプレビュー ─── */
async function generatePreview() {
  $$('btn-preview').textContent = '生成中...';
  $$('btn-preview').disabled = true;

  const res = await fetch(`/api/articles/${currentArticle.pageId}/preview`).then(r => r.json());
  $$('btn-preview').textContent = 'HTMLプレビュー生成';
  $$('btn-preview').disabled = false;

  if (!res.ok) { alert('プレビュー生成失敗: ' + res.error); return; }

  $$('preview-frame').src = res.previewUrl + '?t=' + Date.now();
  $$('preview-area').classList.remove('hidden');
  previewGenerated = true;
  updateDeployChecklist();
}

/* ─── デプロイ前チェックリスト ─── */
function updateDeployChecklist() {
  if (!currentDetail) return;
  const validation = currentDetail.validation || { errors: [], warnings: [] };
  const hasErrors = validation.errors.length > 0;

  const checks = [
    { label: '原文バリデーション通過', ok: !hasErrors },
    { label: 'HTMLプレビュー確認済み', ok: previewGenerated }
  ];

  $$('deploy-checklist').innerHTML = checks.map(c => `
    <div class="check-item">
      <span class="icon">${c.ok ? '✅' : '⚠️'}</span>
      <span>${c.label}</span>
    </div>`).join('');

  $$('btn-deploy').disabled = !checks.every(c => c.ok);
}

/* ─── デプロイ実行 ─── */
async function confirmAndDeploy() {
  const a = currentArticle;
  if (!confirm(
    `以下の記事をデプロイします。\n\nタイトル: ${a.title}\nカテゴリ: ${a.bigCategory} / ${a.smallCategory}\n記事ID: ${a.articleId || '(親記事)'}\n\n※ HTML生成・JS更新・CF Pagesデプロイが実行されます`
  )) return;

  const statusEl = $$('deploy-status');
  statusEl.textContent = '⏳ デプロイ実行中...';
  statusEl.className = 'running';
  statusEl.classList.remove('hidden');
  $$('btn-deploy').disabled = true;

  const res = await fetch(`/api/articles/${a.pageId}/deploy`, { method: 'POST' }).then(r => r.json());

  if (res.ok) {
    statusEl.textContent = `✅ デプロイ完了！\n\n公開URL: ${res.publicUrl}\n出力: ${res.outputPath}\ngit: ${res.gitLog}\n\n--- wrangler出力 ---\n${res.deployOutput}`;
    statusEl.className = 'success';
    setTimeout(() => { loadArticles(); showList(); }, 4000);
  } else {
    const errMsg = res.errors ? res.errors.join('\n') : res.error;
    statusEl.textContent = `❌ 失敗 (${res.step || 'error'})\n\n${errMsg}`;
    statusEl.className = 'error';
    $$('btn-deploy').disabled = false;
  }
}
