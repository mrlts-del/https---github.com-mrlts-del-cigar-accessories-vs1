import React from 'react';
import type { Order, OrderItem, Product, Address } from '@prisma/client';
import { formatCurrency } from '@/lib/utils'; // Assuming formatCurrency exists

// Define the expected props, combining related data
interface OrderConfirmationEmailProps {
  order: Order & {
    address: Address | null;
    items: (OrderItem & {
      // Include product relation with selected fields including images
      product: {
        name: string;
        images: { url: string }[]; // Expect an array of images with url
      } | null;
    })[];
    user: { // Include user name if available
       name: string | null;
    } | null;
  };
}

// Basic functional component structure for the email
export const OrderConfirmationEmail: React.FC<Readonly<OrderConfirmationEmailProps>> = ({ order }) => {
  const orderDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(order.createdAt);
  const shippingAddress = order.address;

  return (
    <div>
      <h1>Thank you for your order, {order.user?.name || 'Customer'}!</h1>
      <p>Order ID: {order.id}</p>
      <p>Order Date: {orderDate}</p>
      <hr />

      <h2>Order Summary</h2>
      {order.items.map((item) => (
        <div key={item.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
          <p><strong>{item.product?.name || 'Product Name Missing'}</strong></p>
          <p>Quantity: {item.quantity}</p>
          <p>Price: {formatCurrency(item.price)}</p>
          {/* Optional: Add product image */}
          {/* {item.product?.images?.[0]?.url && <img src={item.product.images[0].url} alt={item.product.name} width="50" />} */}
        </div>
      ))}
      <hr />

      <p><strong>Subtotal:</strong> {formatCurrency(order.total)}</p> {/* Assuming order.total is subtotal before shipping/tax */}
      {/* TODO: Add Shipping and Tax details if applicable */}
      <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
      <hr />

      {shippingAddress && (
         <div>
            <h2>Shipping Address</h2>
            <p>{shippingAddress.street}</p>
            <p>{shippingAddress.city}, {shippingAddress.state ? `${shippingAddress.state} ` : ''}{shippingAddress.zip}</p>
            <p>{shippingAddress.country}</p>
         </div>
      )}

      <p>We'll notify you when your order ships.</p>
      <p>Thanks for shopping with Cigar Accessories!</p>
    </div>
  );
};

export default OrderConfirmationEmail;
