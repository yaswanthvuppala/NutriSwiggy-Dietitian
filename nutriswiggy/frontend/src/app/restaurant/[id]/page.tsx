import { RESTAURANTS } from "@/utils/mockData";
import { RestaurantDetailsClient } from "@/components/RestaurantDetailsClient";

export async function generateStaticParams() {
  return RESTAURANTS.map((restaurant) => ({
    id: restaurant.id,
  }));
}

export default function RestaurantPage({ params }: { params: { id: string } }) {
  return <RestaurantDetailsClient initialRestaurantId={params.id} />;
}
