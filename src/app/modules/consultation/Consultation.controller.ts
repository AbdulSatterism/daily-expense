import catchAsync from "@/shared/catchAsync";
import { ConsultationService } from "./Consultation.service";
import sendResponse from "@/shared/sendResponse";
import { StatusCodes } from "http-status-codes";


const createConsultation = catchAsync(async (req, res) => {


  const result = await ConsultationService.createConsultation(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Consultation created successfully',
    data: result,
  });
});


const getAllConsultations = catchAsync(async (req, res) => {

  const result = await ConsultationService.getAllConsultations(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Consultations retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
}); 


const singleConsultation = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ConsultationService.singleConsultation(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Consultation retrieved successfully',
        data: result,
    });
});

export const ConsultationController = {
  createConsultation,
  getAllConsultations,
    singleConsultation,
}