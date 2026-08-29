-- ==============================================================================
-- Developer Track Pro — Job Application Send Database Migration
-- Tables: job_applications, application_templates, resumes
-- Includes: Indexes, Foreign Keys, Row-Level Security (RLS) & Storage Policies
-- ==============================================================================

-- Enable UUID extension if not yet enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Resumes Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT DEFAULT 'application/pdf',
    file_size INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on resumes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON public.resumes(created_at DESC);

-- Enable RLS on resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Resumes RLS Policies
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
CREATE POLICY "Users can view their own resumes"
    ON public.resumes FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
CREATE POLICY "Users can insert their own resumes"
    ON public.resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
CREATE POLICY "Users can update their own resumes"
    ON public.resumes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
CREATE POLICY "Users can delete their own resumes"
    ON public.resumes FOR DELETE
    USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 2. Application Templates Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
    subject TEXT,
    body TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on templates
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.application_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON public.application_templates(type);

-- Enable RLS on application_templates
ALTER TABLE public.application_templates ENABLE ROW LEVEL SECURITY;

-- Templates RLS Policies
DROP POLICY IF EXISTS "Users can view their own templates" ON public.application_templates;
CREATE POLICY "Users can view their own templates"
    ON public.application_templates FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.application_templates;
CREATE POLICY "Users can insert their own templates"
    ON public.application_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON public.application_templates;
CREATE POLICY "Users can update their own templates"
    ON public.application_templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.application_templates;
CREATE POLICY "Users can delete their own templates"
    ON public.application_templates FOR DELETE
    USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 3. Job Applications Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    location TEXT,
    job_description TEXT,
    source TEXT,
    source_url TEXT,
    experience_required TEXT,
    employment_type TEXT,
    work_mode TEXT,
    salary TEXT,
    required_skills JSONB DEFAULT '[]'::jsonb,
    preferred_skills JSONB DEFAULT '[]'::jsonb,
    education TEXT,
    recruiter_name TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    deadline TIMESTAMPTZ,
    application_methods JSONB DEFAULT '[]'::jsonb,
    selected_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    selected_template_id UUID REFERENCES public.application_templates(id) ON DELETE SET NULL,
    generated_subject TEXT,
    generated_message TEXT,
    status TEXT NOT NULL DEFAULT 'Saved' CHECK (status IN ('Saved', 'Analyzed', 'Applied', 'Interview', 'Rejected', 'Selected', 'Withdrawn')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    applied_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_name ON public.job_applications(company_name);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at DESC);

-- Enable RLS on job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Job Applications RLS Policies
DROP POLICY IF EXISTS "Users can view their own job applications" ON public.job_applications;
CREATE POLICY "Users can view their own job applications"
    ON public.job_applications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own job applications" ON public.job_applications;
CREATE POLICY "Users can insert their own job applications"
    ON public.job_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own job applications" ON public.job_applications;
CREATE POLICY "Users can update their own job applications"
    ON public.job_applications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own job applications" ON public.job_applications;
CREATE POLICY "Users can delete their own job applications"
    ON public.job_applications FOR DELETE
    USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 4. Supabase Storage Bucket & Policies: 'resumes'
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Users can view only their own uploaded resumes
DROP POLICY IF EXISTS "Users can view own resume files" ON storage.objects;
CREATE POLICY "Users can view own resume files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage Policy: Users can upload files to their own user directory
DROP POLICY IF EXISTS "Users can upload own resume files" ON storage.objects;
CREATE POLICY "Users can upload own resume files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage Policy: Users can update their own resume files
DROP POLICY IF EXISTS "Users can update own resume files" ON storage.objects;
CREATE POLICY "Users can update own resume files"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage Policy: Users can delete their own resume files
DROP POLICY IF EXISTS "Users can delete own resume files" ON storage.objects;
CREATE POLICY "Users can delete own resume files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'resumes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
