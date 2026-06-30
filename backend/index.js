// server.js (fixed)

// Load environment variables from .env
require('dotenv').config();

// Core dependencies
const http = require('http');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const mysql = require('mysql2/promise');
const { Pool } = require("pg");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

// ORM / DB abstraction (custom file)
const { Odb } = require('./schema.js');
// const { adminJs, adminRouter } = require('./admin.js');

// ---------------- CONFIG ----------------
const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = `http://localhost:${PORT}`;
const DOMAIN = 'https://app.tera-in.top'
const SECRET_KEY = process.env.SECRET_KEY || "12345678"; // Move to .env for security


// Log environment info (sanitized)
console.log("🔥 Backend restarted");
console.log('📦 PREDICTION_KEY:', process.env.PREDICTION_KEY ? '***SET***' : '❌ Missing');
console.log('🌍 ENDPOINT:', process.env.ENDPOINT || '❌ Missing');
console.log('🆔 PROJECT_ID:', process.env.PROJECT_ID || '❌ Missing');
console.log('📸 ITERATION_NAME:', process.env.ITERATION_NAME || '❌ Missing');

// ---------------- MIDDLEWARE ----------------
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "https://pothole-spotter-git-main-stevens-projects-8a9fb357.vercel.app",
  "https://pothole-spotter.vercel.app",
  "https://patholespotter.tera-in.top",
  "https://patholespotter.tera-in.top/",
  "https://app.tera-in.top",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON bodies
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Initialize Passport
// Session middleware (must come before passport.session)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret", // keep in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true if behind HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1h
    },
  })
);

// Initialize Passport AFTER session
app.use(passport.initialize());
app.use(passport.session());


// Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    (accessToken, refreshToken, profile, done) => {
      // Here you can save user info to DB if needed
      return done(null, profile);
    }
  )
);

