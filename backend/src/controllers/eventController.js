const { query } = require('../../db/db');

// ---------------------------------------------------------------------------
// Helper: format a DB event row into the standard API event object
// ---------------------------------------------------------------------------
const formatEvent = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  date: row.date,        // already formatted as YYYY-MM-DD via to_char in SQL
  startTime: row.start_time,  // formatted as HH:mm via to_char
  endTime: row.end_time,
  registrationFee: row.registration_fee,
  teamSize: row.team_size,
  prizePool: row.prize_pool,
  posterUrl: row.poster_url ?? null,
  organizerId: row.organizer_id,
});

// Base SELECT used by all event queries
const EVENT_SELECT = `
  SELECT id, name, description,
         to_char(date, 'YYYY-MM-DD')    AS date,
         to_char(start_time, 'HH24:MI') AS start_time,
         to_char(end_time,   'HH24:MI') AS end_time,
         registration_fee, team_size, prize_pool, poster_url, organizer_id
  FROM events
`;

// ---------------------------------------------------------------------------
// Validation helper for create / update
// ---------------------------------------------------------------------------
const validateEventBody = (body) => {
  const { name, description, date, startTime, endTime, registrationFee, teamSize, prizePool, posterUrl } = body;
  const errors = {};

  if (!name || name.length < 1 || name.length > 150)
    errors.name = 'Name must be 1–150 characters';
  if (!description || description.length < 1 || description.length > 5000)
    errors.description = 'Description must be 1–5000 characters';
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date)))
    errors.date = 'Date must be a valid YYYY-MM-DD date';
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime))
    errors.startTime = 'Start time must be a valid HH:mm time';
  if (!endTime || !/^\d{2}:\d{2}$/.test(endTime))
    errors.endTime = 'End time must be a valid HH:mm time';
  if (!errors.startTime && !errors.endTime && endTime <= startTime)
    errors.endTime = 'End time must be after start time';
  if (registrationFee === undefined || !Number.isInteger(Number(registrationFee)) || Number(registrationFee) < 0)
    errors.registrationFee = 'Registration fee must be a non-negative integer';
  if (!teamSize || !Number.isInteger(Number(teamSize)) || Number(teamSize) < 1)
    errors.teamSize = 'Team size must be an integer >= 1';
  if (prizePool === undefined || !Number.isInteger(Number(prizePool)) || Number(prizePool) < 0)
    errors.prizePool = 'Prize pool must be a non-negative integer';
  if (posterUrl && posterUrl !== null && !/^https?:\/\/.+/.test(posterUrl))
    errors.posterUrl = 'Poster URL must be a valid http(s) URL';

  return errors;
};

// ---------------------------------------------------------------------------
// GET /api/events
// ---------------------------------------------------------------------------
const getAllEvents = async (req, res, next) => {
  try {
    const result = await query(`${EVENT_SELECT} ORDER BY date, start_time`);
    return res.status(200).json({ success: true, events: result.rows.map(formatEvent) });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/events/mine  (organizer only)
// ---------------------------------------------------------------------------
const getMyEvents = async (req, res, next) => {
  try {
    const result = await query(
      `${EVENT_SELECT} WHERE organizer_id = $1 ORDER BY date, start_time`,
      [req.user.id]
    );
    return res.status(200).json({ success: true, events: result.rows.map(formatEvent) });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/events/:eventId
// ---------------------------------------------------------------------------
const getEventById = async (req, res, next) => {
  try {
    const result = await query(`${EVENT_SELECT} WHERE id = $1`, [req.params.eventId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    return res.status(200).json({ success: true, event: formatEvent(result.rows[0]) });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/events  (organizer only)
// ---------------------------------------------------------------------------
const createEvent = async (req, res, next) => {
  try {
    const errors = validateEventBody(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const { name, description, date, startTime, endTime, registrationFee, teamSize, prizePool, posterUrl } = req.body;

    const result = await query(
      `INSERT INTO events (name, description, date, start_time, end_time, registration_fee, team_size, prize_pool, poster_url, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, description,
                 to_char(date, 'YYYY-MM-DD')    AS date,
                 to_char(start_time, 'HH24:MI') AS start_time,
                 to_char(end_time,   'HH24:MI') AS end_time,
                 registration_fee, team_size, prize_pool, poster_url, organizer_id`,
      [name, description, date, startTime, endTime, Number(registrationFee), Number(teamSize), Number(prizePool), posterUrl || null, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: formatEvent(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// PUT /api/events/:eventId  (organizer, must own)
// ---------------------------------------------------------------------------
const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Check event exists + ownership
    const existing = await query(`SELECT organizer_id FROM events WHERE id = $1`, [eventId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (existing.rows[0].organizer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to manage this event' });
    }

    const errors = validateEventBody(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const { name, description, date, startTime, endTime, registrationFee, teamSize, prizePool, posterUrl } = req.body;

    const result = await query(
      `UPDATE events
       SET name=$1, description=$2, date=$3, start_time=$4, end_time=$5,
           registration_fee=$6, team_size=$7, prize_pool=$8, poster_url=$9
       WHERE id=$10
       RETURNING id, name, description,
                 to_char(date, 'YYYY-MM-DD')    AS date,
                 to_char(start_time, 'HH24:MI') AS start_time,
                 to_char(end_time,   'HH24:MI') AS end_time,
                 registration_fee, team_size, prize_pool, poster_url, organizer_id`,
      [name, description, date, startTime, endTime, Number(registrationFee), Number(teamSize), Number(prizePool), posterUrl || null, eventId]
    );

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: formatEvent(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/events/:eventId  (organizer, must own)
// ---------------------------------------------------------------------------
const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const existing = await query(`SELECT organizer_id FROM events WHERE id = $1`, [eventId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (existing.rows[0].organizer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to manage this event' });
    }

    // Registrations deleted by ON DELETE CASCADE
    await query(`DELETE FROM events WHERE id = $1`, [eventId]);

    return res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEvents, getMyEvents, getEventById, createEvent, updateEvent, deleteEvent };
