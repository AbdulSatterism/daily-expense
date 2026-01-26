export type IVerifyEmail = {
  email: string;
  one_time_code: number;
};

export type ILoginData = {
  email: string;
  password: string;
};

export type IAuthResetPassword = {
  new_password: string;
};

export type IChangePassword = {
  current_password: string;
  new_password: string;
};
