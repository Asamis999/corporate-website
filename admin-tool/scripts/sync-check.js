#!/usr/bin/env node
/**
 * sync-check.js
 *
 * Notionの「掲載完了」記事がローカルに存在するか検証する。
 * コーポレートサイトをデプロイする前に実行すること。
 *
 * 使い方:
 *   node admin-tool/scripts/sync-check.js
 *   node admin-tool/scripts/sync-check.js --fix   # 不足ファイルを再生成
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const SITE_ROOT = process.env.SITE_ROOT;
const DB_ID = process.env.NOTION_DB_ID;
const FIX_MODE = process.argv.includes('--fix');

const RED   = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const MANUAL_SUBCATS = ['wix', 'shopify'];

function getExpectedPath(bigCat, smallCat, articleId) {
  if (bigCat === 'insights') {
    return articleId
      ? path.join(SITE_ROOT, 'insights', smallCat, articleId, 'index.html')
      : path.join(SITE_ROOT, 'insights', smallCat, 'index.html');
  }
  // howto/manual どちらの大カテゴリでも、smallCatで振り分け
  if (bigCat === 'howto' || bigCat === 'manual') {
    const subDir = (MANUAL_SUBCATS.includes(smallCat) || bigCat === 'manual') ? 'manual' : 'article';
    return path.join(SITE_ROOT, 'howto', 'posts', subDir, articleId, 'index.html');
  }
  return null;
}

async function getPublishedArticles() {
  const results = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: DB_ID,
      filter: { property: 'ステータス', select: { equals: '掲載完了' } },
      start_cursor: cursor,
      page_size: 100
    });
    for (const page of res.results) {
      results.push({
        title: page.properties['記事タイトル'].title[0]?.plain_text ?? '(無題)',
        articleId: page.properties['記事ID（ハンドル名）'].rich_text[0]?.plain_text ?? '',
        bigCategory: page.properties['大カテゴリ'].select?.name ?? '',
        smallCategory: page.properties['小カテゴリ'].select?.name ?? '',
        pageId: page.id
      });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function main() {
  console.log('\n🔍 デプロイ前チェック: 掲載完了記事のローカル存在確認\n');

  const articles = await getPublishedArticles();
  console.log(`Notionの掲載完了記事: ${articles.length}件\n`);

  const missing = [];
  const ok = [];

  const warnings = [];

  for (const a of articles) {
    const filePath = getExpectedPath(a.bigCategory, a.smallCategory, a.articleId);
    if (!filePath) continue;
    if (fs.existsSync(filePath)) {
      ok.push(a);
      console.log(`${GREEN}✅ OK${RESET}  ${a.title.slice(0, 50)}`);
    } else {
      // 代替パス（manual↔article）も確認
      const altSubDir = filePath.includes('/manual/') ? 'article' : 'manual';
      const altPath = filePath.replace('/posts/manual/', `/posts/${altSubDir}/`).replace('/posts/article/', `/posts/${altSubDir}/`);
      if (fs.existsSync(altPath)) {
        warnings.push({ ...a, filePath, altPath });
        ok.push(a);
        console.log(`${YELLOW}⚠️  パス不整合${RESET} ${a.title.slice(0, 50)}`);
        console.log(`      Notion: ${filePath}`);
        console.log(`      実在:   ${altPath}`);
      } else {
        missing.push({ ...a, filePath });
        console.log(`${RED}❌ 欠落${RESET} ${a.title.slice(0, 50)}\n      → ${filePath}`);
      }
    }
  }

  console.log(`\n────────────────────────────────────`);
  console.log(`OK: ${ok.length}件  |  欠落: ${missing.length}件  |  パス不整合: ${warnings.length}件`);

  if (warnings.length > 0) {
    console.log(`\n${YELLOW}⚠️  Notionのカテゴリ設定とファイルパスが一致しない記事があります。`);
    console.log(`   Notionの「小カテゴリ」を正しい値に修正することを推奨します。${RESET}`);
    for (const w of warnings) {
      console.log(`   → ${w.title.slice(0, 60)} (articleId: ${w.articleId})`);
    }
  }

  if (missing.length === 0) {
    console.log(`\n${GREEN}✅ すべての掲載完了記事がローカルに存在します。デプロイOK。${RESET}\n`);
    process.exit(0);
  }

  console.log(`\n${RED}⚠️  ${missing.length}件のHTMLファイルがローカルに存在しません。${RESET}`);
  console.log(`このままデプロイすると、本番の記事が削除されます。\n`);

  if (!FIX_MODE) {
    console.log(`${YELLOW}--fix オプションを付けて再実行すると、Notionから再生成を試みます:${RESET}`);
    console.log(`  node admin-tool/scripts/sync-check.js --fix\n`);
    process.exit(1);
  }

  // --fix モード: 不足ファイルを再生成
  const htmlGen = require('../modules/html-generator');
  const notionMod = require('../modules/notion');

  console.log('\n🔧 --fix モード: 不足HTMLを再生成中...\n');
  let fixedCount = 0;
  for (const a of missing) {
    try {
      const blocks = await notionMod.getArticleBlocks(a.pageId);
      const articleObj = {
        title: a.title, articleId: a.articleId,
        bigCat: a.bigCategory, smallCat: a.smallCategory,
        updatedAt: '', memo2: ''
      };
      const html = htmlGen.generateHtml(articleObj, blocks);
      fs.mkdirSync(path.dirname(a.filePath), { recursive: true });
      fs.writeFileSync(a.filePath, html, 'utf8');
      console.log(`${GREEN}  ✅ 再生成完了${RESET}: ${a.filePath}`);
      fixedCount++;
    } catch (e) {
      console.log(`${RED}  ❌ 再生成失敗${RESET}: ${a.title} → ${e.message}`);
    }
  }

  console.log(`\n再生成完了: ${fixedCount}/${missing.length}件`);
  if (fixedCount === missing.length) {
    console.log(`\n${GREEN}✅ すべて修復されました。git add & commit してからデプロイしてください。${RESET}\n`);
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
