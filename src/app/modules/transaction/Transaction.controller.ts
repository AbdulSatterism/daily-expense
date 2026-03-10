import catchAsync from "@/shared/catchAsync";
import { TransactionService } from "./Transaction.service";
import sendResponse from "@/shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createTransaction = catchAsync(async (req, res) => {


  const result = await TransactionService.createTransaction(req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Transaction created successfully',
    data: result,
  });
});

const getTransactionById = catchAsync(async (req, res) => {

    const result = await TransactionService.getTransactionById(req.user.id, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Transaction retrieved successfully',
        data: result,
    });
});

const getTransactionSummary = catchAsync(async (req, res) => {

  const result = await TransactionService.getTransactionSummary(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Transaction summary retrieved successfully',
    data: result,
  });
});


const getMonthlyTrend = catchAsync(async (req, res) => {
    const result = await TransactionService.getMonthlyTrend(req.user.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Monthly trend retrieved successfully',
        data: result,
    });
});

const monthlyFinanceList = catchAsync(async (req, res) => {

    const result = await TransactionService.monthlyFinanceList(req.user.id,req.query);
    
    sendResponse(res, { 
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Monthly expense retrieved successfully',
        data: result,
    });
});


const getFinanceReport = catchAsync(async (req, res) => {

    const result = await TransactionService.getFinanceReport(req.user.id, req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Finance report retrieved successfully',
        data: result,
    });
});


const dashboardHomeReport = catchAsync(async (req, res) => {

    const result = await TransactionService.dashboardHomeReport(req.user.id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Dashboard report retrieved successfully',
        data: result,
    });
});

export const TransactionController = {
  createTransaction,
  getTransactionSummary,
  getTransactionById,
  getMonthlyTrend,
  monthlyFinanceList,
  getFinanceReport,
    dashboardHomeReport,
};