import { getMerchProductBySlug, getMerchProducts } from "@/lib/queries/merch";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MerchConfigurator from "@/components/MerchConfigurator";
import Container from "@/components/Container";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const products = await getMerchProducts();
  return products.map((p) => ({ slug: p.slug.current }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getMerchProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seoTitle ?? product.title,
    description:
      product.seoDescription ??
      `Shop the ${product.title} — exclusive Tobey Studios merch, printed and shipped on demand.`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MerchProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getMerchProductBySlug(slug);

  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50">
        <Container className="py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Link href="/" className="hover:text-shop-dark-red transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link href="/merch" className="hover:text-shop-dark-red transition-colors">
              Merch
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 line-clamp-1">{product.title}</span>
          </nav>
        </Container>
      </div>

      {/* Product configurator (client component) */}
      <Container className="py-10 sm:py-14">
        <MerchConfigurator product={product} />
      </Container>
    </div>
  );
};

export default MerchProductPage;
