# Feedback System Setup Guide

## Overview
The feedback system sends user feedback directly to your email address. It's configured to work in both development and production environments.

## Email Configuration

### Development Setup (Gmail)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Set Environment Variables**:
   ```bash
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### Production Setup
For production, you can use:
- **Gmail** (same as development)
- **SendGrid** (recommended for high volume)
- **Mailgun**
- **AWS SES**

Set these environment variables:
```bash
EMAIL_SERVICE=gmail  # or 'sendgrid', 'mailgun', etc.
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password-or-api-key
FEEDBACK_EMAIL=feedback@yourdomain.com  # Optional: separate email for feedback
```

## Features

### Frontend Component
- **Floating feedback button** in bottom-right corner
- **Modal with rating system** (1-5 stars)
- **Optional text feedback** (max 2000 characters)
- **Optional email contact** for follow-up
- **Accessibility features**: keyboard navigation, screen reader support
- **Mobile responsive**

### Backend API
- **POST /api/feedback** - Submit feedback
- **Email validation** and sanitization
- **Rate limiting** (inherited from security middleware)
- **CSRF protection** (exempt for public feedback)
- **Input validation** and XSS protection

## Email Format
Feedback emails include:
- Rating (1-5 stars)
- User feedback text
- Contact email (if provided)
- Timestamp
- User agent (browser info)
- Page URL where feedback was submitted

## Testing
1. **Development mode**: Emails are logged to console even if email fails
2. **Production mode**: Proper error handling with user feedback
3. **Validation**: All inputs are validated and sanitized

## Customization
- **Email template**: Modify `feedbackController.js` to change email format
- **Validation rules**: Update `validation.js` for different requirements
- **UI styling**: Modify `FeedbackButton.js` component
- **Button position**: Change CSS classes in the floating button

## Security Notes
- Feedback endpoint is **public** (no authentication required)
- **Rate limiting** prevents spam
- **Input validation** prevents malicious content
- **XSS protection** sanitizes all inputs
- **Email validation** ensures valid contact information

## Troubleshooting
- **Email not sending**: Check environment variables and email service credentials
- **Modal not opening**: Check browser console for JavaScript errors
- **Validation errors**: Review input requirements in validation middleware
