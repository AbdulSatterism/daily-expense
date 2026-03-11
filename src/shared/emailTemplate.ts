import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #f9f9f9; font-size: 24px; margin-bottom: 20px;">Hi ${values.name},</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #FB9400; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 20 minutes.</p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #FB9400; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 20 minutes.</p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};


interface Iconsultation{
  name: string,
  admin_email: string,
  email: string,
  phone: string,
  appointment_date: string,
  appointment_time: string
}

const consultation = (values: Iconsultation) => {
  const data = {
    to: values.admin_email,
    subject: 'Consultation Details',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        
        <!-- Heading -->
        <h2 style="color: #090A58; font-size: 24px; margin: 0 0 10px 0; text-align: center;">New Consultation Request</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center; margin-bottom: 30px;">
            A client has booked a consultation. Details are below.
        </p>

        <!-- Consultation details card -->
        <div style="background-color: #f4f4f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 10px 0; font-size: 16px; color: #333;">
                <strong style="color: #090A58; min-width: 140px; display: inline-block;">Name:</strong> ${values.name}
            </p>
            <p style="margin: 10px 0; font-size: 16px; color: #333;">
                <strong style="color: #090A58; min-width: 140px; display: inline-block;">Email:</strong> ${values.email}
            </p>
            <p style="margin: 10px 0; font-size: 16px; color: #333;">
                <strong style="color: #090A58; min-width: 140px; display: inline-block;">Phone:</strong> ${values.phone}
            </p>
           
            <p style="margin: 10px 0; font-size: 16px; color: #333;">
                <strong style="color: #090A58; min-width: 140px; display: inline-block;">Appointment Date:</strong> ${values.appointment_date}
            </p>
            <p style="margin: 10px 0; font-size: 16px; color: #333;">
                <strong style="color: #090A58; min-width: 140px; display: inline-block;">Appointment Time:</strong> ${values.appointment_time}
            </p>
        </div>

        <!-- Simple footer note -->
        <p style="color: #777; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">
            This request was submitted via the consultation booking form.
        </p>
        <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 20px 0 0 0; text-align: center;">
            © 2026 Your Company Name. All rights reserved.
        </p>
    </div>
</body>`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  consultation
};
