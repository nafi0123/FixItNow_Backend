import SSLCommerzPayment from "sslcommerz-lts";
import config from "../../config/index";
import { prisma } from "../../lib/prisma";

const getFrontendUrl = () => {
  const envUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/$/, "");
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "https://frontend-five-sand-57.vercel.app";
  }
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
};

const getBackendUrl = () => {
  const envUrl = process.env.BACKEND_API_URL || process.env.BACKEND_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/$/, "");
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "https://fix-it-now-brown.vercel.app";
  }
  return "http://localhost:5001";
};

// In-memory cache for transaction redirect URLs (guarantees correct return destination across gateways)
const transactionRedirectMap = new Map<string, string>();

const createPaymentSessionInDB = async (
  customerId: string,
  bookingId: string,
  redirectUrl?: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      technicianProfile: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found!");
  }

  if (booking.customerId !== customerId) {
    throw new Error("Unauthorized! This booking does not belong to you.");
  }

  if (booking.status !== "ACCEPTED") {
    throw new Error("You can only pay for ACCEPTED bookings!");
  }

  if (booking.paymentStatus === "PAID") {
    throw new Error("This booking is already paid!");
  }

  const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentAmount = booking.technicianProfile.basePrice || 500;

  if (redirectUrl) {
    transactionRedirectMap.set(transactionId, redirectUrl);
  }

  const bUrl = getBackendUrl();
  const redirectParam = redirectUrl ? `&redirectUrl=${encodeURIComponent(redirectUrl)}` : '';
  const successUrl = `${bUrl}/api/payments/confirm?status=success&tranId=${transactionId}&bookingId=${bookingId}${redirectParam}`;
  const failUrl = `${bUrl}/api/payments/confirm?status=fail&tranId=${transactionId}&bookingId=${bookingId}${redirectParam}`;
  const cancelUrl = `${bUrl}/api/payments/confirm?status=cancel&tranId=${transactionId}&bookingId=${bookingId}${redirectParam}`;

  const data = {
    total_amount: paymentAmount,
    currency: "BDT",
    tran_id: transactionId,
    success_url: successUrl,
    fail_url: failUrl,
    cancel_url: cancelUrl,
    ipn_url: `${bUrl}/api/payments/ipn`,
    shipping_method: "NO",
    product_name: "Technician Service",
    product_category: "Service",
    product_profile: "general",
    cus_name: booking.customer.name || "Customer Name",
    cus_email: booking.customer.email || "customer@mail.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01700000000",
    cus_fax: "01700000000",
    ship_name: booking.customer.name || "Customer Name",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: "1000",
    ship_country: "Bangladesh",
    value_a: redirectUrl || "",
  };

  const isLive = !config.ssl.is_sandbox;
  const sslcz = new SSLCommerzPayment(
    String(config.ssl.store_id).trim(),
    String(config.ssl.store_passwd).trim(),
    isLive,
  );

  const response = await sslcz.init(data);

  if (response?.GatewayPageURL) {
    await prisma.payment.upsert({
      where: { bookingId: bookingId },
      update: { transactionId, amount: paymentAmount, status: "PENDING" },
      create: {
        bookingId: bookingId,
        transactionId: transactionId,
        amount: paymentAmount,
        status: "PENDING",
      },
    });

    return { paymentUrl: response.GatewayPageURL };
  } else {
    throw new Error("Failed to initiate SSLCommerz payment session");
  }
};

