import { createContactHandler } from '../server/contact.js';
export const config = { runtime: 'edge' };
export default createContactHandler({ env: process.env });
