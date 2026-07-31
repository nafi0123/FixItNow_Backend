import SSLCommerzPayment from "sslcommerz-lts";
import config from "../../config/index";
import { prisma } from "../../lib/prisma";

const createPaymentSessionInDB = async (
  customerId: string,
  bookingId: string,
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

  const data = {
    total_amount: paymentAmount,
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${config.ssl.success_url}&tranId=${transactionId}&bookingId=${bookingId}`,
    fail_url: `${config.ssl.fail_url}&tranId=${transactionId}&bookingId=${bookingId}`,
    cancel_url: config.ssl.cancel_url,
    ipn_url: "https://fix-it-now-brown.vercel.app/api/payments/ipn",
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

  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || process.env.APP_URL || "http://localhost:3000";

  if (status === "success" || status === "VALID") {
    if (tranId && bookingId) {
      try {
        await prisma.$transaction([
          prisma.payment.update({
            where: { transactionId: tranId },
            data: { status: "PAID" },
          }),
          prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: "PAID" },
          }),
        ]);
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
          <a href="${frontendUrl}/dashboard/bookings" style="display: block; width: 100%; box-sizing: border-box; background-color: #FF5A36; color: white; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 24px; border-radius: 14px; box-shadow: 0 4px 12px rgba(255,90,54,0.25);">
            Go to My Bookings
          </a>
          <p style="color: #9AA0AA; font-size: 12px; margin-top: 16px;">Redirecting to My Bookings in 3 seconds...</p>
        </div>
      </div>
      <script>
        setTimeout(function() {
          window.location.href = "${frontendUrl}/dashboard/bookings";
        }, 3000);
      </script>
    `;
  } else {
    if (tranId && bookingId) {
      try {
        await prisma.$transaction([
          prisma.payment.update({
            where: { transactionId: tranId },
            data: { status: "FAILED" },
          }),
          prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: "FAILED" },
          }),
        ]);
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
          <a href="${frontendUrl}/dashboard/bookings" style="display: block; width: 100%; box-sizing: border-box; background-color: #14171C; color: white; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 24px; border-radius: 14px;">
            Back to My Bookings
          </a>
        </div>
      </div>
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
