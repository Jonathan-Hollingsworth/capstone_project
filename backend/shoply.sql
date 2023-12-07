\echo 'Delete and recreate shoply db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE shoply;
CREATE DATABASE shoply;
\connect shoply

\i shoply-schema.sql
\i shoply-seed.sql

\echo 'Delete and recreate shoply_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE shoply_test;
CREATE DATABASE shoply_test;
\connect shoply_test

\i shoply-schema.sql