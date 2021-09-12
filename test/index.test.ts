import { describe, test, expect } from '@jest/globals'
import { isArray } from '../src/is'

describe('validate: isArray', () => {
  test('rollup string isArray', () => {
    expect(isArray('rollup')).toBe(false)
  })
})
