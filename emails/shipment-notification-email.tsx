import React from 'react';
import type { Order, User } from '@prisma/client';

interface ShipmentNotificationEmailProps {
  orderId: string;
  userName: string | null;
  trackingNumber?: string; // Optional tracking number
  shippingCarrier?: string; // Optional carrier
}

export const ShipmentNotificationEmail: React.FC<Readonly<ShipmentNotificationEmailProps>> = ({
  orderId,
  userName,
  trackingNumber,
  shippingCarrier,
}) => {
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders/${orderId}`; // Link to order details

  return (
    <div>
      <h1>Your Order Has Shipped!</h1>
      <p>Hi {userName || 'Customer'},</p>
      <p>Good news! Your order #{orderId.substring(0, 8)}... has shipped.</p>

      {trackingNumber && shippingCarrier && (
        <p>
          You can track your package using the following details: <br />
          Carrier: {shippingCarrier} <br />
          Tracking Number: {trackingNumber} <br />
          {/* TODO: Add a tracking link if possible */}
        </p>
      )}
       {trackingNumber && !shippingCarrier && (
         <p>Tracking Number: {trackingNumber}</p>
      )}

      <p>
        You can view your order details here: <a href={orderUrl} target="_blank" rel="noopener noreferrer">View Order</a>
      </p>

      <p>Thanks again for your order!</p>
      <p>The Cigar Accessories Team</p>
    </div>
  );
};

export default ShipmentNotificationEmail;
