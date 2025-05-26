import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import { GARBAGE_TYPES, garbageSchedule } from './garbage_data.js'

interface GarbageDetail {
  code: string
  name: string
  description: string
  examples: string[]
}

interface GarbageResponse {
  date: string
  garbage_types: string[]
  area: string
  details?: GarbageDetail[]
}

const app = new Hono()

app.use('*', logger())
app.use('*', prettyJSON())

app.get('/', (c) => {
  return c.json({
    message: '松本市田川地区ごみ収集日程API',
    endpoints: {
      '/api/tagawa/garbage': 'ごみ収集日程を取得（クエリパラメータ: date=YYYY-MM-DD）'
    }
  })
})

app.get('/api/tagawa/garbage', (c) => {
  const dateParam = c.req.query('date')

  if (!dateParam) {
    return c.json({ error: '日付パラメータが必要です（例: date=2025-06-02）' }, 400)
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateParam)) {
    return c.json({ error: '日付形式が無効です。YYYY-MM-DD形式で指定してください。' }, 400)
  }

  const garbageTypeCodes = garbageSchedule[dateParam] || []
  const garbageTypeNames = garbageTypeCodes.map(code => GARBAGE_TYPES[code]?.name || code)

  const response: GarbageResponse = {
    date: dateParam,
    garbage_types: garbageTypeNames,
    area: 'tagawa'
  }

  const includeDetails = c.req.query('details') === 'true'

  if (includeDetails) {
    response.details = garbageTypeCodes.map(code => ({
      code,
      name: GARBAGE_TYPES[code]?.name || code,
      description: GARBAGE_TYPES[code]?.description || '',
      examples: GARBAGE_TYPES[code]?.examples || []
    }))
  }

  return c.json(response)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
