/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/util/db";
import { ICapitalApplication } from "./Guest.interface";
import config from "@/config";
import bcrypt from "bcryptjs";
import { emailTemplate } from "@/shared/emailTemplate";
import { emailHelper } from "@/helpers/emailHelper";


const createGuestCapitalApplication = async (payload: ICapitalApplication) => {
  
  const result = await prisma.capitalApplication.create({
    data: payload,
  });


  return result;
};

const allApplications = async (query: Record<string, unknown>) => { 
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;
    
    const [result, total] = await Promise.all([
        prisma.capitalApplication.findMany({
            skip,
            take: limit,
            orderBy: {
                created_at: 'desc',
            },
        }),
        prisma.capitalApplication.count(),
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
}


const approvedGuestAndCreateUser = async (id: string) => {
  const application = await prisma.capitalApplication.findUnique({
    where: { id },
  });

  if (!application) {
    throw new Error('Application not found');
  }

// Hash password
  const hashedPassword = await bcrypt.hash(
    config.user.default_password as string,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await prisma.user.create({
    data: {
      name: application.name,
      email: application.email,
      phone: application.phone,
      is_verified: true,
      password: hashedPassword,
      role: 'USER',
    },
  });

    // update application status to approved
    await prisma.capitalApplication.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // send email to the user with the login credentials

     // send email verification
      const approvedGuestTemplate = emailTemplate.approvedGuest({
        name: result?.name || 'User',
        email: result?.email || 'User',
        password: config.user.default_password as string,
      });
    
      await emailHelper.sendEmail(approvedGuestTemplate);
    

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = result;
    return userWithoutPassword;
};


const rejectGuest = async (id: string) => {
  const application = await prisma.capitalApplication.findUnique({
    where: { id },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  if (application.status === 'APPROVED') {
    throw new Error('Cannot reject an approved application');
  }


    // update application status to rejected
   const result = await prisma.capitalApplication.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return result;
    
};

// get single application 

const singleApplication= async(id:string)=>{
    const result = await prisma.capitalApplication.findUnique({ 
        where: {
            id
        }
    });
    return result;
}


export const GuestService = {
  createGuestCapitalApplication,
    allApplications,
    singleApplication,
    approvedGuestAndCreateUser
    ,rejectGuest
};