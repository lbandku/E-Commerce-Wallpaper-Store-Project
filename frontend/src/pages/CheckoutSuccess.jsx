import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function CheckoutSuccess(){
  const [params] = useSearchParams();
  useEffect(() => {
    const session_id = params.get('session_id');
    const productId = params.get('productId');
    if (session_id && productId){
      api.get(`/checkout/record?session_id=${session_id}&productId=${productId}`);
    }
  }, []);
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">Payment Successful</h2>
      <p className="text-gray-600">Thanks! Your download is ready on the product page or from your email receipt.</p>
    </div>
  );
}


