import test from 'node:test';
import assert from 'node:assert/strict';
import { runAllEvalCases } from '../evals/cases';

test('Run all 10 eval cases: All must pass with 100% assertions', async () => {
  const results = await runAllEvalCases();
  assert.equal(results.length, 10, 'Expected 10 eval cases');

  for (const r of results) {
    for (const a of r.assertions) {
      assert.ok(
        a.passed,
        `Case ${r.id} (${r.title}) failed assertion: "${a.name}". ${a.message || ''}`
      );
    }
    assert.ok(r.allPassed, `Case ${r.id} allPassed must be true`);
  }
});
