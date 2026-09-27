"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createMerchant, getMerchantById, MOCK_DB, updateMerchantKeys } from "@/lib/mock-db";

function setMerchantSession(merchantId: string) {
  cookies().set("merchant-session", merchantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const merchant = await MOCK_DB.getMerchantByEmail(email);

  if (!merchant || merchant.password !== password) {
    return { error: "Invalid credentials" };
  }

  setMerchantSession(merchant.id);

  return { success: true };
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const storeName = String(formData.get("storeName") ?? "").trim();

  if (!email || !password || !storeName) {
    return { error: "Store name, email, and password are required." };
  }

  const existingMerchant = await MOCK_DB.getMerchantByEmail(email);

  if (existingMerchant) {
    return { error: "Email already exists." };
  }

  const merchant = await createMerchant({
    email,
    password,
    storeName,
    razorpayKeyId: "",
    razorpayKeySecret: "",
  });

  setMerchantSession(merchant.id);
  return { success: true };
}

export async function logout() {
  cookies().delete("merchant-session");
  redirect("/login");
}

export async function saveApiKeys(formData: FormData) {
  const merchantId = cookies().get("merchant-session")?.value;
  const keyId = String(formData.get("razorpayKeyId") ?? "").trim();
  const keySecret = String(formData.get("razorpayKeySecret") ?? "").trim();

  if (!merchantId || !keyId || !keySecret) {
    return;
  }

  const merchant = await getMerchantById(merchantId);
  
  // Only log the user out if their user record actually no longer exists
  if (!merchant) {
    cookies().delete("merchant-session");
    redirect("/login");
  }

  // Safely attempt the update without destroying the session if it fails
  const updated = await updateMerchantKeys(merchant.id, keyId, keySecret);
  
  if (!updated) {
    console.error("Failed to update keys. Ensure your Supabase UPDATE policy is active.");
    return; 
  }

  revalidatePath("/dashboard");
}