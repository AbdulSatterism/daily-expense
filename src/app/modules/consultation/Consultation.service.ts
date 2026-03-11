import { prisma } from "@/util/db";
import { IConsultation } from "./Consultation.interface";
import { emailTemplate } from "@/shared/emailTemplate";
import { emailHelper } from "@/helpers/emailHelper";
import config from "@/config";


const createConsultation = async (payload: IConsultation) => {
  
  const result = await prisma.consultation.create({
    data: payload,
  });

// need to send email to admin and user about the consultation details

  // send email verification
  const accountEmailTemplate = emailTemplate.consultation({
    name: result?.name || 'Guest',
    admin_email: config.email.from || '',
    email: result.email,
    phone: result.phone,
    appointment_date: result.appointment_date.toISOString().split('T')[0],
    appointment_time: result.appointment_time,
  });

  await emailHelper.sendEmail(accountEmailTemplate);

  return result;
};

// all consultation for admin 
const getAllConsultations = async (query: Record<string, unknown>) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const [result, total] = await Promise.all([
        prisma.consultation.findMany({
            skip,
            take: limit,
            orderBy: {
                created_at: 'desc',
            },
        }),
        prisma.consultation.count(),
    ]);

    return {
        data: result,
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
    };
};


const singleConsultation= async(id:string)=>{
    const result = await prisma.consultation.findUnique({ 
        where: {
            id
        }
    });
    return result;
}



export const ConsultationService = {
  createConsultation,
    getAllConsultations,
    singleConsultation,
}

