
-- Create a private storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);

-- Only the document owner can upload
CREATE POLICY "Users can upload their own verification docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Only admins can view verification docs
CREATE POLICY "Admins can view verification docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'verification-docs' AND public.has_role(auth.uid(), 'admin'));

-- Users can view their own uploads
CREATE POLICY "Users can view own verification docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
