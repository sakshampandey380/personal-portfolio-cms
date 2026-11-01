/**
 * ==========================================================================
 * CONFIGURATION TEMPLATE — SUPABASE BACKEND CONNECTION
 * ==========================================================================
 * Copy these values into the Admin Dashboard -> "Account & Security" ->
 * "Backend Connection" panel, or set window.__PORTFOLIO_CONFIG__ before
 * loading app scripts.
 *
 * SECURITY NOTE:
 * - NEVER place a Supabase `service_role` secret key or database password in
 *   frontend files.
 * - Only the public Project URL and `anon` public key belong on the client.
 * - All write authorization is enforced server-side by PostgreSQL Row-Level
 *   Security (RLS) policies in `/backend/policies.sql`.
 */

window.__PORTFOLIO_CONFIG_EXAMPLE__ = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabaseAnonKey: 'your-public-anon-key-here',
  storageBucketResumes: 'resumes',
  storageBucketMedia: 'portfolio-media'
};
