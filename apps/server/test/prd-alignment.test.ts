import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GeneratePlanSchema,
  MotivationTypeEnum,
  EnergyLevelEnum,
  CreateTaskSchema,
  OnboardingSetupSchema,
} from '@focient/contracts';
import { workloadEngine } from '../src/engine/workload.engine.js';
import { top3PrioritiesEngine } from '../src/engine/top3-priorities.engine.js';

describe('FoCient PRD & User Research Alignment Suite', () => {
  describe('1. Behavior & Motivation Patterns (User Research Section 1.5)', () => {
    it('accepts all 4 canonical motivation types (Identity, Achievement, Discipline, Social)', () => {
      const types = ['IDENTITY_DRIVEN', 'ACHIEVEMENT_DRIVEN', 'DISCIPLINE_DRIVEN', 'SOCIAL_DRIVEN'] as const;
      for (const m of types) {
        assert.strictEqual(MotivationTypeEnum.parse(m), m);
      }
    });

    it('validates OnboardingSetupSchema with visualGoals, motivationType, and workStyle', () => {
      const valid = OnboardingSetupSchema.parse({
        roleArchetype: 'Knowledge Worker',
        workHoursLimit: 8,
        startWorkTime: '09:00',
        endWorkTime: '17:00',
        selectedCategories: ['Fokus Inti', 'Pengembangan'],
        visualGoals: ['Selesaikan MVP FoCient', 'Jaga ritme kerja seimbang'],
        motivationType: 'ACHIEVEMENT_DRIVEN',
        workStyle: 'Hybrid System: Structure + Flexibility',
        timeToFirstPlanSeconds: 42,
      });

      assert.strictEqual(valid.motivationType, 'ACHIEVEMENT_DRIVEN');
      assert.strictEqual(valid.timeToFirstPlanSeconds, 42);
      assert.deepStrictEqual(valid.visualGoals, ['Selesaikan MVP FoCient', 'Jaga ritme kerja seimbang']);
    });
  });

  describe('2. Mood and Energy Determinants (User Research Section 1.2 & 6.1)', () => {
    it('validates CreateTaskSchema with energyLevel (LOW, MEDIUM, HIGH)', () => {
      const highEnergyTask = CreateTaskSchema.parse({
        title: 'Arsitektur Reschedule Engine',
        durationMinutes: 90,
        energyLevel: 'HIGH',
      });
      assert.strictEqual(highEnergyTask.energyLevel, 'HIGH');

      const defaultEnergyTask = CreateTaskSchema.parse({
        title: 'Tinjau Catatan Singkat',
        durationMinutes: 15,
      });
      assert.strictEqual(defaultEnergyTask.energyLevel, 'MEDIUM');
    });

    it('calculates energy distribution and flags High Energy Overload (>2 tasks or >180m)', () => {
      const tasks = [
        { durationMinutes: 90, energyLevel: 'HIGH', status: 'TODO' },
        { durationMinutes: 120, energyLevel: 'HIGH', status: 'TODO' },
        { durationMinutes: 60, energyLevel: 'MEDIUM', status: 'TODO' },
      ];

      const energyDist = workloadEngine.calculateEnergyDistribution(tasks);
      assert.strictEqual(energyDist.highEnergyCount, 2);
      assert.strictEqual(energyDist.highMinutes, 210);
      assert.strictEqual(energyDist.mediumMinutes, 60);
      assert.strictEqual(energyDist.isHighEnergyOverload, true); // > 180 min
      assert.ok(energyDist.energyAdvice?.includes('lebih dari 2 tugas energi tinggi'));
    });

    it('Top3PrioritiesEngine elevates HIGH energy tasks to morning focus', () => {
      const tasks = [
        {
          id: '1',
          userId: 'u1',
          title: 'Review email santai',
          durationMinutes: 30,
          priority: 'REGULAR' as const,
          energyLevel: 'LOW' as const,
          status: 'TODO' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'u1',
          title: 'Deep Architecture Design',
          durationMinutes: 30,
          priority: 'REGULAR' as const,
          energyLevel: 'HIGH' as const,
          status: 'TODO' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const top3 = top3PrioritiesEngine.selectTop3(tasks);
      assert.strictEqual(top3[0].id, '2'); // High energy prioritized over low energy
    });
  });

  describe('3. Initial Plan Generation (PRD Onboarding -> Generate Plan -> Today Plan)', () => {
    it('validates GeneratePlanSchema with visualGoals and motivationType', () => {
      const planReq = GeneratePlanSchema.parse({
        date: '2026-10-26',
        visualGoals: ['Skripsi Bab 4 Selesai'],
        motivationType: 'IDENTITY_DRIVEN',
        targetTaskCount: 3,
      });

      assert.strictEqual(planReq.targetTaskCount, 3);
      assert.strictEqual(planReq.motivationType, 'IDENTITY_DRIVEN');
    });
  });
});
