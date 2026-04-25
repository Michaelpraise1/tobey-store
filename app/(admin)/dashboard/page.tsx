import React from 'react';
import { client } from '@/sanity/lib/client';
import { DollarSign, Package, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

// GROQ Queries
const DASHBOARD_QUERY = `
  {
    "orders": *[_type == "order"] | order(orderDate desc)[0...10] {
      _id,
      orderNumber,
      customerName,
      customerEmail,
      amount,
      status,
      "date": _createdAt,
      products
    },
    "totalRevenue": math::sum(*[_type == "order" && status != 'cancelled'].amount),
    "totalOrders": count(*[_type == "order"]),
    "productCount": count(*[_type == "product"]),
    "recentProducts": *[_type == "product"] | order(_createdAt desc)[0...5] {
      _id,
      title,
      price,
      stock,
      images
    }
  }
`;

export const revalidate = 0; // Disable static rendering to ensure fresh metrics

export default async function AdminDashboardPage() {
  const data = await client.fetch(DASHBOARD_QUERY);
  const { orders = [], totalRevenue = 0, totalOrders = 0, productCount = 0, recentProducts = [] } = data;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Here's a look at your store's performance today.</p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400">All-time successful sales</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400">All-time order count</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Products</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{productCount}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Package size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Total variants in catalog</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Payments</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">$0.00</h3>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Awaiting Stripe settlements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length > 0 ? orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.orderNumber || order._id.substring(0,8)}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{order.customerName}</div>
                      <div className="text-gray-500 text-xs">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'processing' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ${(order.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      No orders have been placed yet. Waiting for your first sale!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Management Box */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Product Lineup</h2>
            <a href="/studio/intent/create/template=product;type=product/" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Add New
            </a>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-4">
            {recentProducts.length > 0 ? recentProducts.map((product: any) => (
              <a 
                href={`/studio/structure/product;${product._id}`} 
                target="_blank" 
                rel="noreferrer"
                key={product._id} 
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg group transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="w-12 h-12 relative bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <Image src={urlFor(product.images[0]).url()} alt={product.title} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{product.title}</h4>
                  <p className="text-xs text-gray-500">${product.price || 0} • {product.stock || 0} in stock</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600" />
              </a>
            )) : (
              <p className="text-center text-sm text-gray-500 py-6">No products found.</p>
            )}
            
            <a href="/studio/structure/product" target="_blank" rel="noreferrer" className="mt-auto w-full py-2.5 bg-gray-50 text-gray-600 text-sm font-medium text-center rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
              Launch Product Editor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
