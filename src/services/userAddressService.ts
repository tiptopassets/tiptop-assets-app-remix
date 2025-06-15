
import { supabase } from '@/integrations/supabase/client';
import { UserAddress } from '@/types/userData';

export const saveAddress = async (
  userId: string,
  address: string,
  coordinates?: any,
  formattedAddress?: string,
  isFirstAddress: boolean = false
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        address,
        formatted_address: formattedAddress || address,
        coordinates,
        is_primary: isFirstAddress
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.error('Error saving address:', err);
    throw err;
  }
};

export const loadUserAddresses = async (userId: string): Promise<UserAddress[]> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error loading addresses:', err);
    throw err;
  }
};
