import crypto from "crypto";

// ============================================================
// DUITKU Payment Gateway Integration
// ============================================================

const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE || "";
const API_KEY = process.env.DUITKU_API_KEY || "";
const BASE_URL = process.env.DUITKU_BASE_URL || "https://sandbox.duitku.com/webapi/api/merchant";
const CALLBACK_URL = process.env.DUITKU_CALLBACK_URL || "";
const RETURN_URL = process.env.DUITKU_RETURN_URL || "";

interface CreateInvoiceParams {
  merchantOrderId: string;
  amount: number;
  productDetails: string;
  customerEmail: string;
  customerName: string;
  paymentChannel?: string;
}

interface DuitkuInvoiceResponse {
  merchantCode: string;
  reference: string;
  paymentUrl: string;
  vaNumber?: string;
  qrString?: string;
  appUrl?: string;
  AppUrl?: string;
  amount: string;
  statusCode: string;
  statusMessage: string;
}

interface DuitkuCallbackPayload {
  merchantCode: string;
  amount: string;
  merchantOrderId: string;
  productDetail: string;
  additionalParam: string;
  paymentCode: string;
  resultCode: string;
  merchantUserId: string;
  reference: string;
  signature: string;
}

export function generateSignature(
  merchantCode: string,
  merchantOrderId: string,
  amount: number
): string {
  const params = `${merchantCode}${merchantOrderId}${amount}${API_KEY}`;
  return crypto.createHash("md5").update(params).digest("hex");
}

export function verifyCallbackSignature(
  merchantCode: string,
  amount: string,
  merchantOrderId: string,
  signature: string
): boolean {
  const params = `${merchantCode}${amount}${merchantOrderId}${API_KEY}`;
  const expectedSignature = crypto.createHash("md5").update(params).digest("hex");
  return signature === expectedSignature;
}

export async function createInvoice(
  params: CreateInvoiceParams
): Promise<DuitkuInvoiceResponse> {
  const signature = generateSignature(
    MERCHANT_CODE,
    params.merchantOrderId,
    params.amount
  );

  const body = {
    merchantCode: MERCHANT_CODE,
    paymentAmount: params.amount,
    merchantOrderId: params.merchantOrderId,
    productDetails: params.productDetails,
    email: params.customerEmail,
    customerVaName: params.customerName,
    callbackUrl: CALLBACK_URL,
    returnUrl: RETURN_URL,
    signature,
    expiryPeriod: 1440, // 24 hours
    ...(params.paymentChannel && { paymentMethod: params.paymentChannel }),
  };

  console.log("[Duitku] Creating invoice:", {
    merchantOrderId: params.merchantOrderId,
    amount: params.amount,
    url: `${BASE_URL}/v2/inquiry`,
  });

  const response = await fetch(`${BASE_URL}/v2/inquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  console.log("[Duitku] Response:", response.status, responseText);

  if (!response.ok) {
    throw new Error(`Duitku API error: ${response.status} - ${responseText}`);
  }

  try {
    const parsed = JSON.parse(responseText) as DuitkuInvoiceResponse;

    // Duitku docs sometimes use `AppUrl` casing in examples.
    if (!parsed.appUrl && parsed.AppUrl) {
      parsed.appUrl = parsed.AppUrl;
    }

    return parsed;
  } catch {
    throw new Error(`Duitku API returned invalid JSON: ${responseText}`);
  }
}

export async function checkTransactionStatus(
  merchantOrderId: string
): Promise<{ statusCode: string; statusMessage: string }> {
  const signature = crypto
    .createHash("md5")
    .update(`${MERCHANT_CODE}${merchantOrderId}${API_KEY}`)
    .digest("hex");

  const response = await fetch(`${BASE_URL}/transactionStatus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantCode: MERCHANT_CODE,
      merchantOrderId,
      signature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Duitku API error: ${response.status}`);
  }

  return response.json();
}

export async function getPaymentChannels(
  amount: number
): Promise<{ paymentMethod: string; paymentName: string; paymentImage: string; totalFee: number }[]> {
  const datetime = new Date().toISOString().slice(0, 19);
  const signature = crypto
    .createHash("sha256")
    .update(`${MERCHANT_CODE}${amount}${datetime}${API_KEY}`)
    .digest("hex");

  const response = await fetch(`${BASE_URL}/paymentmethod/getpaymentmethod`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantcode: MERCHANT_CODE,
      amount,
      datetime,
      signature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Duitku API error: ${response.status}`);
  }

  const data = await response.json();
  const fees: unknown[] = Array.isArray(data?.paymentFee) ? data.paymentFee : [];
  return fees
    .map((row) => {
      const r = row as Record<string, unknown>;
      return {
        paymentMethod: String(r.paymentMethod ?? ""),
        paymentName: String(r.paymentName ?? ""),
        paymentImage: String(r.paymentImage ?? ""),
        totalFee: Number(r.totalFee ?? 0),
      };
    })
    .filter((ch) => Boolean(ch.paymentMethod));
}

export function isCallbackValid(payload: DuitkuCallbackPayload): boolean {
  return verifyCallbackSignature(
    payload.merchantCode,
    payload.amount,
    payload.merchantOrderId,
    payload.signature
  );
}
