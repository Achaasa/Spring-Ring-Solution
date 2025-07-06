export const userSelectFields = {
  id: true,
  email: true,
  name: true,
  role: true,
  phoneNumber: true,
  createdAt: true,
  updatedAt: true,
  imageKey: true,
  imageUrl: true,
  status: true,
  changedPassword: true,
  delFlag: true,
  // password is excluded
} as const;
