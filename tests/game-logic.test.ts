import test from 'node:test'
import assert from 'node:assert/strict'
import { checkNumber } from '../src/lib/validate.ts'

// Reference clue implementation written a DIFFERENT way (set intersection) from the SQL
// (loop + position). This tests the clue *rules*, not the SQL itself - run supabase/tests.sql for that.
const clues = (secret: string, guess: string) => ({
  digits: [...new Set(guess)].filter((d) => secret.includes(d)).length,
  positions: [...guess].filter((d, i) => secret[i] === d).length,
})

test('spec examples', () => {
  assert.deepEqual(clues('2368', '1234'), { digits: 2, positions: 0 })
  assert.deepEqual(clues('2368', '2567'), { digits: 2, positions: 2 })
})

test('validation accepts the spec examples and rejects the invalid ones', () => {
  for (const ok of ['1234', '2368', '9071']) assert.equal(checkNumber(ok), null, ok)
  for (const bad of ['0123', '1123', '123', '12345', '12a4', '']) assert.notEqual(checkNumber(bad), null, bad)
})

test('all 4536 valid numbers: digits >= positions, self-guess = 4/4, counts in range', () => {
  const valid: string[] = []
  for (let n = 1000; n <= 9999; n++) if (checkNumber(String(n)) === null) valid.push(String(n))
  assert.equal(valid.length, 4536)
  for (const s of valid.filter((_, i) => i % 7 === 0)) {
    assert.deepEqual(clues(s, s), { digits: 4, positions: 4 })
    for (const g of valid.filter((_, i) => i % 97 === 0)) {
      const c = clues(s, g)
      assert.ok(c.digits >= c.positions && c.digits <= 4)
    }
  }
})
