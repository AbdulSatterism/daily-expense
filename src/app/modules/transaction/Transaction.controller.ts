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


export const TransactionController = {
  createTransaction
};