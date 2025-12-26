"use client";

import React from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = "ASnBkn_GjnLjxVByY7C75333lyRQlZ8iOSLsHfPgSS7QfuXI2V-uPE0DYYFED5olmz7FfCyh3xsYvGgU";

export function PayPalProviderWrapper({ children }: { children: React.ReactNode }) {
     const initialOptions = {
          clientId: PAYPAL_CLIENT_ID,
          currency: "USD",
          intent: "capture",
     };

     return (
          <PayPalScriptProvider options={initialOptions}>
               {children}
          </PayPalScriptProvider>
     );
}
