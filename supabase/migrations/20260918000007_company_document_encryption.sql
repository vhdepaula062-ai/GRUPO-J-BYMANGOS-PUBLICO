BEGIN;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cnpj_encrypted text;
-- No authenticated/public SELECT grant on the ciphertext column.
COMMENT ON COLUMN public.organizations.cnpj_encrypted IS 'AES-256-GCM; chave externa ao banco. Acesso somente pelo servidor autorizado.';
COMMIT;
