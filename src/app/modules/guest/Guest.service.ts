import { prisma } from "@/util/db";
import { ICapitalApplication } from "./Guest.interface";


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
};