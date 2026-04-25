DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'Role'
      AND e.enumlabel = 'STUDENT'
  ) THEN
    ALTER TYPE "Role" ADD VALUE 'STUDENT';
  END IF;
END $$;
