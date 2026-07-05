import { ErrorRequestHandler } from 'express';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';
  let errorDetails = err;

  // Prisma unique constraint error (যেমন: ডুপ্লিকেট ইমেইল) হ্যান্ডেল করা
  if (err.code === 'P2002') {
    statusCode = 400;
    message = `Duplicate value for field: ${err.meta?.target}`;
  }

  // Prisma record not found error হ্যান্ডেল করা
  if (err.code === 'P2025') {
    statusCode = 404;
    message = err.meta?.cause || 'Record not found!';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default globalErrorHandler;