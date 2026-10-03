-- Create computed columns for short ID searching
CREATE OR REPLACE FUNCTION text_id(properties) RETURNS text AS $$
  SELECT $1.id::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION text_owner_id(properties) RETURNS text AS $$
  SELECT $1.owner_id::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION text_id(profiles) RETURNS text AS $$
  SELECT $1.id::text;
$$ LANGUAGE sql STABLE;
