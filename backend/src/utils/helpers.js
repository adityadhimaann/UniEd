import crypto from 'crypto';

export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const getPagination = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  const validPage = parsedPage > 0 ? parsedPage : 1;
  const validLimit = parsedLimit > 0 && parsedLimit <= 100 ? parsedLimit : 10;

  const skip = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    skip,
  };
};

export const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.__v;
  
  // firstName, lastName, and avatar are now at top level (not in profile)
  return {
    _id: userObj._id,
    email: userObj.email,
    role: userObj.role,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim(),
    avatar: userObj.avatar,
    profilePicture: userObj.avatar,
    phone: userObj.profile?.phone,
    dateOfBirth: userObj.profile?.dateOfBirth,
    address: userObj.profile?.address,
    studentId: userObj.academicInfo?.studentId,
    employeeId: userObj.academicInfo?.employeeId,
    department: userObj.academicInfo?.department,
    semester: userObj.academicInfo?.semester,
    batch: userObj.academicInfo?.batch,
    isVerified: userObj.isVerified,
    isActive: userObj.isActive,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
  };
};

export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const calculateAttendancePercentage = (presentCount, totalClasses) => {
  if (totalClasses === 0) return 0;
  return Math.round((presentCount / totalClasses) * 100);
};

export const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
