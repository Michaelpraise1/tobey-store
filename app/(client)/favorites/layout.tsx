import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View and manage your saved and favorite Mortal Fang Kombat merchandise.",
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
