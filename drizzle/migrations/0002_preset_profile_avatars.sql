CREATE OR REPLACE FUNCTION public.create_office_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, name, avatar_id) VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),100), CASE WHEN NEW.raw_user_meta_data->>'avatar_id' IN ('pam','dwight','dundie','jelly','jim','michael') THEN NEW.raw_user_meta_data->>'avatar_id' ELSE NULL END);
 RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.create_office_profile() FROM PUBLIC, anon, authenticated;
ALTER TABLE public.profiles ADD CONSTRAINT profile_preset_avatar CHECK (avatar_id IS NULL OR avatar_id IN ('pam','dwight','dundie','jelly','jim','michael'));