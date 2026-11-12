import { serve } from 'inngest/next';
import { inngest, inngestFunctions } from '@prolific/jobs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
