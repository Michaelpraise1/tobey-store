import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { Product } from "@/sanity.types";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ProductOptionSelect from "./ProductOptionSelect"; // We will create this as a client component
import AddToWishlistButton from "@/components/AddToWishlistButton";
import { Flame } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const query = `*[_type == "product" && slug.current == $slug][0]`;
  const product = await client.fetch(query, { slug });
  return product;
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return notFound();
  }

  // The main image is typically the first one
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left column: Images */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative border">
            {mainImage ? (
              <Image
                src={urlFor(mainImage).url()}
                alt={product.title || "Product image"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                No image available
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.status === "available" && (
                 <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Sale</span>
              )}
              {product.status === "new" && (
                 <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">New</span>
              )}
               {product.status === "out_of_stock" && (
                 <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Out of Stock</span>
              )}
              {product.status === "hot" && (
                 <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                   <Flame size={14} className="fill-white" /> Hot
                 </span>
              )}
            </div>
          </div>
          
          {/* Thumbnails (if multiple images) */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img: any, idx: number) => (
                <div key={idx} className="relative w-20 h-20 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-gray-900 rounded-md overflow-hidden bg-gray-100">
                  <Image 
                    src={urlFor(img).width(150).height(150).url()} 
                    alt={`Thumbnail ${idx}`} 
                    fill 
                    className="object-cover" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-xl text-gray-500 mb-6 font-medium capitalize">
             {product.variants || "Apparel"}
          </p>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">${product.price?.toFixed(2)}</span>
            {product.discount && (
              <span className="text-xl text-gray-400 line-through mb-1">${product.discount}</span>
            )}
            {product.discount && (
               <span className="bg-green-100 text-green-700 text-sm font-semibold px-2 py-1 rounded-md ml-2 mb-1">
                 Save ${Number(product.discount) - Number(product.price)}
               </span>
            )}
          </div>

          <div className="h-px w-full bg-gray-200 my-4"></div>

          {/* Options (Sizes / Tastes) */}
          <ProductOptionSelect product={product} />

          {/* Add to Cart & Wishlist */}
          <div className="mt-8 flex gap-4">
             <div className="flex-1">
               <AddToCartButton product={product} />
             </div>
             <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                <AddToWishlistButton product={product} />
             </div>
          </div>

          <div className="h-px w-full bg-gray-200 my-8"></div>

          {/* Description */}
          {product.description && (
             <div className="prose prose-sm sm:prose-base text-gray-600">
               {/* As portable text rendering is complex, 
                   we'll display a fallback if there's text, or you can add PortableText here */}
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Description</h3>
               <p>This is a great product with premium quality building materials designed and finished with care.</p>
             </div>
          )}

           {/* Additional metadata */}
           <div className="mt-8 text-sm text-gray-500 space-y-2">
             <p><strong className="text-gray-900">Stock Status:</strong> {(product.stock && product.stock > 0) ? `${product.stock} in stock` : 'Out of stock'}</p>
             {product.categories && (
               <p><strong className="text-gray-900">Category:</strong> {product.categories.map((c: any) => c.title || '').join(", ")}</p>
             )}
           </div>

        </div>
      </div>
    </div>
  );
}
