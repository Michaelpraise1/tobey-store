import Container from '@/components/Container';
import HomeBanner from '@/components/HomeBanner';
import HomeProduct from '@/components/HomeProduct';
import TeamUpSection from '@/components/TeamUpSection';
// import ProductGrid from '@/components/ProductGrid';

import React from 'react'

const Home = () => {
  return (
    <Container >
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