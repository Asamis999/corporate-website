const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_DB_ID;

async function getDeployReadyArticles() {
  const response = await notion.databases.query({
    database_id: DB_ID,
    filter: {
      property: 'ステータス',
      select: { equals: 'デプロイ待ち' }
    },
    sorts: [{ property: '更新日', direction: 'descending' }]
  });

  return response.results.map(page => ({
    pageId: page.id,
    title: page.properties['記事タイトル']?.title[0]?.plain_text ?? '',
    articleId: page.properties['記事ID（ハンドル名）']?.rich_text[0]?.plain_text ?? '',
    bigCategory: page.properties['大カテゴリ']?.select?.name ?? '',
    smallCategory: page.properties['小カテゴリ']?.select?.name ?? '',
    updatedAt: page.properties['更新日']?.date?.start ?? '',
    status: page.properties['ステータス']?.select?.name ?? '',
    publicUrl: page.properties['公開URL']?.url ?? '',
    memo1: page.properties['メモ1']?.rich_text[0]?.plain_text ?? '',
    memo2: page.properties['メモ2']?.rich_text[0]?.plain_text ?? ''
  }));
}

async function getArticleRawBlocks(pageId) {
  const blocks = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    });
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

function parseBlock(block) {
  const type = block.type;
  const getRichText = (arr) =>
    arr.map(t => {
      let text = t.plain_text;
      if (t.annotations.bold) text = `<strong>${text}</strong>`;
      if (t.annotations.italic) text = `<em>${text}</em>`;
      return text;
    }).join('');

  switch (type) {
    case 'heading_1':
      return { type: 'h1', text: getRichText(block.heading_1.rich_text) };
    case 'heading_2':
      return { type: 'h2', text: getRichText(block.heading_2.rich_text) };
    case 'heading_3':
      return { type: 'h3', text: getRichText(block.heading_3.rich_text) };
    case 'paragraph': {
      const rt = block.paragraph.rich_text;
      if (!rt.length) return { type: 'br' };
      return { type: 'p', text: getRichText(rt) };
    }
    case 'bulleted_list_item':
      return { type: 'li', text: getRichText(block.bulleted_list_item.rich_text) };
    case 'numbered_list_item':
      return { type: 'oli', text: getRichText(block.numbered_list_item.rich_text) };
    case 'callout':
      return { type: 'callout', text: getRichText(block.callout.rich_text) };
    case 'divider':
      return { type: 'divider' };
    default:
      return null;
  }
}

async function updateArticleStatus(pageId, status, memo = '') {
  const props = {
    'ステータス': { select: { name: status } }
  };
  if (memo) {
    props['メモ1'] = { rich_text: [{ text: { content: memo } }] };
  }
  await notion.pages.update({ page_id: pageId, properties: props });
}

async function setPublicUrl(pageId, url) {
  await notion.pages.update({
    page_id: pageId,
    properties: { '公開URL': { url } }
  });
}

module.exports = { getDeployReadyArticles, getArticleRawBlocks, updateArticleStatus, setPublicUrl };