const confirmPaymentInDB = async (data: any) => {
  const status = data.status || data.element;
  const tranId = data.tranId || data.tran_id;
  const bookingId = data.bookingId;
  const savedRedirect = tranId ? transactionRedirectMap.get(tranId) : undefined;
  const targetRedirect =
    data.value_a ||
    data.redirectUrl ||
    savedRedirect ||
    `${getFrontendUrl()}/dashboard/bookings`;

  if (tranId) {
    transactionRedirectMap.delete(tranId);
  }

  if (status === "success" || status === "VALID") {
    if (tranId) {
      try {
        const paymentRecord = await prisma.payment.findUnique({
          where: { transactionId: tranId },
        });
        const targetBookingId = bookingId || paymentRecord?.bookingId;

        const updates: any[] = [
          prisma.payment.update({
            where: { transactionId: tranId },
            data: { status: "PAID" },
          }),
        ];

        if (targetBookingId) {
          updates.push(
            prisma.booking.update({
              where: { id: targetBookingId },
              data: { paymentStatus: "PAID" },
            }),
          );
        }

        await prisma.$transaction(updates);
      } catch (err) {
        console.error("Prisma confirm update warning:", err);
      }
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; padding: 20px;">
        <div style="background: white; border: 1px solid #E7E2D8; border-radius: 24px; padding: 40px; text-align: center; max-width: 420px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background-color: #E6F4EA; color: #0FA894; font-size: 32px; border-radius: 50%; margin-bottom: 20px; font-weight: bold;">✓</div>
          <h1 style="color: #14171C; font-size: 24px; margin: 0 0 8px 0; font-weight: 800;">Payment Successful!</h1>
          <p style="color: #6B707E; font-size: 13px; margin: 0 0 20px 0;">Transaction ID: <strong style="color: #14171C;">${tranId || 'N/A'}</strong></p>
          <a href="${targetRedirect}" style="display: block; width: 100%; box-sizing: border-box; background-color: #FF5A36; color: white; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 24px; border-radius: 14px; box-shadow: 0 4px 12px rgba(255,90,54,0.25);">
            Go to Bookings
          </a>
          <p style="color: #9AA0AA; font-size: 12px; margin-top: 16px;">Redirecting back to app in 2 seconds...</p>
        </div>
      </div>
      <script>
        setTimeout(function() {
          window.location.href = "${targetRedirect}";
        }, 2000);
      </script>
    `;
  } else {
    if (tranId) {
      try {
        const paymentRecord = await prisma.payment.findUnique({
          where: { transactionId: tranId },
        });
        const targetBookingId = bookingId || paymentRecord?.bookingId;

        const updates: any[] = [
          prisma.payment.update({
            where: { transactionId: tranId },
            data: { status: "FAILED" },
          }),
        ];

        if (targetBookingId) {
          updates.push(
            prisma.booking.update({
              where: { id: targetBookingId },
              data: { paymentStatus: "FAILED" },
            }),
          );
        }

        await prisma.$transaction(updates);
      } catch (err) {
        console.error("Prisma fail update warning:", err);
      }
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; padding: 20px;">
        <div style="background: white; border: 1px solid #E7E2D8; border-radius: 24px; padding: 40px; text-align: center; max-width: 420px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background-color: #FCE8E6; color: #E53935; font-size: 32px; border-radius: 50%; margin-bottom: 20px; font-weight: bold;">✕</div>
          <h1 style="color: #14171C; font-size: 24px; margin: 0 0 8px 0; font-weight: 800;">Payment Failed</h1>
          <p style="color: #6B707E; font-size: 13px; margin: 0 0 20px 0;">Something went wrong during the payment process.</p>
          <a href="${targetRedirect}" style="display: block; width: 100%; box-sizing: border-box; background-color: #14171C; color: white; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 24px; border-radius: 14px;">
            Back to Bookings
          </a>
        </div>
      </div>
      <script>
        setTimeout(function() {
          window.location.href = "${targetRedirect}";
        }, 2000);
      </script>
    `;
  }
};

const getAllPaymentsFromDB = async (userId: string, role: string) => {
  let whereClause = {};

  if (role === "CUSTOMER") {
    whereClause = {
      booking: {
        customerId: userId,
      },
    };
  } else if (role === "TECHNICIAN") {
    whereClause = {
      booking: {
        technicianProfile: {
          userId: userId,
        },
      },
    };
  }

  const result = await prisma.payment.findMany({
    where: whereClause,
    include: {
      booking: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          technicianProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getPaymentByIdFromDB = async (
  transactionId: string,
  userId: string,
  role: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: transactionId },
    include: {
      booking: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          technicianProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found!");
  }

  if (role === "CUSTOMER" && payment.booking.customerId !== userId) {
    throw new Error("Unauthorized access to this payment details!");
  }

  if (
    role === "TECHNICIAN" &&
    payment.booking.technicianProfile.userId !== userId
  ) {
    throw new Error("Unauthorized access to this payment details!");
  }

  return payment;
};

export const PaymentServices = {
  createPaymentSessionInDB,
  confirmPaymentInDB,
  getAllPaymentsFromDB,
  getPaymentByIdFromDB,
};
