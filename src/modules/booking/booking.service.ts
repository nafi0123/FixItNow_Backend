import { prisma } from '../../lib/prisma';
import { ICreateBookingRequest } from './booking.interface';
import SSLCommerzPayment from 'sslcommerz-lts';
import config from '../../config';

const createBookingInDB = async (customerId: string, payload: ICreateBookingRequest) => {
  const isTechnicianExist = await prisma.technicianProfile.findUnique({
    where: { id: payload.technicianProfileId },
  });

  if (!isTechnicianExist) {
    throw new Error('Technician profile not found!');
  }

  const result = await prisma.booking.create({
    data: {
      customerId: customerId,
      technicianProfileId: payload.technicianProfileId,
      bookingDate: new Date(payload.bookingDate),
      slot: payload.slot,
      status: 'PENDING',
    },
    include: {
      technicianProfile: {
        include: {
          user: { select: { name: true, email: true } }
        }
      }
    }
  });

  return result;
};

const getUserBookingsFromDB = async (userId: string, role: string) => {
  const whereConditions: any = {};

  if (role === 'CUSTOMER') {
    whereConditions.customerId = userId;
  } else if (role === 'TECHNICIAN') {
    whereConditions.technicianProfile = { userId: userId };
  }

  const result = await prisma.booking.findMany({
    where: whereConditions,
    include: {
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  return result;
};

const getBookingDetailsFromDB = async (bookingId: string, userId: string, role: string) => {
  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { name: true, email: true } },
      technicianProfile: true, 
    }
  });

  if (!result) {
    throw new Error('Booking details not found!');
  }

  if (role === 'CUSTOMER' && result.customerId !== userId) {
    throw new Error('Unauthorized access to this booking!');
  }

  let paymentUrl = null;

  const currentStatus = String(result.status).toUpperCase().trim();
  const currentPaymentStatus = String(result.paymentStatus).toUpperCase().trim();
  const currentUserRole = String(role).toUpperCase().trim();

  if (currentStatus === 'ACCEPTED' && (currentPaymentStatus === 'UNPAID' || currentPaymentStatus === 'FAILED') && currentUserRole === 'CUSTOMER') {
    
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentAmount = Number(result.technicianProfile?.basePrice) || 500; 

    // 🎯 ফিক্স: ভুল .env ফাইল থেকে বাচার জন্য সাকসেস/ফেইল ইউআরএল ডিরেক্টলি সেট করা হলো
    const sslData = {
      total_amount: paymentAmount,
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `http://localhost:5001/api/payments/confirm?status=success&tranId=${transactionId}&bookingId=${bookingId}`,
      fail_url: `http://localhost:5001/api/payments/confirm?status=fail&tranId=${transactionId}&bookingId=${bookingId}`,
      cancel_url: `http://localhost:5001/api/payments/confirm?status=cancel&tranId=${transactionId}&bookingId=${bookingId}`,
      ipn_url: 'http://localhost:5001/api/payments/ipn',
      shipping_method: 'NO',
      product_name: 'Technician Service',
      product_category: 'Service',
      product_profile: 'general',
      cus_name: result.customer?.name || 'Customer',
      cus_email: result.customer?.email || 'customer@mail.com',
      cus_add1: 'Dhaka', cus_city: 'Dhaka', cus_country: 'Bangladesh', cus_phone: '01700000000',
      ship_name: 'Customer Name', ship_add1: 'Dhaka', ship_city: 'Dhaka', ship_country: 'Bangladesh',
    };

    try {
      const storeId = String(config.ssl.store_id).trim();
      const storePasswd = String(config.ssl.store_passwd).trim();
      const isLive = !config.ssl.is_sandbox;

      const sslcz = new SSLCommerzPayment(storeId, storePasswd, isLive);
      const response = await sslcz.init(sslData);

      if (response?.GatewayPageURL) {
        await prisma.payment.upsert({
          where: { bookingId: bookingId },
          update: { transactionId, amount: paymentAmount, status: 'PENDING' },
          create: {
            bookingId: bookingId,
            transactionId: transactionId,
            amount: paymentAmount,
            status: 'PENDING',
          },
        });

        paymentUrl = response.GatewayPageURL;
      } else {
        throw new Error(`SSLCommerz Error: ${response?.failedreason || 'Gateway URL missing'}`);
      }
    } catch (error: any) {
      throw new Error(`Payment Session Creation Failed: ${error.message}`);
    }
  }

  return {
    ...result,
    paymentUrl
  };
};

export const BookingServices = {
  createBookingInDB,
  getUserBookingsFromDB,
  getBookingDetailsFromDB,
};