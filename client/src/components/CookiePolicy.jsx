import React from 'react';
import LegalPage from './LegalPage';

const CookiePolicy = () => {
  return (
    <LegalPage title="Cookie Policy">
      <p><strong>Effective Date: August 30, 2025</strong></p>

      <h2>1. Introduction</h2>
      <p>
        This Cookie Policy explains how Low·sAI ("we," "our," or "us") uses cookies and similar technologies when you visit our website or use our memory palace application (collectively, the "Service"). This policy should be read alongside our Privacy Policy and Terms of Service.
      </p>

      <h2>2. What Are Cookies?</h2>
      <p>
        Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They help websites remember information about your visit, such as your preferred language and other settings, which can make your next visit easier and the site more useful to you.
      </p>

      <h2>3. How We Use Cookies</h2>
      <p>We use cookies for several purposes:</p>

      <h3>3.1 Essential Cookies</h3>
      <p>These cookies are necessary for the Service to function properly and cannot be disabled.</p>

      <p><strong>Purpose:</strong></p>
      <ul>
        <li>Maintain your session and authentication status</li>
        <li>Protect against cross-site request forgery (CSRF) attacks</li>
        <li>Ensure secure communication between your browser and our servers</li>
      </ul>

      <p><strong>Examples:</strong></p>
      <ul>
        <li>Session cookies for user authentication</li>
        <li>CSRF tokens for security</li>
        <li>Load balancing cookies</li>
      </ul>

      <h3>3.2 Functional Cookies</h3>
      <p>These cookies enable enhanced functionality and personalization.</p>

      <p><strong>Purpose:</strong></p>
      <ul>
        <li>Remember your preferences and settings</li>
        <li>Store your room type and art style choices</li>
        <li>Maintain your language and display preferences</li>
        <li>Remember your demo mode status</li>
      </ul>

      <p><strong>Examples:</strong></p>
      <ul>
        <li>User preference cookies</li>
        <li>Local storage for memory palace data</li>
        <li>Interface customization settings</li>
      </ul>

      <h3>3.3 Analytics Cookies</h3>
      <p>These cookies help us understand how visitors interact with our Service.</p>

      <p><strong>Purpose:</strong></p>
      <ul>
        <li>Analyze website traffic and usage patterns</li>
        <li>Identify popular features and areas for improvement</li>
        <li>Measure the effectiveness of our content</li>
        <li>Understand user behavior and preferences</li>
      </ul>

      <p><strong>Examples:</strong></p>
      <ul>
        <li>Google Analytics cookies (if implemented)</li>
        <li>Custom analytics tracking</li>
        <li>Performance monitoring cookies</li>
      </ul>

      <h3>3.4 Performance Cookies</h3>
      <p>These cookies help us improve the performance of our Service.</p>

      <p><strong>Purpose:</strong></p>
      <ul>
        <li>Monitor page load times and performance</li>
        <li>Identify and resolve technical issues</li>
        <li>Optimize server response times</li>
        <li>Track error rates and debugging information</li>
      </ul>

      <h2>4. Types of Cookies We Use</h2>

      <h3>4.1 Session Cookies</h3>
      <ul>
        <li><strong>Duration:</strong> Temporary, deleted when you close your browser</li>
        <li><strong>Purpose:</strong> Maintain your session during your visit</li>
        <li><strong>Examples:</strong> Authentication tokens, CSRF protection</li>
      </ul>

      <h3>4.2 Persistent Cookies</h3>
      <ul>
        <li><strong>Duration:</strong> Remain on your device for a set period</li>
        <li><strong>Purpose:</strong> Remember your preferences across visits</li>
        <li><strong>Examples:</strong> Language settings, theme preferences</li>
      </ul>

      <h3>4.3 First-Party Cookies</h3>
      <ul>
        <li><strong>Source:</strong> Set directly by our website</li>
        <li><strong>Purpose:</strong> Essential functionality and user experience</li>
        <li><strong>Examples:</strong> Authentication, preferences, session management</li>
      </ul>

      <h3>4.4 Third-Party Cookies</h3>
      <ul>
        <li><strong>Source:</strong> Set by external services we use</li>
        <li><strong>Purpose:</strong> Analytics, monitoring, and external integrations</li>
        <li><strong>Examples:</strong> Google Analytics, error tracking services</li>
      </ul>

      <h2>5. Specific Cookies We Use</h2>

      <h3>5.1 Authentication Cookies</h3>
      <pre><code>Name: auth_token
Purpose: Maintain user authentication
Duration: Session
Type: Essential</code></pre>

      <pre><code>Name: csrf_token
Purpose: Protect against CSRF attacks
Duration: Session
Type: Essential</code></pre>

      <h3>5.2 Preference Cookies</h3>
      <pre><code>Name: room_preference
Purpose: Remember user's room type choice
Duration: 1 year
Type: Functional</code></pre>

      <pre><code>Name: art_style_preference
Purpose: Remember user's art style preference
Duration: 1 year
Type: Functional</code></pre>

      <pre><code>Name: demo_mode
Purpose: Track demo mode status
Duration: Session
Type: Functional</code></pre>

      <h3>5.3 Analytics Cookies (Future Implementation)</h3>
      <pre><code>Name: _ga
Purpose: Google Analytics tracking
Duration: 2 years
Type: Analytics</code></pre>

      <pre><code>Name: _gid
Purpose: Google Analytics session tracking
Duration: 24 hours
Type: Analytics</code></pre>

      <h2>6. Local Storage and Similar Technologies</h2>

      <h3>6.1 Local Storage</h3>
      <p>We use browser local storage to store:</p>
      <ul>
        <li>Memory palace data and associations</li>
        <li>User-generated content</li>
        <li>Application state and preferences</li>
        <li>Temporary data for offline functionality</li>
      </ul>

      <h3>6.2 Session Storage</h3>
      <p>We use session storage for:</p>
      <ul>
        <li>Temporary session data</li>
        <li>Form data during multi-step processes</li>
        <li>Temporary user preferences</li>
      </ul>

      <h2>7. Managing Your Cookie Preferences</h2>

      <h3>7.1 Browser Settings</h3>
      <p>You can control cookies through your browser settings:</p>

      <p><strong>Chrome:</strong></p>
      <ol>
        <li>Go to Settings &gt; Privacy and security &gt; Cookies and other site data</li>
        <li>Choose your preferred cookie settings</li>
      </ol>

      <p><strong>Firefox:</strong></p>
      <ol>
        <li>Go to Options &gt; Privacy &amp; Security</li>
        <li>Under Cookies and Site Data, choose your settings</li>
      </ol>

      <p><strong>Safari:</strong></p>
      <ol>
        <li>Go to Preferences &gt; Privacy</li>
        <li>Choose your cookie preferences</li>
      </ol>

      <p><strong>Edge:</strong></p>
      <ol>
        <li>Go to Settings &gt; Cookies and site permissions</li>
        <li>Manage your cookie preferences</li>
      </ol>

      <h3>7.2 Our Cookie Consent Banner</h3>
      <p>When you first visit our Service, you'll see a cookie consent banner that allows you to:</p>
      <ul>
        <li>Accept all cookies</li>
        <li>Accept only essential cookies</li>
        <li>Customize your cookie preferences</li>
        <li>Learn more about our cookie usage</li>
      </ul>

      <h3>7.3 Third-Party Opt-Out Tools</h3>
      <p>For third-party cookies, you can use opt-out tools:</p>
      <ul>
        <li>Google Analytics Opt-out Browser Add-on</li>
        <li>Digital Advertising Alliance Opt-out Tool</li>
        <li>Network Advertising Initiative Opt-out Tool</li>
      </ul>

      <h2>8. Impact of Disabling Cookies</h2>

      <h3>8.1 Essential Cookies</h3>
      <p>If you disable essential cookies:</p>
      <ul>
        <li>You may not be able to log in to your account</li>
        <li>Some security features may not work properly</li>
        <li>The Service may not function correctly</li>
      </ul>

      <h3>8.2 Functional Cookies</h3>
      <p>If you disable functional cookies:</p>
      <ul>
        <li>Your preferences may not be remembered</li>
        <li>You may need to re-enter information</li>
        <li>Some features may not work as expected</li>
      </ul>

      <h3>8.3 Analytics Cookies</h3>
      <p>If you disable analytics cookies:</p>
      <ul>
        <li>We won't be able to improve the Service based on usage data</li>
        <li>You may still see some basic analytics</li>
        <li>Your experience won't be affected</li>
      </ul>

      <h2>9. Updates to This Cookie Policy</h2>

      <h3>9.1 Policy Changes</h3>
      <p>We may update this Cookie Policy from time to time to reflect:</p>
      <ul>
        <li>Changes in our cookie usage</li>
        <li>New technologies or services</li>
        <li>Legal or regulatory requirements</li>
        <li>User feedback and preferences</li>
      </ul>

      <h3>9.2 Notification of Changes</h3>
      <p>We will notify you of significant changes by:</p>
      <ul>
        <li>Updating the "Last Updated" date</li>
        <li>Posting a notice on our website</li>
        <li>Sending email notifications (if applicable)</li>
      </ul>

      <h2>10. International Considerations</h2>

      <h3>10.1 GDPR Compliance</h3>
      <p>For users in the European Union:</p>
      <ul>
        <li>We obtain explicit consent before setting non-essential cookies</li>
        <li>You have the right to withdraw consent at any time</li>
        <li>We provide clear information about cookie purposes and duration</li>
      </ul>

      <h3>10.2 CCPA Compliance</h3>
      <p>For California residents:</p>
      <ul>
        <li>You have the right to opt out of the sale of personal information</li>
        <li>We provide clear information about data collection and use</li>
        <li>You can request deletion of your personal information</li>
      </ul>

      <h2>11. Contact Information</h2>
      <p>If you have questions about our use of cookies or this Cookie Policy, please contact us:</p>

      <p><strong>Low·sAI Privacy Team</strong></p>
      <ul>
        <li>Email: [privacy@lowsai.com]</li>
        <li>Address: [Your Business Address]</li>
        <li>Website: [www.lowsai.com]</li>
      </ul>

      <h3>11.1 Cookie-Specific Inquiries</h3>
      <p>For questions specifically about cookies, you can also contact us at [cookies@lowsai.com].</p>

      <h2>12. Additional Resources</h2>

      <h3>12.1 Learn More About Cookies</h3>
      <ul>
        <li><a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer">All About Cookies</a></li>
        <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
        <li><a href="https://www.networkadvertising.org/" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a></li>
      </ul>

      <h3>12.2 Browser-Specific Information</h3>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome Cookie Settings</a></li>
        <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Firefox Cookie Settings</a></li>
        <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari Cookie Settings</a></li>
      </ul>

      <hr />

      <p><strong>Last Updated: August 30, 2025</strong></p>
    </LegalPage>
  );
};

export default CookiePolicy;
