import asyncHandler from '../utils/asyncHandler.js';
import emailService from '../services/emailService.js';

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email is required' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email format' 
    });
  }

  try {
    // Send notification to admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Newsletter Subscription</h2>
        <p>A new user has subscribed to the newsletter:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Best regards,<br>UniEd System</p>
      </div>
    `;

    await emailService.sendEmail(
      'dhimanaditya56@gmail.com',
      'New Newsletter Subscription - UniEd',
      adminHtml
    );

    // Send thank you email to subscriber
    const subscriberHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">UniEd</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Thank You for Subscribing! 🎉</h2>
          <p style="color: white; margin: 0; font-size: 16px;">You're now part of the UniEd community</p>
        </div>

        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            Welcome aboard! We're excited to have you as part of our community.
          </p>
          <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
            You'll now receive:
          </p>
          <ul style="color: #374151; font-size: 15px; line-height: 1.8;">
            <li>Latest updates about UniEd features</li>
            <li>Educational tips and resources</li>
            <li>Exclusive announcements and offers</li>
            <li>Platform updates and improvements</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" 
             style="display: inline-block; padding: 14px 32px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Visit UniEd
          </a>
        </div>

        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            If you have any questions, feel free to reach out to us.
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

    await emailService.sendEmail(
      email,
      'Thank You for Subscribing to UniEd Newsletter! 🎉',
      subscriberHtml
    );

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter! Check your email for confirmation.',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter. Please try again later.',
    });
  }
});
