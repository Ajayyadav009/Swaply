const Session = require('../models/Session');
const Availability = require('../models/Avalability');
const User = require('../models/User');

// Schedule Session
const scheduleSession = async (req, res) => {
    try {
        const {
            teacherId,
            skill,
            scheduledAt,
            duration,
        } = req.body;

        const studentId = req.user._id;

        // Prevent self-booking
        if (teacherId === studentId.toString()) {
            return res.status(400).json({
                message: "You can't schedule a session with yourself",
            });
        }

        // Check teacher exists
        const teacher = await User.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({
                message: 'Teacher not found',
            });
        }

        const sessionDate = new Date(scheduledAt);
        const conflictWindow = 60 * 60 * 1000; // 1 hour

        // Check for conflicting sessions
        const conflict = await Session.findOne({
            $or: [
                { teacher: teacherId },
                { student: studentId },
            ],
            scheduledAt: {
                $gte: new Date(sessionDate.getTime() - conflictWindow),
                $lte: new Date(sessionDate.getTime() + conflictWindow),
            },
            status: {
                $in: ['pending', 'confirmed'],
            },
        });

        if (conflict) {
            return res.status(400).json({
                message: 'Teacher already has a session at this time',
            });
        }

        const videoRoomId = `session_${studentId}_${teacherId}_${Date.now()}`;

        const newSession = await Session.create({
            teacher: teacherId,
            student: studentId,
            skill,
            scheduledAt: sessionDate,
            duration: duration || 60,
            roomId: videoRoomId,
            status: 'pending',
        });

        const populated = await newSession.populate([
            {
                path: 'teacher',
                select: 'name avatar email',
            },
            {
                path: 'student',
                select: 'name avatar email',
            },
        ]);

        res.status(201).json({
            message: 'Session scheduled successfully',
            session: populated,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get My Sessions
const getMySessions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, role } = req.query;

        let query = {
            $or: [
                { teacher: userId },
                { student: userId },
            ],
        };

        if (role === 'teacher') {
            query = { teacher: userId };
        }

        if (role === 'student') {
            query = { student: userId };
        }

        if (status) {
            query.status = status;
        }

        const sessions = await Session.find(query)
            .populate('teacher', 'name avatar')
            .populate('student', 'name avatar')
            .sort({ scheduledAt: -1 });

        res.status(200).json({
            count: sessions.length,
            sessions,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update Session Status
const updateSessionStatus = async (req, res) => {
    try {
        const { status, cancelReason } = req.body;

        const foundSession = await Session.findById(req.params.id);

        if (!foundSession) {
            return res.status(404).json({
                message: 'Session not found',
            });
        }

        const isParticipant =
            foundSession.teacher.toString() === req.user._id.toString() ||
            foundSession.student.toString() === req.user._id.toString();

        if (!isParticipant) {
            return res.status(403).json({
                message: 'Not authorized',
            });
        }

        foundSession.status = status;

        if (cancelReason) {
            foundSession.cancelReason = cancelReason;
        }

        if (status === 'ongoing') {
            foundSession.actualStartTime = new Date();
        }

        if (status === 'completed') {
            foundSession.actualEndTime = new Date();
        }

        await foundSession.save();

        res.status(200).json({
            message: 'Session updated successfully',
            session: foundSession,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Submit Feedback
const submitFeedback = async (req, res) => {
    try {
        const {
            teachingQuality,
            communication,
            comment,
        } = req.body;

        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                message: 'Session not found',
            });
        }

        if (session.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Only the student can submit feedback',
            });
        }

        if (session.status !== 'completed') {
            return res.status(400).json({
                message: 'Can only give feedback on completed sessions',
            });
        }

        session.feedback = {
            teachingQuality,
            communication,
            comment,
            givenBy: req.user._id,
        };

        await session.save();

        res.status(200).json({
            message: 'Feedback submitted successfully',
            session,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get Session History
const getSessionHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const sessions = await Session.find({
            $or: [
                { teacher: userId },
                { student: userId },
            ],
            status: 'completed',
        })
            .populate('teacher', 'name avatar')
            .populate('student', 'name avatar')
            .sort({ actualEndTime: -1 });

        const totalMinutes = sessions.reduce((sum, session) => {
            return sum + (session.duration || 0);
        }, 0);

        res.status(200).json({
            count: sessions.length,
            totalHours: Math.round((totalMinutes / 60) * 10) / 10,
            sessions,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    scheduleSession,
    getMySessions,
    updateSessionStatus,
    submitFeedback,
    getSessionHistory,
};