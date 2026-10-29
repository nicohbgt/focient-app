import { Queue, Worker, Job } from 'bullmq';
import { logger } from './logger.js';
import { cache } from './redis.js';

export interface BackgroundJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  createdAt: Date;
}

export type JobHandler<T = unknown> = (data: T, jobId: string) => Promise<void> | void;

/**
 * FoCient Silent Background Queue Processor
 * Supports BullMQ with Redis backing, and seamlessly falls back to an in-memory queue
 * when Redis is absent or offline.
 */
export class BackgroundJobQueue {
  private queue: BackgroundJob[] = [];
  private processing = false;
  private bullQueue: Queue | null = null;
  private bullWorker: Worker | null = null;
  private handlers = new Map<string, JobHandler<any>>();
  private isBullMqActive = false;

  constructor() {
    this.initBullMq();
  }

  private initBullMq(): void {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      logger.info('REDIS_URL not configured; BullMQ queue initialized in memory-fallback mode.');
      return;
    }

    try {
      // Parse URL for BullMQ connection options
      const url = new URL(redisUrl);
      const connection = {
        host: url.hostname || 'localhost',
        port: parseInt(url.port || '6379', 10),
        password: url.password || undefined,
        maxRetriesPerRequest: null,
      };

      this.bullQueue = new Queue('focient-background-jobs', {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      });

      this.bullWorker = new Worker(
        'focient-background-jobs',
        async (job: Job) => {
          const handler = this.handlers.get(job.name);
          if (handler) {
            await handler(job.data, job.id ?? '');
          } else {
            logger.warn(`No handler registered for BullMQ job type: ${job.name}`);
          }
        },
        { connection }
      );

      this.bullWorker.on('completed', (job: Job) => {
        logger.info(`BullMQ job [${job.name}#${job.id}] completed successfully.`);
      });

      this.bullWorker.on('failed', (job: Job | undefined, err: Error) => {
        logger.error(`BullMQ job [${job?.name}#${job?.id}] failed: ${err.message}`);
      });

      this.isBullMqActive = true;
      logger.info('BullMQ background queue and worker successfully initialized with Redis.');
    } catch (err: unknown) {
      this.isBullMqActive = false;
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`BullMQ initialization skipped (${message}); operating with resilient in-memory queue.`);
    }
  }

  /**
   * Registers a job processor handler for a specific job name.
   */
  registerHandler<T>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler as JobHandler<any>);
  }

  /**
   * Adds a job to the background queue.
   */
  async add<T>(name: string, data: T, options?: { delayMs?: number; priority?: number }): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (this.isBullMqActive && this.bullQueue) {
      try {
        const bullJob = await this.bullQueue.add(name, data, {
          delay: options?.delayMs,
          priority: options?.priority,
          jobId: id,
        });
        logger.info(`Queued BullMQ job [${name}#${bullJob.id}]`);
        return bullJob.id ?? id;
      } catch (err) {
        logger.warn(`BullMQ add failed, falling back to memory queue: ${(err as Error).message}`);
      }
    }

    const job: BackgroundJob<T> = {
      id,
      name,
      data,
      createdAt: new Date(),
    };
    this.queue.push(job as BackgroundJob);
    logger.info(`Queued silent background job [${name}#${id}]`);

    if (options?.delayMs && options.delayMs > 0) {
      setTimeout(() => this.processNext(), options.delayMs);
    } else {
      this.processNext();
    }

    return id;
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    const job = this.queue.shift();
    if (job) {
      try {
        logger.info(`Processing background job [${job.name}#${job.id}]`);
        const handler = this.handlers.get(job.name);
        if (handler) {
          await handler(job.data, job.id);
        } else {
          // Default fallback processing
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      } catch (err) {
        logger.error(`Error processing background job ${job.id}`, err);
      }
    }

    this.processing = false;
    if (this.queue.length > 0) {
      this.processNext();
    }
  }

  /**
   * Shuts down BullMQ queue and worker gracefully.
   */
  async close(): Promise<void> {
    if (this.bullWorker) {
      await this.bullWorker.close();
    }
    if (this.bullQueue) {
      await this.bullQueue.close();
    }
    this.isBullMqActive = false;
  }
}

export const jobQueue = new BackgroundJobQueue();
