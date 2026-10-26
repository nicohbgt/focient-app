import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { workloadEngine } from '../src/engine/workload-engine.js';

describe('WorkloadEngine', () => {
  const date = '2026-10-26';
  const capacityMinutes = 480; // 8 hours

  it('correctly categorizes LIGHT workload (< 50%)', () => {
    const summary = workloadEngine.calculateWorkload(date, 120, capacityMinutes);
    assert.strictEqual(summary.status, 'LIGHT');
    assert.strictEqual(summary.percentage, 25);

    const alert = workloadEngine.getOverloadAlert(summary);
    assert.strictEqual(alert.shouldAlert, false);
    assert.strictEqual(alert.recommendedAction, 'NONE');
  });

  it('correctly categorizes OPTIMAL workload (50% - 75%)', () => {
    const summary = workloadEngine.calculateWorkload(date, 300, capacityMinutes);
    assert.strictEqual(summary.status, 'OPTIMAL');
    assert.strictEqual(summary.percentage, 63);

    const alert = workloadEngine.getOverloadAlert(summary);
    assert.strictEqual(alert.shouldAlert, false);
    assert.strictEqual(alert.severity, 'SUCCESS');
  });

  it('correctly categorizes NEAR_CAPACITY workload (76% - 90%)', () => {
    const summary = workloadEngine.calculateWorkload(date, 400, capacityMinutes);
    assert.strictEqual(summary.status, 'NEAR_CAPACITY');
    assert.strictEqual(summary.percentage, 83);

    const alert = workloadEngine.getOverloadAlert(summary);
    assert.strictEqual(alert.shouldAlert, true);
    assert.strictEqual(alert.severity, 'INFO');
    assert.strictEqual(alert.recommendedAction, 'LOCK_TOP_3');
  });

  it('correctly categorizes OVERLOAD workload (> 90%) with empathetic banner', () => {
    const summary = workloadEngine.calculateWorkload(date, 500, capacityMinutes);
    assert.strictEqual(summary.status, 'OVERLOAD');
    assert.strictEqual(summary.percentage, 104);

    const alert = workloadEngine.getOverloadAlert(summary);
    assert.strictEqual(alert.shouldAlert, true);
    assert.strictEqual(alert.severity, 'WARNING');
    assert.strictEqual(alert.recommendedAction, 'REBALANCE');
    assert.ok(alert.message.includes('melebihi batas jam kerja'));
  });
});
