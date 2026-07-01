import Container from '@/components/Container';
import HomeBanner from '@/components/HomeBanner';
import HomeProduct from '@/components/HomeProduct';
import TeamUpSection from '@/components/TeamUpSection';
// import ProductGrid from '@/components/ProductGrid';

import React from 'react'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tobey-studios.vercel.app";

const Home = () => {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Original Tobey Studios",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Original Tobey Studios",
    "url": baseUrl,
    "logo": `${baseUrl}/vercel.svg`,
    "sameAs": [
      "https://twitter.com/tobeystudios",
      "https://instagram.com/tobeystudios"
    ]
  };

  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeBanner />
      {/* <div className=' py-10'>
        <ProductGrid/>
    </div> */}
      <div className="py-10">
        <HomeProduct />
      </div>
      <TeamUpSection />
    </Container>

  )
}

export default Home;