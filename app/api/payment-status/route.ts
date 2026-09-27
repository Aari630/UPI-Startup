import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { getMerchantById } from "@/lib/mock-db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const qrId = req.nextUrl.searchParams.get("qrId");
  const merchantId = req.nextUrl.searchParams.get("merchantId");

  if (!qrId || !merchantId) {
    return NextResponse.json({ error: "Missing payment identifiers" }, { status: 400 });
  }

  // --- AUTOMATED DEMO BYPASS ---
  if (qrId.startsWith("qr_mock_")) {
    // Extract the timestamp we embedded in the ID
    const createdAt = parseInt(qrId.replace("qr_mock_", ""), 10);
    const elapsedSeconds = (Date.now() - createdAt) / 1000;

    // Wait 8 seconds, then magically flip to "paid"
    if (elapsedSeconds > 8) {
      return NextResponse.json({ paid: true });
    }
    
    // Otherwise, keep showing the QR code
    return NextResponse.json({ paid: false }); 
  }
  // -----------------------------

  try {
    const merchant = await getMerchantById(merchantId);
    if (!merchant?.razorpayKeyId || !merchant.razorpayKeySecret) {
      return NextResponse.json({ error: "Merchant payment configuration is unavailable" }, { status: 404 });
    }

    const razorpay = new Razorpay({ key_id: merchant.razorpayKeyId, key_secret: merchant.razorpayKeySecret });
    const qrCode = await razorpay.qrCode.fetch(qrId);
    const paid =
      qrCode.payments_amount_received > 0 ||
      (qrCode.status === "closed" && qrCode.close_reason === "paid");

    return NextResponse.json({ paid });
  } catch (error) {
    console.error("Razorpay QR status fetch failed", error);
    return NextResponse.json(
      { error: "Unable to fetch payment status" },
      { status: 500 },
    );
  }
}