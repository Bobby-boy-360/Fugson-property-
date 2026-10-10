const API_URL = import.meta.env.VITE_API_URL;

function getHeaders() {
  const token = localStorage.getItem('auth_token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

export interface PaystackInitialization {
  payment_id: string;
  reference: string;
  access_code: string;
  authorization_url: string;
  amount: number;
  currency: string;
}

export const paymentService = {
  async initializePaystack(
    years: number,
    callbackUrl: string
  ): Promise<PaystackInitialization> {
    const response = await fetch(
      `${API_URL}/api/payments/initialize-paystack`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          years,
          callback_url: callbackUrl,
        }),
      }
    );

    return handleResponse<PaystackInitialization>(response);
  },

  async verifyPaystack(
    paymentId: string,
    reference: string
  ) {
    const response = await fetch(
      `${API_URL}/api/payments/${encodeURIComponent(
        paymentId
      )}/verify-paystack`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          reference,
        }),
      }
    );

    return handleResponse(response);
  },
};