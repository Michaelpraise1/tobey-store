import Container from '@/components/Container';
import ProductGrid from '@/components/ProductGrid';
import React from 'react';

export const metadata = {
  title: 'Shop',
  description: 'Browse all Mortal Fang Kombat gear — apparel, beverages & limited editions.',
};

const ShopPage = () => {
  return (
    <Container>
      <div className="py-10">
        <ProductGrid />
      </div>
    </Container>
  );
};

export default ShopPage;
