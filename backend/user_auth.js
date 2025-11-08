// (user & auth routes)

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const { Odb } = require('./schema.js'); // Knex ORM instance
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const DOMAIN = 'https://app.tera-in.top'

const router = express.Router();

// ✅ Use secret key from .env
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key';

// --------------------
// Multer configuration for profile uploads
// --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = `profile-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// --------------------
// JWT Helper
// --------------------
const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });

// --------------------
// Upload Profile Picture
// --------------------
router.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
  const { userId } = req.body;
  const imageFile = req.file;

  if (!userId || !imageFile) {
    return res.status(400).json({ error: 'Missing userId or image file' });
  }

  const imagePath = imageFile.path.replace(/\\/g, '/'); // Normalize slashes for Windows paths

  try {
    const updated = await Odb('users').where({ id: userId }).update({ profile_pic: imagePath });

    if (updated) {
      return res.status(200).json({
        message: 'Profile picture updated successfully',
        imagePath,
      });
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    console.error('❌ Error updating profile picture:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------------
// Register
// --------------------
router.post('/auth/register', async (req, res) => {
  console.log('📝 Registration attempt');
  try {
    const { email, password, firstName, lastName, phone, country } = req.body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await Odb('users')
      .where('email', email)
      .orWhere('phone_number', phone)
      .first();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = crypto.randomUUID();

    await Odb('users').insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number:phone,
      country: country || '',
      password: hashedPassword,
    });

    const newUser = await Odb('users').where({ id: userId }).first();
    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// --------------------
// Login
// --------------------
router.post('/auth/login', async (req, res) => {
  console.log('🔐 Login attempt');
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Login credentials required' });
    }

    const user = await Odb('users')
      .where('email', identifier)
      .orWhere('phone_number', identifier)
      .first();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: { id: user.id, firstName: user.first_name, email: user.email },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});


router.post('/refresh-token', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id ) {
      return res.status(400).json({ message: 'Auth Failed!' });
    }

    const user = await Odb('users')
      .where('id', id)
      .first();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: { id: user.id, firstName: user.first_name, email: user.email },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/verify-identifier', async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier ) {
      return res.status(400).json({ message: 'Auth Failed!' });
    }

   const user = await Odb('users')
      .where('email', identifier)
      .orWhere('phone_number', identifier)
      .first();

    if (!user) {
      return res.status(401).json({exists:false, message: 'User not found' });
    }

    return res.status(200).json({
      exists:true,
      message: `Enter otp sent to your email, ${user.email}` ,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// --------------------
// Update User Details
// --------------------
router.put('/user-details', async (req, res) => {
  try {
    const { userId, email, firstName, lastName, phoneNo, country } = req.body;

    if (!userId || !email || !firstName || !lastName ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updatedUser = await Odb('users').where({ id: userId }).update({
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNo || undefined,
      country: country || '',
    });

    if (updatedUser) {
      return res.status(200).json({ message: 'User details updated successfully' });
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (error) {
    console.error('❌ Error updating user details:', error);
    res.status(500).json({ error: 'Failed to update user details' });
  }
});

// --------------------
// Fetch User Details
// --------------------
router.get('/user-details', async (req, res) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return res.status(400).json({ error: 'Missing or invalid userId' });
    }

    const rows = await Odb('users').where({ id: userId }).limit(1);
    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    let user = rows[0];

  delete user.password;

    if (user.profile_pic) {
      user.profile_pic = user.profile_pic.startsWith("http")
        ? user.profile_pic
        : `${DOMAIN}/${user.profile_pic.replace(/\\/g, '/')}`;
    }

    res.status(200).json({ user_info: user, success: true });
  } catch (error) {
    console.error('❌ Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info!' });
  }
});

// --------------------
// Fetch Report History
// --------------------
router.get('/report-history', async (req, res) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return res.status(400).json({ error: 'Missing or invalid userId' });
    }

    let history = await Odb('detections').where({ user_id: userId });

    // Normalize image URLs
    history = history.map(report => {
      if (report.image_url) {
        report.image_url = report.image_url.startsWith("http")
          ? report.image_url
          : `${DOMAIN}/${report.image_url.replace(/\\/g, '/')}`;
      }
      return report;
    });

    res.status(200).json({ history, success: true });
  } catch (error) {
    console.error('❌ Error fetching report history:', error);
    res.status(500).json({ error: 'Failed to fetch user history' });
  }
});

// --------------------
// Fetch Public Contact Messages (with latest reply)
// --------------------
router.get('/contact_us_messages', async (req, res) => {
  try {
    const messages = await Odb('contact_us_feedback')
      .where({ is_public: true })
      .orderBy('created_at', 'desc')
      .limit(15);

    const ids = messages.map((msg) => msg.id);

    const allReplies = await Odb('contact_us_feedback_reply')
      .whereIn('feedback_id', ids)
      .orderBy('created_at', 'desc');

    const messagesWithReplies = messages.map((msg) => {
      const latestReply = allReplies.find((r) => r.feedback_id === msg.id);
      return {
        ...msg,
        reply: latestReply?.message || null,
        replyDate: latestReply?.created_at || null,
        admin_email: latestReply?.admin_email || null,
      };
    });

    res.status(200).json({ messages: messagesWithReplies });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

// --------------------
// Submit Contact Message
// --------------------
router.post('/contact_us_messages', async (req, res) => {
  try {
    const { email, content, name, isPublic } = req.body;

    if (!email || !content) {
      return res.status(400).json({ message: 'Email and message content are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const [newId] = await Odb('contact_us_feedback').insert({
      username: name || 'Anonymous',
      email,
      message: content,
      is_public: isPublic === true,
      reply: '',
      likes: JSON.stringify([]),
      dislikes: JSON.stringify([]),
    });

    const [insertedMessage] = await Odb('contact_us_feedback').where({ id: newId }).select('*');

    res.status(201).json({
      message: isPublic ? 'Message posted publicly!' : 'Private message received!',
      messageData: insertedMessage,
    });
  } catch (error) {
    console.error('❌ Error processing contact form:', error);
    res.status(500).json({ message: 'An error occurred while processing your message' });
  }
});


router.post('/messages/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { isLike, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required for voting' });
    }

    const [message] = await Odb('contact_us_feedback').where({ id }).select('*');
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // ✅ Safe parsing
    let likes = safeParseArray(message.likes);
    let dislikes = safeParseArray(message.dislikes);

    // Remove user from both
    likes = likes.filter((uid) => uid !== userId);
    dislikes = dislikes.filter((uid) => uid !== userId);

    // Add vote
    if (isLike) {
      likes.push(userId);
    } else {
      dislikes.push(userId);
    }

    // Update DB
    await Odb('contact_us_feedback')
      .where({ id })
      .update({
        likes: JSON.stringify(likes),
        dislikes: JSON.stringify(dislikes),
      });

    const [updatedMessage] = await Odb('contact_us_feedback')
      .where({ id })
      .select('*');

    res.json({
      message: 'Vote registered successfully',
      messageData: {
        ...updatedMessage,
        likes,
        dislikes,
        likesCount: likes.length,
        dislikesCount: dislikes.length,
        userVote: isLike ? 'like' : 'dislike',
      },
    });
  } catch (error) {
    console.error('❌ Error processing vote:', error);
    res.status(500).json({ message: 'An error occurred while processing your vote' });
  }
});

// Helper
function safeParseArray(value) {
  try {
    return value && value.trim() !== "" ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}


module.exports = router;
