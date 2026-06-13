exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;
  const RECRUIT_REPLY_TO = process.env.RECRUIT_REPLY_TO || 'acreate.team@gmail.com';
  const AWS_REGION =
    process.env.SES_AWS_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    'ap-northeast-1';

  if (!SES_FROM_EMAIL) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Missing env SES_FROM_EMAIL' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const { toEmail, formName, fields } = payload || {};

  if (!toEmail) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Missing toEmail' })
    };
  }

  const safeFormName = formName ? String(formName) : 'recruit';
  const safeFields = Array.isArray(fields) ? fields : [];

  const fieldsText = safeFields
    .filter((f) => f && f.key && typeof f.value === 'string')
    .map((f) => `■${f.key}\n${f.value}`)
    .join('\n\n');

  const subject = `【受付完了】採用フォームのお問い合わせ（${safeFormName}）`;
  const bodyText =
    'この度はお問い合わせありがとうございます。\n' +
    '以下の内容で送信を受け付けました。\n\n' +
    fieldsText +
    '\n\n' +
    '担当者より順次ご連絡いたします。\n' +
    '本メールは送信専用です。';

  try {
    // aws-sdk is available in the AWS Lambda runtime
    // eslint-disable-next-line import/no-extraneous-dependencies
    const AWS = require('aws-sdk');

    AWS.config.update({ region: AWS_REGION });

    const ses = new AWS.SES({ apiVersion: '2010-12-01' });

    const params = {
      Source: SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [toEmail]
      },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: bodyText, Charset: 'UTF-8' }
        }
      }
    };

    if (RECRUIT_REPLY_TO) {
      params.ReplyToAddresses = [RECRUIT_REPLY_TO];
    }

    await ses.sendEmail(params).promise();

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to send email' })
    };
  }
};
