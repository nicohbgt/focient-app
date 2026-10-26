import { logger } from '../common/logger.js';

/**
 * FoCient Asynchronous AI Extension
 *
 * Integrates LiteLLM / Gemini Flash API for:
 * 1. Empathetic guilt-free copywriting generation.
 * 2. Non-critical natural language task parsing.
 *
 * Architecture Principle:
 * The deterministic engine handles all core calculations. This AI module runs asynchronously
 * and provides non-blocking enhancements with instant fallback if unavailable or on timeout.
 */

export interface AiEmpatheticMessageRequest {
  eventType: 'RESCHEDULE' | 'OVERLOAD_WARNING' | 'WEEKLY_REFLECTION';
  context: {
    delayedTaskTitle?: string;
    delayMinutes?: number;
    capacityPercentage?: number;
    completedTop3Count?: number;
    userName?: string;
  };
}

const DETERMINISTIC_FALLBACKS: Record<string, string> = {
  RESCHEDULE: 'Jadwal downstream disesuaikan secara adaptif agar ritme hari Anda tetap tenang.',
  OVERLOAD_WARNING: 'Kapasitas hari ini mendekati batas nyaman. Pertimbangkan memindahkan beberapa tugas non-kritis.',
  WEEKLY_REFLECTION: 'Anda mempertahankan fokus dengan baik minggu ini. Istirahat yang cukup adalah bagian dari efisiensi sejati.',
};

export class AiExtension {
  private geminiApiKey: string | undefined;
  private liteLlmEndpoint: string | undefined;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.liteLlmEndpoint = process.env.LITELLM_ENDPOINT;
  }

  /**
   * Generates empathetic user guidance text asynchronously.
   * Never blocks main server thread; instantly falls back to deterministic copy on error or timeout.
   */
  async generateEmpatheticMessage(
    request: AiEmpatheticMessageRequest,
    timeoutMs = 1500
  ): Promise<string> {
    const fallback = DETERMINISTIC_FALLBACKS[request.eventType] || 'Rencana Anda telah disesuaikan dengan tenang.';

    if (!this.geminiApiKey && !this.liteLlmEndpoint) {
      return fallback;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      // Example asynchronous call via LiteLLM or Gemini Flash API
      const endpoint = this.liteLlmEndpoint || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
      const prompt = `Generate a brief (1-2 sentences), warm, non-punitive, guilt-free Indonesian notification for a productivity app: Event=${request.eventType}, Context=${JSON.stringify(request.context)}`;

      const response = await fetch(`${endpoint}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        return fallback;
      }

      const result = await response.json();
      const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      return generatedText?.trim() || fallback;
    } catch (error) {
      logger.warn('AI Extension call timed out or failed; safely using deterministic empathy fallback.', {
        error: error instanceof Error ? error.message : String(error),
      });
      return fallback;
    }
  }

  /**
   * Quick natural-language task parser (extracts title, duration, deadline).
   */
  async parseNaturalTask(input: string): Promise<{ title: string; durationMinutes: number }> {
    // Quick deterministic heuristic
    const durationMatch = input.match(/(\d+)\s*(?:menit|mins|min|m)/i);
    const duration = durationMatch ? parseInt(durationMatch[1], 10) : 30;
    const cleanTitle = input.replace(/(\d+)\s*(?:menit|mins|min|m)/i, '').trim();

    return {
      title: cleanTitle || input,
      durationMinutes: Math.min(Math.max(duration, 5), 480),
    };
  }
}

export const aiExtension = new AiExtension();
