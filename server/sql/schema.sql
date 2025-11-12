-- PostgreSQL schema for JobSpeedy AI auth separation

create table if not exists admin_users (
  id serial primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id serial primary key,
  full_name text not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Seed one admin and one user (change hashes accordingly if needed)
-- password for both below is: Password123!
insert into admin_users (email, password_hash)
values ('admin@example.com', '$2a$10$8Z8m8s9wQ3mQfQO1Yd8g2eIxm5Sg7xQd8xO1U7jE1m2jL0GmTqv8i')
on conflict (email) do nothing;

insert into users (full_name, email, password_hash)
values ('John Doe', 'john@example.com', '$2a$10$8Z8m8s9wQ3mQfQO1Yd8g2eIxm5Sg7xQd8xO1U7jE1m2jL0GmTqv8i')
on conflict (email) do nothing;

-- Applicants and Jobs for resume parsing and suggestions
create table if not exists applicants (
  id serial primary key,
  name text,
  email text,
  phone text,
  skills text[],
  experience jsonb,
  education text,
  resume_filename text,
  resume_mime text,
  resume_data bytea,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id serial primary key,
  title text,
  company text,
  description text,
  required_skills text[],
  location text,
  job_type text,
  category text,
  language text,
  created_at timestamptz not null default now()
);

-- Seed sample jobs if table is empty
insert into jobs (title, company, description, required_skills, location, job_type, category, language)
select * from (values
  ('Frontend Developer','TechNova','Build UI with React','{"React","HTML","CSS"}','Berlin','Full Time','Engineering','English'),
  ('Backend Developer','DataWorks','APIs with Node and Postgres','{"Node.js","PostgreSQL","Express"}','Munich','Full Time','Engineering','English'),
  ('Full Stack Developer','StackLab','End-to-end features','{"React","Node.js","SQL"}','Remote','Remote','Engineering','English'),
  ('AI Engineer','SmartHire','ML/NLP systems','{"Python","ML","NLP"}','Hamburg','Full Time','AI','English'),
  ('DevOps Engineer','CloudOps','Infra & CI/CD','{"Docker","AWS","CI/CD"}','Remote','Remote','Engineering','English')
) as t(title,company,description,required_skills,location,job_type,category,language)
where not exists (select 1 from jobs);

-- In case the table already existed, ensure resume columns are present
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='applicants' and column_name='resume_filename') then
    alter table applicants add column resume_filename text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='applicants' and column_name='resume_mime') then
    alter table applicants add column resume_mime text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='applicants' and column_name='resume_data') then
    alter table applicants add column resume_data bytea;
  end if;
end $$;


-- Ensure new columns exist for existing installs
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='job_type') then
    alter table jobs add column job_type text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='category') then
    alter table jobs add column category text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='jobs' and column_name='language') then
    alter table jobs add column language text;
  end if;
end $$;



-- Applications table to store candidate submissions per job
create table if not exists applications (
  id serial primary key,
  job_id int references jobs(id) on delete cascade,
  name text,
  email text,
  phone text,
  resume_filename text,
  resume_mime text,
  resume_data bytea,
  created_at timestamptz not null default now()
);

