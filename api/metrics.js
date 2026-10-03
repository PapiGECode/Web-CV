import { createMetricsHandler } from '../server/metrics.js';
export const config = { runtime: 'edge' };
export default createMetricsHandler({ env: process.env });
