import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { workloadEngine } from '../src/engine/workload.engine.js';

describe('WorkloadEngine (Algoritma 1: Workload & Daily Capacity Engine)', () => {
  const date = '2026-10-26';
  const capacityMinutes = 480; // maxDailyMinutes = 8 hours * 60 = 480

  it('calculates capacity percentage rounded to 2 decimal places', () => {
    // 250 / 480 = 52.08333... -> 52.08%
    const summary = workloadEngine.calculateWorkload(date, 250, capacityMinutes);
    assert.strictEqual(summary.percentage, 52.08);
    assert.strictEqual(summary.status, 'OPTIMAL');
    assert.strictEqual(summary.isOverloaded, false);
  });

  it('correctly categorizes LIGHT workload (< 50%)', () => {
    const summary = workloadEngine.calculateWorkload(date, 120, capacityMinutes);
    assert.strictEqual(summary.status, 'LIGHT');
    assert.strictEqual(summary.percentage, 25);
    assert.strictEqual(summary.isOverloaded, false);

    const alert = workloadEngine.getOverloadAlert(summary);
    assert.strictEqual(alert.shouldAlert, false);
    assert.strictEqual(alert.isAmberBanner, false);
    assert.strictEqual(alert.recommendedAction, 'NONE');
  });

  it('correctly categorizes OPTIMAL workload (50% - 75%)', () => {
    const summary = workloadEngine.calculateWorkload(date, 300, capacityMinutes);
    assert.strictEqual(summary.status, 'OPTIMAL');
    assert.strictEqual(summary.percentage, 62.5);
    assert.strictEqual(summary.isOverloaded, false);

    const alert = workloadEngine.getOverloadAlert(summary);
    assert.strictEqual(alert.shouldAlert, false);
    assert.strictEqual(alert.severity, 'SUCCESS');
  });

  it('correctly categorizes NEAR_CAPACITY workload (76% - 90%)', () => {
    const summary = workloadEngine.calculateWorkload(date, 400, capacityMinutes);
    assert.strictEqual(summary.status, 'NEAR_CAPACITY');
    assert.strictEqual(summary.percentage, 83.33);
    assert.strictEqual(summary.isOverloaded, false);

    const alert = workloadEngine.getOverloadAlert(summary);
    assert.strictEqual(alert.shouldAlert, true);
    assert.strictEqual(alert.isAmberBanner, false);
    assert.strictEqual(alert.severity, 'INFO');
    assert.strictEqual(alert.recommendedAction, 'LOCK_TOP_3');
  });

  it('correctly categorizes OVERLOAD workload (> 90%) and triggers warm Amber banner', () => {
    const summary = workloadEngine.calculateWorkload(date, 450, capacityMinutes);
    // 450 / 480 = 93.75%
    assert.strictEqual(summary.status, 'OVERLOAD');
    assert.strictEqual(summary.percentage, 93.75);
    assert.strictEqual(summary.isOverloaded, true);

    const alert = workloadEngine.getOverloadAlert(summary);
    assert.strictEqual(alert.shouldAlert, true);
    assert.strictEqual(alert.isAmberBanner, true);
    assert.strictEqual(alert.severity, 'WARNING');
    assert.strictEqual(alert.recommendedAction, 'REBALANCE');
    assert.ok(alert.message.includes('melebihi batas jam kerja'));
  });
});
