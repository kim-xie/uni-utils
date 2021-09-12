import { describe, test, expect } from '@jest/globals'
import { isColor } from '../src/is'

describe('validate: isColor', () => {
  test(`'#33' isColor`, () => {
    expect(isColor('#33')).toBe(false)
  })
})
