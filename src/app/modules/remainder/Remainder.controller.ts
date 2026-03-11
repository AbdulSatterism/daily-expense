import catchAsync from "@/shared/catchAsync";
import { ReminderService } from "./Remainder.service";
import sendResponse from "@/shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createReminder = catchAsync(async (req, res) => {


  const result = await ReminderService.createReminder(req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reminder created successfully',
    data: result,
  });
});


const getAllReminders = catchAsync(async (req, res) => {

  const filter = req.query.filter as string || 'all';

  const result = await ReminderService.getAllReminders(req.user.id, filter);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reminders retrieved successfully',
    data: result,
  });
});

const getReminderAndMakePaid = catchAsync(async (req, res) => {

  const result = await ReminderService.getReminderAndMakePaid(req.user.id, req.params.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reminder retrieved successfully',
    data: result,
  });
});


const reminderReports = catchAsync(async (req, res) => {

  const result = await ReminderService.reminderReports(req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reminder reports retrieved successfully',
    data: result,
    meta: result.meta,
  });
});




export const ReminderController = {
  createReminder,
  getAllReminders,
  getReminderAndMakePaid,
  reminderReports,
};