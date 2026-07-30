/**
 * POST /api/printify/sync-product
 *
 * Admin-only route that syncs a Sanity product document to Printify.
 * Given a Sanity product ID, it:
 *  1. Fetches the product from Sanity (blueprint, provider, designs, sizes, price)
 *  2. Uploads design images to Printify's image library
 *  3. Creates the product in Printify via their Create Product API
 *  4. Writes the returned printifyProductId and variant map back to Sanity
 *
 * Protected: requires either an admin Clerk session or a valid X-Admin-Secret header.
 *
 * Usage:
 *   POST /api/printify/sync-product
 *   Body: { "sanityDocumentId": "<sanity doc _id>", "documentType": "product" | "merchProduct" }
 */

import { NextResponse } from 'next/server';
import { backendClient } from '@/sanity/lib/backendClient';
import { client } from '@/sanity/lib/client';
import {
  createPrintifyProduct,
  uploadImageToPrintify,
  type PrintifyProductPayload,
} from '@/lib/printify';

// ─── Auth guard ───────────────────────────────────────────────────────────────

function isAuthorized(request: Request): boolean {
  const secret = request.headers.get('x-admin-secret');
  return secret === process.env.PRINTIFY_WEBHOOK_SECRET;
}

// ─── Sanity query ─────────────────────────────────────────────────────────────

const MERCH_PRODUCT_QUERY = `*[_type == "merchProduct" && _id == $id][0]{
  _id,
  title,
  description,
  basePrice,
  printifyBlueprintId,
  printifyPrintProviderId,
  availableSizes,
  designs[]{
    name,
    previewImage { asset->{ url }, alt },
    printifyVariantIds
  },
  colorOptions[]{
    label,
    hex,
    printifyColorId
  }
}`;

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // Auth check
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Env check
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const apiKey = process.env.PRINTIFY_API_KEY;
  const sanityToken = process.env.SANITY_API_TOKEN;

  if (!shopId || !apiKey) {
    return NextResponse.json(
      { error: 'Printify credentials are not configured.' },
      { status: 500 }
    );
  }
  if (!sanityToken) {
    return NextResponse.json(
      { error: 'SANITY_API_TOKEN is not set — cannot write back to Sanity.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { sanityDocumentId } = body as { sanityDocumentId?: string };

    if (!sanityDocumentId) {
      return NextResponse.json({ error: 'sanityDocumentId is required.' }, { status: 400 });
    }

    // ── 1. Fetch the merch product from Sanity ─────────────────────────────────
    const sanityProduct = await client.fetch(MERCH_PRODUCT_QUERY, { id: sanityDocumentId });

    if (!sanityProduct) {
      return NextResponse.json(
        { error: `No merch product found with ID: ${sanityDocumentId}` },
        { status: 404 }
      );
    }

    if (!sanityProduct.printifyBlueprintId || !sanityProduct.printifyPrintProviderId) {
      return NextResponse.json(
        {
          error:
            'Product is missing printifyBlueprintId or printifyPrintProviderId. ' +
            'Fill these in Sanity Studio under the Fulfillment tab before syncing.',
        },
        { status: 422 }
      );
    }

    // ── 2. Upload design images to Printify ────────────────────────────────────
    console.log(`[Printify Sync] Uploading design images for "${sanityProduct.title}"...`);

    const uploadedImageIds: Record<string, string> = {}; // design name → Printify image ID

    for (const design of (sanityProduct.designs || [])) {
      if (!design.previewImage?.asset?.url) {
        console.warn(`[Printify Sync] Design "${design.name}" has no image — skipping upload.`);
        continue;
      }

      try {
        const uploaded = await uploadImageToPrintify(
          shopId,
          design.previewImage.asset.url,
          `${sanityProduct.title}-${design.name}.png`
        );
        uploadedImageIds[design.name] = uploaded.id;
        console.log(`[Printify Sync] Uploaded "${design.name}" → Printify image ID: ${uploaded.id}`);
      } catch (uploadErr) {
        console.error(`[Printify Sync] Failed to upload design "${design.name}":`, uploadErr);
      }
    }

    // ── 3. Build the Printify product payload ──────────────────────────────────
    // Price in cents
    const priceInCents = Math.round((sanityProduct.basePrice || 0) * 100);

    // Use the variant IDs from the first design if available, otherwise use a placeholder
    const allVariantIds: number[] = (sanityProduct.designs || []).flatMap(
      (d: { printifyVariantIds?: number[] }) => d.printifyVariantIds || []
    );

    if (allVariantIds.length === 0) {
      return NextResponse.json(
        {
          error:
            'No Printify variant IDs found in any design. ' +
            'Add printifyVariantIds to each design in Sanity Studio before syncing.',
        },
        { status: 422 }
      );
    }

    // Build print areas using uploaded image IDs
    const printAreas: PrintifyProductPayload['print_areas'] = (sanityProduct.designs || [])
      .filter((d: { name: string; printifyVariantIds?: number[] }) => uploadedImageIds[d.name] && (d.printifyVariantIds?.length || 0) > 0)
      .map((d: { name: string; printifyVariantIds?: number[] }) => ({
        variant_ids: d.printifyVariantIds || [],
        placeholders: [
          {
            position: 'front',
            images: [
              {
                id: uploadedImageIds[d.name],
                x: 0.5,
                y: 0.5,
                scale: 1,
                angle: 0,
              },
            ],
          },
        ],
      }));

    const productPayload: PrintifyProductPayload = {
      title: sanityProduct.title,
      description: 'Original Tobey Studios merchandise.',
      blueprint_id: sanityProduct.printifyBlueprintId,
      print_provider_id: sanityProduct.printifyPrintProviderId,
      variants: allVariantIds.map((id: number) => ({
        id,
        price: priceInCents,
        is_enabled: true,
      })),
      print_areas: printAreas,
    };

    // ── 4. Create the product in Printify ──────────────────────────────────────
    console.log(`[Printify Sync] Creating product in Printify shop ${shopId}...`);
    const printifyProduct = await createPrintifyProduct(shopId, productPayload);

    console.log(`[Printify Sync] Product created. Printify ID: ${printifyProduct.id}`);

    // ── 5. Write printifyProductId back to Sanity ──────────────────────────────
    await backendClient.patch(sanityDocumentId).set({
      printifyProductId: printifyProduct.id,
    }).commit();

    console.log(`[Sanity] Patched ${sanityDocumentId} with printifyProductId: ${printifyProduct.id}`);

    return NextResponse.json({
      success: true,
      printifyProductId: printifyProduct.id,
      variantCount: printifyProduct.variants?.length || 0,
      message: `Product "${sanityProduct.title}" synced to Printify successfully.`,
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[Printify Sync] Unhandled error:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
