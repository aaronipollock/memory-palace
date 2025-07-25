const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  // For development, you can use a service like Mailtrap or Gmail
  // For production, consider using a service like SendGrid, Mailgun, or AWS SES

  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development email configuration (using Gmail with app password)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password',
      },
    });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback, email, timestamp, userAgent, url } = req.body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Rating is required and must be between 1 and 5',
      });
    }

    // Create email content
    const emailContent = `
New Feedback Received

Rating: ${rating}/5 stars
Timestamp: ${timestamp}
URL: ${url}
User Agent: ${userAgent}

${email ? `Contact Email: ${email}` : 'No contact email provided'}

Feedback:
${feedback || 'No additional feedback provided'}

---
This feedback was submitted from the Low·sAI Memory Palace application.
    `;

    // Send email
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: process.env.FEEDBACK_EMAIL || process.env.EMAIL_USER || 'your-email@gmail.com',
      subject: `Low·sAI Feedback - ${rating}/5 stars`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
    });

    // Log feedback for analytics (optional)
    console.log('Feedback received:', {
      rating,
      hasFeedback: !!feedback,
      hasEmail: !!email,
      timestamp,
      url,
    });

    res.status(200).json({
      message: 'Feedback submitted successfully',
    });

  } catch (error) {
    console.error('Feedback submission error:', error);

    // In development, still return success even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Email not sent, but feedback logged');
      return res.status(200).json({
        message: 'Feedback submitted successfully (development mode)',
      });
    }

    res.status(500).json({
      error: 'Failed to submit feedback. Please try again later.',
    });
  }
};

module.exports = {
  submitFeedback,
};
