import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    console.log('📧 Initializing Email Service...');
    console.log('📧 Email Host:', process.env.EMAIL_HOST);
    console.log('📧 Email Port:', process.env.EMAIL_PORT);
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('📧 Email From:', process.env.EMAIL_FROM);
    
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email service verification failed:', error);
      } else {
        console.log('✅ Email service is ready to send messages');
      }
    });
  }

  async sendEmail(to, subject, html, retries = 2) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log('\n' + '='.repeat(60));
        console.log(`📧 SENDING EMAIL (Attempt ${attempt}/${retries})`);
        console.log('='.repeat(60));
        console.log(`📧 To: ${to}`);
        console.log(`📧 Subject: ${subject}`);
        console.log(`📧 From: ${process.env.EMAIL_FROM}`);
        console.log('='.repeat(60));
        
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to,
          subject,
          html,
        };

        const info = await this.transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📧 Response:', info.response);
        console.log('='.repeat(60) + '\n');
        
        return info;
      } catch (error) {
        lastError = error;
        console.error('\n' + '='.repeat(60));
        console.error(`❌ EMAIL SENDING FAILED (Attempt ${attempt}/${retries})`);
        console.error('='.repeat(60));
        console.error('❌ Error Message:', error.message);
        console.error('❌ Error Code:', error.code);
        console.error('='.repeat(60) + '\n');
        
        // If not the last attempt, wait before retrying
        if (attempt < retries) {
          const waitTime = 2000 * attempt; // 2s, 4s
          console.log(`⏳ Retrying in ${waitTime/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // All retries failed
    throw lastError;
  }

  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to UniEd!</h2>
        <p>Hello ${user.profile.firstName},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>UniEd Team</p>
      </div>
    `;

    return this.sendEmail(user.email, 'Verify Your Email - UniEd', html);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const firstName = user.firstName || user.profile?.firstName || 'User';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>UniEd Team</p>
      </div>
    `;

    return this.sendEmail(user.email, 'Password Reset - UniEd', html);
  }

  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">UniEd</h1>
          <p style="color: #6b7280; margin: 5px 0;">Unified Education Platform</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Welcome to UniEd! 🎉</h2>
          <p style="color: white; margin: 0; font-size: 16px;">Your educational journey starts here</p>
        </div>

        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Hello <strong>${user.firstName}</strong>,
          </p>
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Thank you for joining UniEd! Your account has been successfully created.
          </p>
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            You now have access to:
          </p>
          <ul style="color: #374151; font-size: 15px; line-height: 1.8;">
            <li>Unified dashboard for all your courses</li>
            <li>Real-time collaboration with peers and faculty</li>
            <li>Assignment management and tracking</li>
            <li>Grade analytics and performance insights</li>
            <li>Attendance tracking and reports</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="display: inline-block; padding: 14px 32px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Get Started
          </a>
        </div>

        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Need help? Contact our support team anytime.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Best regards,<br>
            <strong style="color: #4F46E5;">The UniEd Team</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} UniEd. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, 'Welcome to UniEd! 🎉', html);
  }

  async sendAssignmentNotification(user, assignment, course) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Assignment Posted</h2>
        <p>Hello ${user.profile.firstName},</p>
        <p>A new assignment has been posted in <strong>${course.courseName}</strong>:</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px 0;">${assignment.title}</h3>
          <p style="margin: 0; color: #666;">${assignment.description}</p>
          <p style="margin: 8px 0 0 0;"><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleString()}</p>
          <p style="margin: 4px 0 0 0;"><strong>Total Marks:</strong> ${assignment.totalMarks}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/assignments/${assignment._id}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">
          View Assignment
        </a>
        <p>Best regards,<br>UniEd Team</p>
      </div>
    `;

    return this.sendEmail(user.email, `New Assignment: ${assignment.title}`, html);
  }

  async sendGradeNotification(user, grade, course) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Grade Published</h2>
        <p>Hello ${user.profile.firstName},</p>
        <p>Your grade for <strong>${course.courseName}</strong> has been published:</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Grade:</strong> ${grade.grade}</p>
          <p style="margin: 4px 0 0 0;"><strong>GPA:</strong> ${grade.gpa}</p>
          <p style="margin: 4px 0 0 0;"><strong>Percentage:</strong> ${grade.percentage.toFixed(2)}%</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/grades" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">
          View Details
        </a>
        <p>Best regards,<br>UniEd Team</p>
      </div>
    `;

    return this.sendEmail(user.email, `Grade Published - ${course.courseName}`, html);
  }

  async sendAnnouncementEmail(user, announcement) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Announcement</h2>
        <p>Hello ${user.profile.firstName},</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px 0; color: ${announcement.priority === 'high' ? '#DC2626' : announcement.priority === 'medium' ? '#F59E0B' : '#10B981'};">
            ${announcement.title}
          </h3>
          <p style="margin: 0; color: #666;">${announcement.content}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/announcements" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">
          View All Announcements
        </a>
        <p>Best regards,<br>UniEd Team</p>
      </div>
    `;

    return this.sendEmail(user.email, `Announcement: ${announcement.title}`, html);
  }

  async sendEnrollmentApprovalEmail(student, course, faculty) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">UniEd</h1>
          <p style="color: #6b7280; margin: 5px 0;">Unified Education Platform</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Enrollment Approved! 🎉</h2>
          <p style="color: white; margin: 0; font-size: 16px;">You're now enrolled in the course</p>
        </div>

        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Hello <strong>${student.firstName} ${student.lastName}</strong>,
          </p>
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Great news! Your enrollment request has been approved.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Course Details</h3>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Course Name:</strong> ${course.courseName}
            </p>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Course Code:</strong> ${course.courseCode}
            </p>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Credits:</strong> ${course.credits}
            </p>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Instructor:</strong> ${faculty.firstName} ${faculty.lastName}
            </p>
            ${course.description ? `
              <p style="margin: 8px 0; color: #6b7280; font-size: 14px;">
                ${course.description}
              </p>
            ` : ''}
          </div>

          <p style="margin: 15px 0 0 0; color: #374151; font-size: 16px;">
            You can now access:
          </p>
          <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 10px 0;">
            <li>Course materials and resources</li>
            <li>Assignments and submissions</li>
            <li>Virtual classroom sessions</li>
            <li>Grades and feedback</li>
            <li>Course announcements</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard/courses" 
             style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            View Course
          </a>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>📌 Next Steps:</strong><br>
            • Check the course dashboard for upcoming assignments<br>
            • Review the course syllabus and schedule<br>
            • Join the virtual classroom when sessions are scheduled<br>
            • Stay updated with course announcements
          </p>
        </div>

        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Need help? Contact your instructor or our support team.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Best regards,<br>
            <strong style="color: #4F46E5;">The UniEd Team</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} UniEd. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(
      student.email, 
      `✅ Enrollment Approved - ${course.courseName}`, 
      html
    );
  }

  async sendOTPEmail(email, otp) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">UniEd</h1>
          <p style="color: #6b7280; margin: 5px 0;">Unified Education Platform</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Email Verification</h2>
          <p style="color: white; margin: 0; font-size: 16px;">Your OTP code is ready</p>
        </div>

        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Hello,
          </p>
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Thank you for signing up with UniEd! To complete your registration, please use the following OTP code:
          </p>
          
          <div style="background-color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #4F46E5;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
              Your OTP Code
            </p>
            <h1 style="margin: 0; color: #4F46E5; font-size: 48px; letter-spacing: 8px; font-weight: bold;">
              ${otp}
            </h1>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ Important:</strong><br>
              • This OTP will expire in 10 minutes<br>
              • Do not share this code with anyone<br>
              • If you didn't request this, please ignore this email
            </p>
          </div>
        </div>

        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Need help? Contact our support team anytime.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Best regards,<br>
            <strong style="color: #4F46E5;">The UniEd Team</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} UniEd. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(email, 'Verify Your Email - UniEd OTP', html);
  }

  async sendPasswordResetOTP(email, otp) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">UniEd</h1>
          <p style="color: #6b7280; margin: 5px 0;">Unified Education Platform</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Password Reset Request</h2>
          <p style="color: white; margin: 0; font-size: 16px;">Your OTP code is ready</p>
        </div>

        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Hello,
          </p>
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            We received a request to reset your password. Please use the following OTP code:
          </p>
          
          <div style="background-color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #f59e0b;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
              Your OTP Code
            </p>
            <h1 style="margin: 0; color: #f59e0b; font-size: 48px; letter-spacing: 8px; font-weight: bold;">
              ${otp}
            </h1>
          </div>

          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              <strong>🔒 Security Notice:</strong><br>
              • This OTP will expire in 10 minutes<br>
              • Do not share this code with anyone<br>
              • If you didn't request this, please secure your account immediately
            </p>
          </div>
        </div>

        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Need help? Contact our support team anytime.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Best regards,<br>
            <strong style="color: #4F46E5;">The UniEd Team</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} UniEd. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(email, 'Password Reset OTP - UniEd', html);
  }

  async sendEnrollmentRejectionEmail(student, course, faculty, reason) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">UniEd</h1>
          <p style="color: #6b7280; margin: 5px 0;">Unified Education Platform</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Enrollment Request Update</h2>
          <p style="color: white; margin: 0; font-size: 16px;">Your enrollment request status</p>
        </div>

        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Hello <strong>${student.firstName} ${student.lastName}</strong>,
          </p>
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            We regret to inform you that your enrollment request for the following course has not been approved at this time.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Course Details</h3>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Course Name:</strong> ${course.courseName}
            </p>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Course Code:</strong> ${course.courseCode}
            </p>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Instructor:</strong> ${faculty.firstName} ${faculty.lastName}
            </p>
            ${reason ? `
              <div style="margin-top: 15px; padding: 12px; background-color: #fef2f2; border-radius: 6px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  <strong>Reason:</strong> ${reason}
                </p>
              </div>
            ` : ''}
          </div>

          <p style="margin: 15px 0 0 0; color: #374151; font-size: 16px;">
            You can:
          </p>
          <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 10px 0;">
            <li>Contact the instructor for more information</li>
            <li>Check if prerequisites need to be completed</li>
            <li>Explore other available courses</li>
            <li>Reapply in the next enrollment period</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard/courses" 
             style="display: inline-block; padding: 14px 32px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Browse Other Courses
          </a>
        </div>

        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Need help? Contact your instructor or our support team.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            Best regards,<br>
            <strong style="color: #4F46E5;">The UniEd Team</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} UniEd. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(
      student.email, 
      `Enrollment Request Update - ${course.courseName}`, 
      html
    );
  }
}

export default new EmailService();
