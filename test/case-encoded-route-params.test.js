const Bundle = require('../');
const test = require('supertest');
const assert = require('assert');

describe('Encoded route params', () => {
  it('encode route parameters', async () => {
    let bundle = new Bundle();

    let argCalled;
    bundle.get('/{arg}', ctx => {
      ctx.body = argCalled = ctx.parameters.arg;
    });

    {
      let { text } = await test(bundle.callback()).get('/foo').expect(200);
      assert.strictEqual(argCalled, 'foo');
      assert.strictEqual(text, 'foo');
    }

    {
      let { text } = await test(bundle.callback()).get('/foo bar').expect(200);
      assert.strictEqual(argCalled, 'foo bar');
      assert.strictEqual(text, 'foo bar');
    }
  });
});
