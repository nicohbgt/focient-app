import { logger } from './logger.js';

export interface BackgroundJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  createdAt: Date;
}

/**
 * FoCient Silent Background Queue Processor
 * Handles silent placement calculation, FCM notifications, and daily capacity aggregation.
 */
export class BackgroundJobQueue {
  private queue: BackgroundJob[] = [];
  private processing = false;

  add<T>(name: string, data: T): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const job: BackgroundJob<T> = {
      id,
      name,
      data,
      createdAt: new Date(),
    };
    this.queue.push(job as BackgroundJob);
    logger.info(`Queued silent background job [${name}#${id}]`);
    this.processNext();
    return id;
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    const job = this.queue.shift();
    if (job) {
      try {
        logger.info(`Processing silent background job [${job.name}#${job.id}]`);
        // Simulates async worker processing
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (err) {
        logger.error(`Error processing background job ${job.id}`, err);
      }
    }

    this.processing = false;
    if (this.queue.length > 0) {
      this.processNext();
    }
  }
}

export const jobQueue = new BackgroundJobQueue();
