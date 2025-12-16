import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      console.log('✉️  Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
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
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.profile.firstName},</p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to UniEd!</h2>
        <p>Hello ${user.profile.firstName},</p>
        <p>Your account has been successfully created and verified.</p>
        <p>You can now log in and start using all the features of UniEd.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Go to Login
        </a>
        <p>Best regards,<br>UniEd Team</p>
      </div>
    `;

    return this.sendEmail(user.email, 'Welcome to UniEd!', html);
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
}

export default new EmailService();
