CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 name text NOT NULL DEFAULT '' CHECK (char_length(name) <= 100),
 avatar_id text,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING ((select auth.uid()) = id);
CREATE POLICY "Create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
CREATE FUNCTION public.create_office_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, name) VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),100));
 RETURN NEW;
END;
$$;
CREATE TRIGGER office_profile_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_office_profile();
CREATE TABLE public.office_state (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 tasks jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(tasks) = 'array'),
 notes jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(notes) = 'array'),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.office_state TO authenticated;
GRANT ALL ON public.office_state TO service_role;
ALTER TABLE public.office_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own office" ON public.office_state FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Create own office" ON public.office_state FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Update own office" ON public.office_state FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);