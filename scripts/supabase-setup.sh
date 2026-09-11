#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 1/5 Log in to Supabase (opens your browser)"
supabase login

echo "== 2/5 Pick an organisation"
supabase orgs list
read -rp "Organisation id: " ORG_ID
read -rsp "Choose a database password (kept only by Supabase): " DB_PASSWORD; echo

echo "== 3/5 Create the project in Singapore"
supabase projects create pants --org-id "$ORG_ID" --region ap-southeast-1 --db-password "$DB_PASSWORD"
supabase projects list
read -rp "Project ref for 'pants': " PROJECT_REF

echo "== 4/5 Link, push schema, enable anonymous sign-ins"
supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD"
supabase db push --password "$DB_PASSWORD"
supabase config push --yes

echo "== 5/5 Public keys for .env.local and Vercel"
echo "NEXT_PUBLIC_SUPABASE_URL=https://${PROJECT_REF}.supabase.co"
supabase projects api-keys --project-ref "$PROJECT_REF"
echo
echo "Copy the sb_publishable_... key as NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
