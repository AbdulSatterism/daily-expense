import catchAsync from "@/shared/catchAsync";
import { GuestService } from "./Guest.service";
import sendResponse from "@/shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createGuestCapitalApplication = catchAsync(async (req, res) => {


  const result = await GuestService.createGuestCapitalApplication(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Capital application created successfully',
    data: result,
  });
});


const allApplications = catchAsync(async (req, res) => {
    
  const result = await GuestService.allApplications(req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Capital applications retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});


const singleApplication = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await GuestService.singleApplication(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Capital application retrieved successfully',
        data: result,
    });
});


const rejectGuest = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await GuestService.rejectGuest(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Capital application rejected successfully',
        data: result,
    });
});

const approvedGuestAndCreateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await GuestService.approvedGuestAndCreateUser(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Capital application approved and user created successfully',
        data: result,
    });
});

export const GuestController = {
  createGuestCapitalApplication,
    allApplications,
    singleApplication,
    rejectGuest,
    approvedGuestAndCreateUser
};  
    
