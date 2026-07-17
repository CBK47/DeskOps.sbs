# Local personal customisation

DeskOps keeps personal, client, health, and financial data out of the public repository. The `personal/` directory is Git-ignored so you can keep private seed data beside your local checkout without accidentally publishing it.

## Add private streams locally

1. Copy the generic example:

   ```bash
   mkdir -p personal
   cp personal.example/streams.sql personal/streams.local.sql
   ```

2. In Supabase, open **Authentication > Users** and copy the UUID for the account that should own the streams.
3. Replace every `00000000-0000-0000-0000-000000000000` placeholder in `personal/streams.local.sql` with that UUID.
4. Link the intended Supabase project and review the SQL before running it:

   ```bash
   supabase link --project-ref <project-ref>
   npm run seed:personal
   ```

`npm run seed:personal` writes to the linked database. Check the linked project carefully before running it. Only generic examples belong in `personal.example/`; never commit the private `personal/` directory.