// Serialize & deserialize user (for sessions)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
const FRONTEND_URL = 'https://patholespotter.tera-in.top'

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(400).json({ message: "Auth Failed!" });
      }

      // Try to find user in DB 
      let user = await Odb("users")
        .where("email", req.user.emails?.[0]?.value)
        .orWhere("google_id", req.user.id)
        .first();

      // If not found, create new account
      if (!user) {
        const userId = crypto.randomUUID();

        const [newUser] = await Odb("users")
          .insert({
            id: userId,
            google_id: req.user.id,
            first_name: req.user.name?.givenName || null,
            last_name: req.user.name?.familyName || null,
            phone_number: null,
            country: null,
            password: null,
            is_google_account: true,
            email: req.user.emails?.[0]?.value || null,
            profile_pic: req.user.photos?.[0]?.value || null,
          })
          .returning("*");



        user = newUser;
      } else {
        console.log("🔑 Existing Google user logged in:", user.email);
      }

      // Issue confusion token (temporary user identifier)
      const confusionToken = encodeURIComponent(user.id);

      // Redirect back to frontend with token
      res.redirect(
        `${FRONTEND_URL}/auth/callback?token=${confusionToken}`
      );
      // res.status(200).json({ message: "New Google user",confusionToken });

    } catch (err) {
      console.error("❌ Auth callback error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);



// ---------------- RATE LIMIT ----------------
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 300,
// });
// app.use(limiter);

// Auth routes (your file)
const authRoutes = require('./user_auth.js');
const autoModelRouter = require('./autoModel.js');

app.use('/api', authRoutes);
app.use("/auto", autoModelRouter);

// ---------------- DATABASE ----------------

const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initDb() {
  try {
    await db.query("SELECT 1");
    console.log("✅ PostgreSQL connection successful");
  } catch (err) {
    console.error("❌ PostgreSQL error:", err);
  }
}

initDb();


// ---------------- FILE UPLOAD (Multer) ----------------
// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // safer file name
    const ext = path.extname(file.originalname);
    cb(null, `pothole-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

// file filter for images only
function imageFileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (tweak as needed)
  fileFilter: imageFileFilter
});

// named fields convenience
const uploader = upload.fields([
  { name: 'file', maxCount: 10 },
  { name: 'image', maxCount: 10 }
]);

// ---------------- AUTH HELPERS ----------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: '24h' }
  );
};

// ---------------- ROUTES ----------------
app.post('/upload', (req, res) => {
  uploader(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'MulterError', code: err.code, message: err.message });
      }
      return res.status(500).json({ error: 'UploadError', message: err.message });
    }

    // Combine both possible fields into one array
    const files = []
      .concat(req.files?.file || [])
      .concat(req.files?.image || []);

    if (!files.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const saved = files.map(f => ({
      field: f.fieldname,
      originalname: f.originalname,
      filename: f.filename,
      path: f.path
    }));

    res.json({ ok: true, files: saved });
  });
});

// Image analysis with Azure Custom Vision
app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const { lat, lng, userId, stretchStartLat, stretchStartLng, stretchEndLat, stretchEndLng } = req.body;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (!req.file || isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: 'Missing image or location data' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    if (imageBuffer.length === 0) throw new Error('Image buffer is empty');

    // build relative path instead of absolute
    const relativePath = path.join('uploads', path.basename(req.file.path));
    const imageUrl = `${DOMAIN}/${relativePath.replace(/\\/g, '/')}`;
    // Azure endpoint check
    if (!process.env.ENDPOINT || !process.env.PREDICTION_KEY || !process.env.PROJECT_ID || !process.env.ITERATION_NAME) {
      console.warn('🔶 Azure config missing');
      return res.status(500).json({ error: 'Azure prediction not configured' });
    }

    const endpoint = process.env.ENDPOINT.replace(/\/$/, '');
    const url = `${endpoint}/customvision/v3.0/Prediction/${process.env.PROJECT_ID}/classify/iterations/${process.env.ITERATION_NAME}/image`;

    console.log('➡️ Sending to Azure:', url);

    const response = await axios.post(url, imageBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Prediction-Key': process.env.PREDICTION_KEY
      },
      timeout: 30000
    });

    if (!response.data || !Array.isArray(response.data.predictions) || response.data.predictions.length === 0) {
      console.warn('⚠️ Unexpected Azure response', response.data);
      return res.status(502).json({ error: 'Bad response from Azure' });
    }

    const topPrediction = response.data.predictions[0];
    const { tagName: label, probability: confidence } = topPrediction;

    // Save to DB with relative path
    const id = crypto.randomUUID();
    await Odb('detections').insert({
      id,
      user_id: userId,
      label,
      image_url: relativePath,  // ✅ not absolute path
      lat: parsedLat,
      lng: parsedLng,
      confidence: confidence,
      stretch_start_lat: parseFloat(stretchStartLat) || null,
      stretch_start_lng: parseFloat(stretchStartLng) || null,
      stretch_end_lat: parseFloat(stretchEndLat) || null,
      stretch_end_lng: parseFloat(stretchEndLng) || null,
    });

    console.log('✅ Detection saved:', id);

    res.json({ detectionId: id, label, confidence, location: { lat: parsedLat, lng: parsedLng }, imageUrl, created_at: Date.now() });
  } catch (err) {
    console.error('🔥 Error during analysis:', err?.message || err);
    if (err.response) console.error('Azure API response:', err.response.data);
    res.status(500).json({ error: 'Analysis failed', detail: err?.message || null });
  }
});


// Fetch detection by ID
app.post('/detections/:id', async (req, res) => {
  try {
    const { id } = req.params

    const row = await Odb('detections').where({ id }).first()
    if (!row) {
      return res.status(404).json({ error: 'Detection not found' })
    }

    const {
      label,
      confidence,
      lat,
      lng,
      image_url,
      created_at
    } = row

    // Ensure location parsing (fallbacks included)
    const parsedLat = parseFloat(lat) || null
    const parsedLng = parseFloat(lng) || null

    res.json({
      detectionId: id,
      label,
      confidence,
      location: { lat: parsedLat, lng: parsedLng },
      imageUrl: `${DOMAIN}/${image_url.replace(/\\/g, '/')}`,
      created_at
    })
  } catch (err) {
    console.error('🔥 DB error:', err)
    res.status(500).json({ error: 'Server error. Please try again later.' })
  }
})


// Fetch all detections
app.get('/detections', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM detections ORDER BY created_at DESC');
    res.json(results);
  } catch (err) {
    console.error('❌ Failed to fetch detections:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Query detections at a specific spot
app.get('/api/spot', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing coordinates' });

  try {
    const [rows] = await db.query(
      `SELECT * FROM detections WHERE lat = ? AND lng = ? ORDER BY created_at DESC`,
      [parseFloat(lat), parseFloat(lng)]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'No data yet.' });
    res.json(rows);
  } catch (err) {
    console.error('🔥 Spot query error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});
// Image analysis with Azure Custom Vision
app.post('/auto-train/detections', upload.single('image'), async (req, res) => {
  try {
        console.log('request body:', req.body)

    const { data } = req.body
    const parsedData = data ? JSON.parse(data) : {}

    // Handle uploaded file
    const fileInfo = req.file
    if (!fileInfo) {
      return res.status(400).json({ error: 'File upload required' })
    }

    console.log('📥 Received detection:')
    console.log('Metadata:', parsedData)
    console.log('File:', fileInfo.path)

    // TODO: Insert into DB here

  } catch (err) {
    console.error('🔥 Error handling detection:', err)
    res.status(500).json({ error: 'Server error. Please try again later.' })
  }
});



// ---------------- HTTP + SOCKET.IO ----------------
// create http server and attach socket.io
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔥 Client connected:", socket.id);

  // Join specific room
  socket.on("joinRoom", (room) => {
    socket.join(room);
    socket.emit("joined", room);
    console.log(`📌 ${socket.id} joined room ${room}`);
  });

  // Generic message handling
  socket.on("message", (payload) => {
    console.log("💬 Message received:", payload);
    if (payload?.room) {
      io.to(payload.room).emit("message", { from: socket.id, text: payload.text });
    } else {
      socket.broadcast.emit("message", { from: socket.id, text: payload?.text });
    }
  });

  // Live map data handler
  socket.on("live_map_data", async ({ room, coords }) => {
    console.log(`🗺️ Live map data request from ${socket.id}`);
    console.log("➡️ Incoming room:", room);
    console.log("➡️ Incoming coords:", coords);

    try {
      const data = await getLiveMaps(coords); // <-- await query
      console.log("✅ Query result length:", data?.length || 0);

      if (!data || data.length === 0) {
        console.warn("⚠️ No detections found for coords:", coords);
      } else {
        console.log("📦 First detection sample:", data[0]);
      }

      const payload = {
        data,
        timestamp: Date.now(),
      };

      if (room) {
        console.log(`📡 Emitting live_map_data to room: ${room}`);
        io.to(room).emit("live_map_data", payload);
      } else {
        console.log("📡 Broadcasting live_map_data to all clients");
        socket.broadcast.emit("live_map_data", payload);
      }
    } catch (err) {
      console.error("🔥 Error in live_map_data handler:", err);
      socket.emit("live_map_data", { data: [], error: "Failed to fetch detections" });
    }
  });


  // Disconnect
  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, reason);
  });
});


// ✅ Get ~30 nearby detections
async function getLiveMaps(coords) {
  try {
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    const limit = 30;
    const radius = 0.01; // ~1km (~1 km range)

    if (isNaN(lat) || isNaN(lng)) {
      console.warn("❌ Invalid coords:", coords);
      return [];
    }

    // Query DB
    const detections = await Odb("detections")
      .whereBetween("lat", [lat - radius, lat + radius])
      .andWhereBetween("lng", [lng - radius, lng + radius])
      .limit(limit);

    if (!detections || detections.length === 0) {
      console.warn("⚠️ No detections found near:", { lat, lng });
      return [];
    }

    // Transform into clean objects
    const results = detections.map((d) => ({
      detectionId: d.id,
      label: d.label,
      confidence: d.confidence || null,
      location: { lat: d.lat, lng: d.lng },
      imageUrl: `${DOMAIN}/${d.image_url.replace(/\\/g, '/')}`,
      created_at: d.created_at
    }));

    return results;
  } catch (err) {
    console.error("🔥 Error fetching live maps:", err);
    return [];
  }
}



shutdown
async function shutdown() {
  console.log('🛑 Shutting down...');
  try {
    if (db && db.end) await db.end();
    io.close();
    httpServer.close(() => console.log('http server closed'));
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ---------------- START SERVER ----------------
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at ${BACKEND_URL}`);
});
