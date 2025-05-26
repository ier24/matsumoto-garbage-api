import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

// ごみ収集データをインポート
import { GARBAGE_TYPES, garbageSchedule } from './garbage_data.js'

const app = new Hono()

// ミドルウェアの設定
app.use('*', logger())
app.use('*', prettyJSON())

// ルートエンドポイント
app.get('/', (c) => {
  return c.json({
    message: '松本市田川地区ごみ収集日程API',
    endpoints: {
      '/api/tagawa/garbage': 'ごみ収集日程を取得（クエリパラメータ: date=YYYY-MM-DD）'
    }
  })
})

// ごみ収集日程API
app.get('/api/tagawa/garbage', (c) => {
  // クエリパラメータから日付を取得
  const dateParam = c.req.query('date')
  
  // 日付パラメータのバリデーション
  if (!dateParam) {
    return c.json({ error: '日付パラメータが必要です（例: date=2025-06-02）' }, 400)
  }
  
  // 日付形式のバリデーション（YYYY-MM-DD）
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateParam)) {
    return c.json({ error: '日付形式が無効です。YYYY-MM-DD形式で指定してください。' }, 400)
  }
  
  // 指定された日付のごみ種別を取得
  const garbageTypeCodes = garbageSchedule[dateParam] || []
  
  // ごみ種別コードから名称に変換
  const garbageTypeNames = garbageTypeCodes.map(code => GARBAGE_TYPES[code]?.name || code)
  
  // レスポンスの作成
  const response = {
    date: dateParam,
    garbage_types: garbageTypeNames,
    area: 'tagawa'
  }
  
  // 詳細情報を含めるオプション（将来的な拡張用）
  const includeDetails = c.req.query('details') === 'true'
  
  if (includeDetails) {
    response.details = garbageTypeCodes.map(code => ({
      code: code,
      name: GARBAGE_TYPES[code]?.name || code,
      description: GARBAGE_TYPES[code]?.description || '',
      examples: GARBAGE_TYPES[code]?.examples || []
    }))
  }
  
  return c.json(response)
})

// サーバー起動
const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
