import './StaticPages.css'

export default function TermsAndConditions() {
  return (
    <div className="static-page">
      <div className="page-hero">
        <div className="container">
          <h1>Terms & <span className="text-orange">Conditions</span></h1>
          <p>Last Updated: October 2026</p>
        </div>
      </div>

      <div className="container section">
        <div className="static-text" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>By creating an account or using Bammaz2k26, you agree to follow these Terms & Conditions.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>1. Use of the Platform</h2>
          <p>Bammaz2k26 is provided to help students discover, register for, and participate in college events.</p>
          <p>Users must provide accurate information when creating accounts or registering for events.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>2. User Accounts</h2>
          <p>Users are responsible for:</p>
          <ul style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Providing accurate registration information</li>
            <li>Keeping their login credentials secure</li>
            <li>Not sharing their account with others</li>
            <li>Not impersonating another student</li>
            <li>Not attempting to access another user's account</li>
          </ul>
          <p>Bammaz2k26 may restrict or suspend accounts involved in misuse, fraud, or unauthorized activity.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>3. Event Registration</h2>
          <p>Registering for an event does not automatically guarantee participation if the event has limited capacity or requires additional verification.</p>
          <p>Event-specific rules, eligibility requirements, deadlines, fees, and participation conditions may apply.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>4. Registration Fees and Refunds</h2>
          <p>Some events may require a registration fee.</p>
          <p>Refund eligibility, cancellation policies, and deadlines may vary by event and will be communicated by the respective event organizer.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>5. User Content</h2>
          <p>Users must not upload or submit content that:</p>
          <ul style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Violates applicable laws</li>
            <li>Infringes intellectual property rights</li>
            <li>Contains malicious software</li>
            <li>Is abusive, threatening, or fraudulent</li>
            <li>Attempts to manipulate or disrupt the platform</li>
          </ul>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>6. Event Information</h2>
          <p>Event details are provided by authorized organizers.</p>
          <p>Dates, timings, venues, fees, prizes, eligibility requirements, and other event information may change. Organizers are responsible for maintaining accurate event information.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>7. Prohibited Activities</h2>
          <p>Users must not attempt to:</p>
          <ul style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Hack or disrupt Bammaz2k26</li>
            <li>Circumvent authentication or security mechanisms</li>
            <li>Access unauthorized data</li>
            <li>Submit fraudulent registrations</li>
            <li>Create accounts using another person's identity</li>
            <li>Abuse APIs or automated systems</li>
            <li>Introduce malicious code into the platform</li>
          </ul>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>8. Platform Availability</h2>
          <p>We aim to keep Bammaz2k26 available and reliable, but temporary interruptions may occur because of maintenance, technical problems, hosting issues, or circumstances outside our control.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>9. Intellectual Property</h2>
          <p>The Bammaz2k26 platform, including its branding, design, software, graphics, and original content, belongs to the respective owners or licensors unless otherwise stated.</p>
          <p>Event organizers and users retain ownership of content they independently create and submit, subject to the permissions necessary to operate the platform.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>10. Account Termination</h2>
          <p>Bammaz2k26 administrators may suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or pose a security risk to the platform or its users.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>11. Changes to These Terms</h2>
          <p>These Terms may be updated when necessary. Continued use of Bammaz2k26 after an update constitutes acceptance of the revised Terms, subject to applicable law.</p>

          <h2 style={{ color: '#fff', marginTop: '1rem' }}>12. Contact</h2>
          <p>For questions, complaints, or concerns regarding these Terms, users may contact the Bammaz2k26 administration team through the official contact details provided on the website.</p>
        </div>
      </div>
    </div>
  )
}
