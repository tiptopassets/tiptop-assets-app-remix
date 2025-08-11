-- Performance indexes for common filters and lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_user_id ON public.affiliate_earnings (user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_provider_name ON public.affiliate_earnings (provider_name);

CREATE INDEX IF NOT EXISTS idx_flexoffers_transactions_user_id ON public.flexoffers_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_flexoffers_user_mapping_sub_id ON public.flexoffers_user_mapping (sub_affiliate_id);

CREATE INDEX IF NOT EXISTS idx_user_asset_selections_user_id ON public.user_asset_selections (user_id);
CREATE INDEX IF NOT EXISTS idx_user_asset_selections_session_id ON public.user_asset_selections (session_id);
CREATE INDEX IF NOT EXISTS idx_user_asset_selections_analysis_id ON public.user_asset_selections (analysis_id);

CREATE INDEX IF NOT EXISTS idx_user_journey_complete_user_id ON public.user_journey_complete (user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_complete_session_id ON public.user_journey_complete (session_id);

CREATE INDEX IF NOT EXISTS idx_user_property_analyses_user_id ON public.user_property_analyses (user_id);

CREATE INDEX IF NOT EXISTS idx_partner_clicks_user_id ON public.partner_clicks (user_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_registrations_user_id ON public.affiliate_registrations (user_id);
