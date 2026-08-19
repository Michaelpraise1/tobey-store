"use client";

import Container from '@/components/Container';
import { useCartStore } from '@/store/store';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, CheckCircle2, Loader2, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// ── Stripe setup ──────────────────────────────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a1a',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
      iconColor: '#6b7280',
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
  hidePostalCode: true,
};

// ── Inner form (needs Stripe context) ─────────────────────────────────────────
interface CheckoutFormProps {
  formData: {
    firstName: string; lastName: string; email: string; phone: string;
    address: string; city: string; state: string; zipCode: string; country: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  validateFormData: () => boolean;
  onSuccess: (orderId: string) => void;
}

function CheckoutForm({ formData, handleInputChange, validateFormData, onSuccess }: CheckoutFormProps) {
  const { user } = useUser();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

  useEffect(() => {
    if (items.length === 0) router.push('/cart');
  }, [items, router]);

  const submitCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'paypal') {
      if (!validateFormData()) return;
      toast('Please click the PayPal button to complete your purchase.', { icon: 'ℹ️' });
      return;
    }

    if (!validateFormData()) return;
    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found. Please refresh.');
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      // 1. Create a PaymentIntent on the server
      const intentRes = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.error || 'Failed to initialize payment.');

      const { clientSecret } = intentData as { clientSecret: string };

      // 2. Confirm card payment with Stripe (real charge happens here)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone || undefined,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: formData.country,
            },
          },
        },
      });

      if (stripeError) {
        setCardError(stripeError.message || 'Card payment failed.');
        toast.error(stripeError.message || 'Card payment failed.');
        return;
      }

      if (paymentIntent?.status !== 'succeeded') {
        toast.error('Payment was not completed. Please try again.');
        return;
      }

      // 3. Payment succeeded — now save order to Sanity / Printify / send email
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: formData,
          paymentMethod: 'card',
          stripePaymentIntentId: paymentIntent.id,
          userId: user?.id,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed.');

      clearCart();
      toast.success('Payment successful! Order confirmed.');
      onSuccess(orderData.orderId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'USD', intent: 'capture' }}>
      <form onSubmit={submitCardPayment} className="lg:grid lg:grid-cols-12 lg:gap-12 gap-y-10">
        <div className="lg:col-span-7 space-y-8">

          {/* Contact Information */}
          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(For order confirmations)</span></label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input required type="text" name="address" value={formData.address} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                <input required type="text" name="state" value={formData.state} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select required name="country" value={formData.country} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

            <div className="space-y-4 mb-6">
              <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="card"
                      checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')}
                      className="text-black focus:ring-black h-4 w-4" />
                    <span className="font-semibold text-gray-900">Credit / Debit Card</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                    <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center text-[8px] text-white font-bold">MC</div>
                  </div>
                </div>
              </label>

              <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="paypal"
                      checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')}
                      className="text-black focus:ring-black h-4 w-4" />
                    <span className="font-semibold text-gray-900">PayPal</span>
                  </div>
                  <div className="text-[#003087] font-extrabold text-xl italic tracking-tighter">PayPal</div>
                </div>
              </label>
            </div>

            {/* ── Real Stripe Card Element ── */}
            {paymentMethod === 'card' && (
              <div className="p-5 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Lock size={14} className="text-green-600" />
                  <span>Your card details are encrypted and never stored on our servers.</span>
                </div>

                <div className="bg-white border border-gray-300 rounded-md px-4 py-3 focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all">
                  <CardElement options={CARD_ELEMENT_OPTIONS} onChange={() => setCardError(null)} />
                </div>

                {cardError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠</span> {cardError}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  Test card: <span className="font-mono text-gray-600">4242 4242 4242 4242</span> · Any future date · Any 3-digit CVC
                </p>
              </div>
            )}

            {/* PayPal Buttons */}
            {paymentMethod === 'paypal' && (
              <div className="p-5 border border-blue-200 rounded-lg bg-blue-50/50 space-y-4">
                <div className="flex items-center gap-2 text-sm text-blue-900 font-medium">
                  <ShieldCheck size={18} className="text-blue-600" />
                  <span>Pay safely with PayPal or Pay Later</span>
                </div>
                <p className="text-xs text-gray-600">
                  Click the PayPal button below to authorize payment securely.
                </p>
                <div className="pt-2">
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                    createOrder={async (data, actions) => {
                      if (!validateFormData()) throw new Error('Contact and shipping information required');
                      try {
                        const res = await fetch('/api/paypal/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ items }),
                        });
                        const result = await res.json();
                        if (result.orderID) return result.orderID;
                      } catch (e) {
                        console.warn('[PayPal] API order creation fallback:', e);
                      }
                      return actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [{ amount: { currency_code: 'USD', value: getTotalPrice().toFixed(2) }, description: 'Tobey Store Purchase' }],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      setIsProcessing(true);
                      try {
                        let transactionId = data.orderID;
                        if (actions.order) {
                          const details = await actions.order.capture();
                          transactionId = details.id || data.orderID;
                        } else {
                          await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID }),
                          });
                        }
                        const res = await fetch('/api/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ items, customer: formData, paymentMethod: 'paypal', paypalOrderId: transactionId, userId: user?.id }),
                        });
                        const orderData = await res.json();
                        if (!res.ok) throw new Error(orderData.error || 'Failed to submit order');
                        clearCart();
                        toast.success('PayPal payment authorized & completed!');
                        onSuccess(orderData.orderId);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } catch (err: any) {
                        toast.error(err.message || 'PayPal payment processing failed');
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    onError={(err) => {
                      console.error('[PayPal Error]:', err);
                      toast.error('An error occurred during PayPal checkout. Please try again.');
                    }}
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 sticky top-8 shadow-sm">
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

            {paymentMethod === 'card' ? (
              <button
                type="submit"
                disabled={isProcessing || !stripe}
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-shop-dark-red disabled:bg-gray-400 text-white py-4 px-4 rounded-md transition-colors duration-300 font-bold text-lg shadow-md"
              >
                {isProcessing ? (
                  <><Loader2 className="animate-spin" size={20} /> Processing...</>
                ) : (
                  <><CreditCard size={20} /> Pay ${getTotalPrice().toFixed(2)}</>
                )}
              </button>
            ) : (
              <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800 font-medium">
                Use the PayPal button under Payment Method to complete purchase.
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck size={14} className="text-green-600" /> Payments are secure and encrypted.
            </div>
          </div>
        </div>
      </form>
    </PayPalScriptProvider>
  );
}

// ── Page shell (provides Stripe context + success screen) ─────────────────────
export default function CheckoutPage() {
  const { user } = useUser();
  const { items } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
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

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || prev.email,
      }));
    }
  }, [user]);

  if (!isMounted) return null;
  if (items.length === 0 && !isSuccess) { router.push('/cart'); return null; }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateFormData = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('Please complete all contact information fields.');
      return false;
    }
    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      toast.error('Please complete all shipping address fields.');
      return false;
    }
    return true;
  };

  if (isSuccess) {
    return (
      <Container className="py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <CheckCircle2 size={64} className="text-green-500 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6 text-lg max-w-md">
          Thank you for your purchase. Your order <span className="font-semibold text-black">#{orderId}</span> has been received and is being processed.
        </p>
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-md hover:bg-shop-dark-red transition-colors duration-300 font-semibold shadow-md">
          Continue Shopping
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/cart" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1 font-medium">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-darkColor">Checkout</h1>

      <Elements stripe={stripePromise}>
        <CheckoutForm
          formData={formData}
          handleInputChange={handleInputChange}
          validateFormData={validateFormData}
          onSuccess={(id) => { setOrderId(id); setIsSuccess(true); }}
        />
      </Elements>
    </Container>
  );
}
