-- Function to create a user profile when a new user signs up
-- This function now copies firstName, lastName, and role from the user's metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, auth_id, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    new.id,
    new.raw_user_meta_data ->> 'firstName',
    new.raw_user_meta_data ->> 'lastName',
    -- Cast the role from metadata to the user_role enum type
    (new.raw_user_meta_data ->> 'role')::user_role 
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
-- This ensures the trigger is correctly applied after the function is updated
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
