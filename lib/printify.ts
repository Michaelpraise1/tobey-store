/**
 * lib/printify.ts
 *
 * Server-side Printify API client.
 * All functions run exclusively in Next.js Route Handlers / Server Actions —
 * the API key is NEVER sent to the browser.
 *
 * Docs: https://developers.printify.com
 */

const PRINTIFY_BASE_URL = 'https://api.printify.com/v1';

function getHeaders() {
  const apiKey = process.env.PRINTIFY_API_KEY;
  if (!apiKey) {
    throw new Error('[Printify] PRINTIFY_API_KEY is not set in environment variables.');
  }
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': 'TobeyStore/1.0',
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrintifyAddress = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;         // 2-letter state code (US), province name otherwise
  zip: string;
  country: string;       // ISO 3166-1 alpha-2 (e.g. "US", "CA", "GB")
};

export type PrintifyLineItem = {
  product_id: string;    // Printify product ID (from Sanity)
  variant_id: number;    // Printify variant ID (size + color combination)
  quantity: number;
};

export type PrintifyOrderPayload = {
  external_id: string;   // Your own order ID for cross-referencing
  label?: string;        // Optional human-readable label shown in Printify dashboard
  line_items: PrintifyLineItem[];
  shipping_method: number; // 1 = Standard, 2 = Express (check provider catalog)
  send_shipping_notification: boolean;
  address_to: PrintifyAddress;
};

export type PrintifyOrderResponse = {
  id: string;             // Printify's internal order ID
  external_id: string;
  status: string;
  shipping_method: number;
  total_price: number;    // In cents
  total_tax: number;
  total_shipping: number;
  created_at: string;
};

export type PrintifyVariant = {
  id: number;
  title: string;
  price: number;          // In cents
  sku: string;
  is_enabled: boolean;
  options: number[];      // Blueprint option value IDs
};

export type PrintifyProductPayload = {
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: Array<{
    id: number;
    price: number;        // In cents
    is_enabled: boolean;
  }>;
  print_areas: Array<{
    variant_ids: number[];
    placeholders: Array<{
      position: string;   // e.g. "front", "back"
      images: Array<{
        id: string;       // Printify image ID (must be uploaded first)
        x: number;
        y: number;
        scale: number;
        angle: number;
      }>;
    }>;
  }>;
};

export type PrintifyProductResponse = {
  id: string;
  title: string;
  variants: PrintifyVariant[];
};

export type PrintifyShipment = {
  carrier: string;
  number: string;
  url: string;
  delivered_at: string | null;
};

export type PrintifyWebhookEvent = {
  type: string;
  resource: {
    id: string;           // Printify order ID
    type: string;
    data?: {
      shipment?: PrintifyShipment;
      status?: string;
    };
  };
};

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Submit an order to Printify for print + fulfillment.
 * Call this after a successful Stripe payment confirmation.
 */
export async function createPrintifyOrder(
  shopId: string,
  payload: PrintifyOrderPayload
): Promise<PrintifyOrderResponse> {
  const url = `${PRINTIFY_BASE_URL}/shops/${shopId}/orders.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `[Printify] createOrder failed (${res.status}): ${errorBody}`
    );
  }

  return res.json() as Promise<PrintifyOrderResponse>;
}

/**
 * Retrieve a single Printify order by its Printify order ID.
 * Useful for polling status before webhooks are set up.
 */
export async function getPrintifyOrder(
  shopId: string,
  printifyOrderId: string
): Promise<PrintifyOrderResponse> {
  const url = `${PRINTIFY_BASE_URL}/shops/${shopId}/orders/${printifyOrderId}.json`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `[Printify] getOrder failed (${res.status}): ${errorBody}`
    );
  }

  return res.json() as Promise<PrintifyOrderResponse>;
}

/**
 * Create a product in Printify from a Sanity product document.
 * Used by the admin-only product sync route.
 * NOTE: Print area images must already be uploaded to Printify via their
 * image upload endpoint before calling this.
 */
export async function createPrintifyProduct(
  shopId: string,
  payload: PrintifyProductPayload
): Promise<PrintifyProductResponse> {
  const url = `${PRINTIFY_BASE_URL}/shops/${shopId}/products.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `[Printify] createProduct failed (${res.status}): ${errorBody}`
    );
  }

  return res.json() as Promise<PrintifyProductResponse>;
}

/**
 * Upload an image to Printify's image library from a URL (e.g. Sanity CDN).
 * Returns the Printify image ID needed for print area configuration.
 */
export async function uploadImageToPrintify(
  shopId: string,
  imageUrl: string,
  fileName: string
): Promise<{ id: string }> {
  const url = `${PRINTIFY_BASE_URL}/uploads/images.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      file_name: fileName,
      url: imageUrl,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `[Printify] uploadImage failed (${res.status}): ${errorBody}`
    );
  }

  return res.json() as Promise<{ id: string }>;
}

/**
 * List all shops connected to the Printify account.
 * Useful for finding your PRINTIFY_SHOP_ID.
 */
export async function getPrintifyShops(): Promise<Array<{ id: number; title: string; sales_channel: string }>> {
  const res = await fetch(`${PRINTIFY_BASE_URL}/shops.json`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`[Printify] getShops failed (${res.status}): ${errorBody}`);
  }

  return res.json();
}

/**
 * Build a PrintifyLineItem from a cart item, looking up variant ID.
 * Returns null if the product doesn't have Printify data configured.
 */
export function buildPrintifyLineItem(params: {
  printifyProductId: string;
  printifyVariantId: number;
  quantity: number;
}): PrintifyLineItem {
  return {
    product_id: params.printifyProductId,
    variant_id: params.printifyVariantId,
    quantity: params.quantity,
  };
}
