const { query } = require('../../db/db');

// ---------------------------------------------------------------------------
// Helper: format a DB registration row into the standard API shape
// ---------------------------------------------------------------------------
const formatRegistration = (row) => ({
  id: row.id,
  eventId: row.event_id,
  name: row.name,
  branch: row.branch,
  year: row.year,
  phoneNumber: row.phone_number,
  rollNumber: row.roll_number,
  section: row.section,
  teamName: row.team_name ?? null,
  teamMembers: row.team_members ?? [],
  registeredAt: row.registered_at,
  status: row.status,
});

// ---------------------------------------------------------------------------
// POST /api/events/:eventId/register  (student only)
// ---------------------------------------------------------------------------
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, branch, year, phoneNumber, rollNumber, section, teamName, teamMembers } = req.body;

    // --- Check event exists ---
    const eventResult = await query(
      `SELECT id, date, team_size FROM events WHERE id = $1`,
      [eventId]
    );
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // --- Check event date has not passed ---
    const eventDate = new Date(event.date);
    eventDate.setHours(23, 59, 59, 999); // end of event day
    if (new Date() > eventDate) {
      return res.status(400).json({ success: false, message: 'Registration is closed for this event' });
    }

    // --- Validation ---
    const errors = {};
    if (!name || name.length < 1 || name.length > 100) errors.name = 'Name must be 1–100 characters';
    if (!branch || branch.length < 1 || branch.length > 50) errors.branch = 'Branch must be 1–50 characters';
    if (!year || !Number.isInteger(Number(year)) || Number(year) < 1 || Number(year) > 4)
      errors.year = 'Year must be an integer between 1 and 4';
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) errors.phoneNumber = 'Phone number must be exactly 10 digits';
    if (!rollNumber || rollNumber.length < 1 || rollNumber.length > 20) errors.rollNumber = 'Roll number must be 1–20 characters';
    if (!section || section.length < 1 || section.length > 10) errors.section = 'Section must be 1–10 characters';

    const teamSize = event.team_size;
    if (teamSize > 1) {
      if (!teamName || teamName.length < 1 || teamName.length > 100)
        errors.teamName = 'Team name is required for team events (1–100 characters)';
    }

    // Validate teamMembers array if provided
    const members = Array.isArray(teamMembers) ? teamMembers : [];
    if (teamSize > 1 && members.length > teamSize - 1) {
      errors.teamMembers = `Team members must not exceed ${teamSize - 1}`;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    // For individual events, ignore team fields
    const finalTeamName = teamSize > 1 ? teamName : null;
    const finalTeamMembers = teamSize > 1 ? members : [];

    // --- Insert registration ---
    const result = await query(
      `INSERT INTO registrations
         (event_id, user_id, name, branch, year, phone_number, roll_number, section, team_name, team_members)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
       RETURNING *`,
      [
        eventId, req.user.id, name, branch, Number(year), phoneNumber,
        rollNumber, section, finalTeamName, JSON.stringify(finalTeamMembers),
      ]
    );

    const reg = result.rows[0];
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      registration: {
        id: reg.id,
        eventId: reg.event_id,
        name: reg.name,
        branch: reg.branch,
        year: reg.year,
        phoneNumber: reg.phone_number,
        rollNumber: reg.roll_number,
        section: reg.section,
        teamName: reg.team_name ?? null,
        teamMembers: reg.team_members ?? [],
        registeredAt: reg.registered_at,
        status: reg.status,
      },
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'You are already registered for this event' });
    }
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/events/:eventId/registrations  (organizer, must own event)
// ---------------------------------------------------------------------------
const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Check event exists + ownership
    const eventResult = await query(`SELECT organizer_id FROM events WHERE id = $1`, [eventId]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (eventResult.rows[0].organizer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to manage this event' });
    }

    const result = await query(
      `SELECT id, event_id, name, branch, year, phone_number, roll_number, section,
              team_name, team_members, registered_at, status
       FROM registrations
       WHERE event_id = $1
       ORDER BY registered_at`,
      [eventId]
    );

    return res.status(200).json({
      success: true,
      eventId,
      registrations: result.rows.map(formatRegistration),
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/registrations/mine  (student only)
// ---------------------------------------------------------------------------
const getMyRegistrations = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.id, r.event_id, e.name AS event_name,
              to_char(e.date, 'YYYY-MM-DD') AS event_date,
              r.name, r.branch, r.year, r.phone_number, r.roll_number, r.section,
              r.team_name, r.team_members, r.registered_at, r.status
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       WHERE r.user_id = $1
       ORDER BY r.registered_at DESC`,
      [req.user.id]
    );

    const registrations = result.rows.map((row) => ({
      id: row.id,
      eventId: row.event_id,
      eventName: row.event_name,
      eventDate: row.event_date,
      name: row.name,
      branch: row.branch,
      year: row.year,
      phoneNumber: row.phone_number,
      rollNumber: row.roll_number,
      section: row.section,
      teamName: row.team_name ?? null,
      teamMembers: row.team_members ?? [],
      registeredAt: row.registered_at,
      status: row.status,
    }));

    return res.status(200).json({ success: true, registrations });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerForEvent, getEventRegistrations, getMyRegistrations };
