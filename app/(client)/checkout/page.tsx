"use client";

import Container from '@/components/Container';
import { useCartStore } from '@/store/store';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function CheckoutPage() {
  const { user } = useUser();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  useEffect(() => {
    setIsMounted(true);
    // Auto-fill some fields if logged in via Clerk
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || prev.email
      }));
    }
  }, [user]);

  if (!isMounted) return null;

  if (items.length === 0 && !isSuccess) {
    router.push('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Send payload to our Next.js backend route
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: formData,
          paymentMethod
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      setOrderId(data.orderId);
      setIsSuccess(true);
      clearCart();
      toast.success('Payment completed successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <Container className="py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <CheckCircle2 size={64} className="text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6 text-lg max-w-md">
          Thank you for your purchase. Your order <span className="font-semibold text-black">#{orderId}</span> has been received and is being processed by our fulfillment center.
        </p>
        <Link 
          href="/" 
          className="bg-black text-white px-8 py-3 rounded-md hover:bg-shop-dark-red transition-colors duration-300"
        >
          Continue Shopping
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/cart" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-darkColor">Checkout</h1>
      
      <form onSubmit={handleCheckoutSubmit} className="lg:grid lg:grid-cols-12 lg:gap-12 gap-y-10">
        <div className="lg:col-span-7 space-y-8">
          
          {/* Contact Information */}
          <section className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(For order confirmations)</span></label>
                <input 
                  required type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input 
                  required type="text" name="address" value={formData.address} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  required type="text" name="city" value={formData.city} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                <input 
                  required type="text" name="state" value={formData.state} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                <input 
                  required type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select 
                  required name="country" value={formData.country} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="FR">France</option>
                  {/* Add more countries here */}
                </select>
              </div>
            </div>
          </section>

          {/* Payment Method Details */}
          <section className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            
            <div className="space-y-4 mb-6">
              <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" name="paymentMethod" value="card" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')}
                      className="text-black focus:ring-black h-4 w-4" 
                    />
                    <span className="font-semibold text-gray-900">Credit / Debit Card</span>
                  </div>
                  <div className="flex gap-1">
                    {/* Simulated Card Icons */}
                    <div className="w-8 h-5 bg-blue-600 rounded"></div>
                    <div className="w-8 h-5 bg-red-500 rounded"></div>
                  </div>
                </div>
              </label>

              <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" name="paymentMethod" value="paypal" 
                      checked={paymentMethod === 'paypal'} 
                      onChange={() => setPaymentMethod('paypal')}
                      className="text-black focus:ring-black h-4 w-4" 
                    />
                    <span className="font-semibold text-gray-900">PayPal</span>
                  </div>
                  <div className="text-[#003087] font-bold text-xl italic tracking-tighter">PayPal</div>
                </div>
              </label>
            </div>

            {/* Simulated Payment Gateway Inputs */}
            {paymentMethod === 'card' && (
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-0.5 rounded border">Sandbox Mode</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <div className="relative">
                    <input 
                      required type="text" placeholder="0000 0000 0000 0000" maxLength={19}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black bg-white"
                    />
                    <CreditCard className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (MM/YY)</label>
                    <input 
                      required type="text" placeholder="MM / YY" maxLength={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Code (CVC)</label>
                    <input 
                      required type="text" placeholder="123" maxLength={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50 text-center">
                <p className="text-gray-600 mb-2">You will be redirected to PayPal securely to complete your purchase.</p>
              </div>
            )}
            
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-4">Order Summary</h2>
            
            <div className="max-h-[40vh] overflow-y-auto mb-6 pr-2 space-y-4">
              {items.map((item) => (
                <div key={item.product._id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] z-10 font-bold">
                      {item.quantity}
                    </div>
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image src={urlFor(item.product.images[0]).url()} alt={item.product.title || ''} fill className="object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400 absolute inset-0 flex items-center justify-center">No Image</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.product.title}</p>
                    <p className="text-sm font-bold text-gray-700">${((item.product.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span>
                <span>$0.00</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-shop-dark-red disabled:bg-gray-400 text-white py-4 px-4 rounded-md transition-colors duration-300 font-bold text-lg shadow-md"
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin" size={20} /> Processing...</>
              ) : (
                <>Pay ${getTotalPrice().toFixed(2)}</>
              )}
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              Payments are secure and encrypted.
            </div>
          </div>
        </div>
      </form>
    </Container>
  );
}
