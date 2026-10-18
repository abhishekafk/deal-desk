import test from 'node:test';
import assert from 'node:assert/strict';
import { runAllEvalCases, runEvalCase } from '../evals/cases';

test('Run all eval cases: All must pass with 100% assertions', async () => {
  const results = await runAllEvalCases();
  assert.equal(results.length, 12, 'Expected 12 eval cases');

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

test('E9 variant: Rs 3,000 overdue 20 days must cite 3,000 and never 7,500', async () => {
  const res = await runEvalCase('E11');
  assert.ok(res.allPassed, 'E11 must pass all assertions');
  const text = res.rawOutput.textOutput || '';
  assert.ok(text.includes('3,000') || text.includes('3000'), 'Must cite 3,000');
  assert.ok(!text.includes('7,500') && !text.includes('7500'), 'Must never cite 7,500');
});

test('E6 variant: message with no view count must ask "How many views did it get?"', async () => {
  const res = await runEvalCase('E12');
  assert.ok(res.allPassed, 'E12 must pass all assertions');
  const text = res.rawOutput.textOutput || '';
  assert.ok(text.includes('How many views did it get?'), 'Must ask for view count');
  assert.ok(!text.includes('3,100') && !text.includes('3100'), 'Must never default to 3,100');
});
