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

  if (status === "success" || status === "VALID") {
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

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; font-family: sans-serif;">
        <div style="color: #4CAF50; font-size: 48px; margin-bottom: 10px;">✔</div>
        <h1 style="color: #333; margin: 0;">Payment Successful!</h1>
        <p style="color: #666; margin-top: 10px;">Transaction ID: <strong>${tranId}</strong></p>
        <p style="color: #999; font-size: 14px;">You can close this window now.</p>
      </div>
    `;
  } else {
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

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; font-family: sans-serif;">
        <div style="color: #F44336; font-size: 48px; margin-bottom: 10px;">✘</div>
        <h1 style="color: #333; margin: 0;">Payment Failed!</h1>
        <p style="color: #666; margin-top: 10px;">Something went wrong during the process.</p>
        <p style="color: #999; font-size: 14px;">Please try again from your booking panel.</p>
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
