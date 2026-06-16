import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

const browserClient = readSource('utils/supabase/client.ts')
const serverClient = readSource('utils/supabase/server.ts')
const middlewareClient = readSource('utils/supabase/middleware.ts')

const databaseImportPattern = /import type \{ Database \} from ['"]@\/app\/lib\/database\.types['"];?/g

describe('Supabase client type contract', () => {
  it('imports the Database contract exactly once in each helper', () => {
    for (const source of [browserClient, serverClient, middlewareClient]) {
      assert.equal(source.match(databaseImportPattern)?.length, 1)
    }
  })

  it('preserves the Database contract at each SSR compatibility boundary', () => {
    for (const source of [browserClient, serverClient, middlewareClient]) {
      assert.match(source, /as SupabaseClient<Database>/)
    }
  })

  it('types server and middleware cookie batches', () => {
    for (const source of [serverClient, middlewareClient]) {
      assert.match(source, /setAll\(cookiesToSet: Parameters<SetAllCookies>\[0\]\)/)
    }
  })
})
