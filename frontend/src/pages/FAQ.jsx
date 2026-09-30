import { useState } from 'react'
import './StaticPages.css'

const FAQS = [
  { q: 'Who can participate in Bammaz 2K26?', a: 'Any student from any college can register and participate. Simply create an account and register for the events you are interested in.' },
  { q: 'How do I register for events?', a: 'Sign up for an account, browse the events page, click on an event you like, and click "Register Now". Fill in the registration form and submit.' },
  { q: 'Can I register as a team?', a: 'Yes! Many events support team participation. When registering, one member registers as the team lead and adds other members\' names and roll numbers.' },
  { q: 'What is the registration fee?', a: 'Fees vary per event. Some events are free, others have a nominal fee. The fee is clearly shown on the event details page before you register.' },
  { q: 'How will I receive my registration ID?', a: 'Your registration ID is shown immediately after successful registration and is also available in the "My Registrations" section of your student dashboard.' },
  { q: 'Can I register for multiple events?', a: 'Yes, you can register for as many events as you like. Each registration will have its own unique registration ID.' },
  { q: 'Is online payment available?', a: 'Online payments are not available in the current version. Please contact the organizers directly for payment details.' },
  { q: 'How are organizer accounts created?', a: 'Organizer accounts are created by the event team internally. There is no public signup for organizers.' },
]

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item card ${open ? 'faq-item--open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-item__q">
        <span>{faq.q}</span>
        <span className="faq-item__arrow">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="faq-item__a">{faq.a}</div>}
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="static-page">
      <div className="page-hero">
        <div className="container">
          <div className="badge badge-orange" style={{ justifyContent: 'center', marginBottom: 16 }}>FAQ</div>
          <h1>Frequently Asked <span className="text-orange">Questions</span></h1>
          <p>Everything you need to know about Bammaz 2K26</p>
        </div>
      </div>

      <div className="container section">
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
        </div>
      </div>
    </div>
  )
}
