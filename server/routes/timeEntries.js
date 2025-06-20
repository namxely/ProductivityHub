import express from 'express';
import { body, validationResult, query } from 'express-validator';
import TimeEntry from '../models/TimeEntry.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get time entries
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    
    if (req.query.startDate || req.query.endDate) {
      filter.startTime = {};
      if (req.query.startDate) {
        filter.startTime.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.startTime.$lte = new Date(req.query.endDate);
      }
    }

    const timeEntries = await TimeEntry.find(filter)
      .populate('taskId', 'title')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TimeEntry.countDocuments(filter);

    res.json(timeEntries);
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create time entry
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('startTime').isISO8601(),
  body('endTime').optional().isISO8601(),
  body('duration').optional().isInt({ min: 0 }),
  body('project').optional().trim().isLength({ max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entryData = {
      ...req.body,
      userId: req.user._id
    };

    const timeEntry = new TimeEntry(entryData);
    await timeEntry.save();

    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Create time entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update time entry
router.put('/:id', authenticateToken, [
  body('description').optional().trim().isLength({ min: 1, max: 200 }),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('taskId').optional().isMongoId(),
  body('category').optional().trim().isLength({ max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const timeEntry = await TimeEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('taskId', 'title');

    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    res.json({ timeEntry });
  } catch (error) {
    console.error('Update time entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete time entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    console.error('Delete time entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get time tracking statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEntries = await TimeEntry.find({
      userId,
      startTime: { $gte: today, $lt: tomorrow }
    });

    const totalTimeToday = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekEntries = await TimeEntry.find({
      userId,
      startTime: { $gte: weekStart }
    });

    const totalTimeWeek = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    res.json({
      todayMinutes: totalTimeToday,
      weekMinutes: totalTimeWeek,
      todayHours: Math.round(totalTimeToday / 60 * 10) / 10,
      weekHours: Math.round(totalTimeWeek / 60 * 10) / 10
    });
  } catch (error) {
    console.error('Get time stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;