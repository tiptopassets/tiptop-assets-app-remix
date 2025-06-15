
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
    console.log('💾 Saving address:', { userId, address, isFirstAddress });
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!address) {
      throw new Error('Address is required');
    }

    // Check if address already exists for this user
    const { data: existingAddress, error: checkError } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('address', address)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking existing address:', checkError);
      throw checkError;
    }

    if (existingAddress) {
      console.log('ℹ️ Address already exists with ID:', existingAddress.id);
      return existingAddress.id;
    }

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

    if (error) {
      console.error('❌ Error inserting address:', error);
      throw error;
    }
    
    console.log('✅ Address saved successfully:', data.id);
    return data.id;
  } catch (err) {
    console.error('❌ Error saving address:', err);
    throw err;
  }
};

export const loadUserAddresses = async (userId: string): Promise<UserAddress[]> => {
  try {
    console.log('📍 Loading addresses for user:', userId);
    
    if (!userId) {
      console.warn('⚠️ No user ID provided for loading addresses');
      return [];
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error loading addresses:', error);
      throw error;
    }
    
    console.log('✅ Loaded addresses:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Error loading addresses:', err);
    throw err;
  }
};
