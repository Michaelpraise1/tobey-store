import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const backendClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // We need fresh data for creating/mutating
  token: process.env.SANITY_API_TOKEN,
});
