const router = require('express').Router();
const {
  getAllEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const {
  registerForEvent,
  getEventRegistrations,
} = require('../controllers/registrationController');
const { authenticate, requireRole } = require('../middleware/auth');

// IMPORTANT: /mine must be registered before /:eventId
// otherwise Express treats "mine" as an event ID.
router.get('/mine', authenticate, requireRole('organizer'), getMyEvents);

router.get('/', getAllEvents);
router.get('/:eventId', getEventById);
router.post('/', authenticate, requireRole('organizer'), createEvent);
router.put('/:eventId', authenticate, requireRole('organizer'), updateEvent);
router.delete('/:eventId', authenticate, requireRole('organizer'), deleteEvent);

// Registration sub-routes
router.post('/:eventId/register', authenticate, requireRole('student'), registerForEvent);
router.get('/:eventId/registrations', authenticate, requireRole('organizer'), getEventRegistrations);

module.exports = router;
