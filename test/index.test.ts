import assert from 'assert'  
import {isArray} from '../src/is'

describe('validate:', () => {  
  describe('isArray', () => {
    test(' return true ', () => {
      assert.strictEqual(isArray('rollup'), false)
    })
  })
})