import HeroBanner from "@/features/home/hero-banner";
import CategorySlider from "@/features/home/category-slider";
import FeaturedProducts from "@/features/home/featured-products";
import BestSellers from "@/features/home/best-sellers";
import FlashSale from "@/features/home/flash-sale";
import TrendingProducts from "@/features/home/trending-products";
import CategoryProducts from "@/features/home/category-products";

export default function HomePage() {
  return (
    <div className="space-y-8 pb-12">
      <HeroBanner />
      <div className="container">
        <CategorySlider />
        <div className="mt-8">
          <FeaturedProducts />
        </div>
        <div className="mt-8">
          <BestSellers />
        </div>
        <div className="mt-8">
          <FlashSale />
        </div>
        <div className="mt-8">
          <TrendingProducts />
        </div>
        <div className="mt-8">
          <CategoryProducts slug="groceries" title="Groceries" />
        </div>
        <div className="mt-8">
          <CategoryProducts slug="vegetables" title="Fresh Vegetables" />
        </div>
        <div className="mt-8">
          <CategoryProducts slug="fruits" title="Fresh Fruits" />
        </div>
        <div className="mt-8">
          <CategoryProducts slug="milk-dairy" title="Milk & Dairy" />
        </div>
        <div className="mt-8">
          <CategoryProducts slug="snacks" title="Snacks" />
        </div>
        <div className="mt-8">
          <CategoryProducts slug="beverages" title="Beverages" />
        </div>
        <div className="mt-8">
          <CategoryProducts slug="bakery" title="Bakery" />
        </div>
      </div>
    </div>
  );
}
