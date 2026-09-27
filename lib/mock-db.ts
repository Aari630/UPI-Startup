import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Merchant = {
  id: string;
  email: string;
  password: string;
  storeName: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
};

let client: SupabaseClient | null = null;

function supabase() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  client = createClient(url, anonKey);
  return client;
}

// Helper to translate Supabase snake_case rows to Next.js camelCase objects
function mapToMerchant(dbRow: any): Merchant | null {
  if (!dbRow) return null;
  return {
    id: dbRow.id,
    email: dbRow.email,
    password: dbRow.password,
    storeName: dbRow.store_name,
    razorpayKeyId: dbRow.razorpay_key_id,
    razorpayKeySecret: dbRow.razorpay_key_secret,
  };
}

export async function getMerchantByEmail(email: string) {
  const { data } = await supabase()
    .from("merchants")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  return mapToMerchant(data);
}

export async function getMerchantByStoreName(storeName: string) {
  const { data } = await supabase()
    .from("merchants")
    .select("*")
    .eq("store_name", storeName) // Query the snake_case column
    .maybeSingle();

  return mapToMerchant(data);
}

export async function getMerchantById(id: string) {
  const { data } = await supabase()
    .from("merchants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return mapToMerchant(data);
}

export async function createMerchant(merchantData: Omit<Merchant, "id">) {
  // Map camelCase input to snake_case database columns
  const { data, error } = await supabase()
    .from("merchants")
    .insert([
      {
        email: merchantData.email,
        password: merchantData.password,
        store_name: merchantData.storeName,
        razorpay_key_id: merchantData.razorpayKeyId,
        razorpay_key_secret: merchantData.razorpayKeySecret,
      },
    ])
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create merchant");
  }

  // Use the non-null assertion since we already threw an error if !data
  return mapToMerchant(data)!;
}

export async function updateMerchantKeys(id: string, razorpayKeyId: string, razorpayKeySecret: string) {
  // Map camelCase input to snake_case database columns
  const { data } = await supabase()
    .from("merchants")
    .update({ 
      razorpay_key_id: razorpayKeyId, 
      razorpay_key_secret: razorpayKeySecret 
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  return mapToMerchant(data);
}

export const MOCK_DB = {
  getMerchantByEmail,
  getMerchantByStoreName,
  getMerchantById,
  createMerchant,
  updateMerchantKeys,
};