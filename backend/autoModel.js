const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg'); // or your database client
const Joi = require('joi'); // for validation

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/detections';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `detection_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one image per detection
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Validation schema for detection data
const detectionSchema = Joi.object({
  timestamp: Joi.date().iso().required(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    name: Joi.string().max(500).optional()
  }).required(),
  detection: Joi.object({
    confidence: Joi.number().min(0).max(1).required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    bbox_area: Joi.number().min(0).required(),
    weather_conditions: Joi.string().max(100).optional(),
    road_type: Joi.string().max(100).optional()
  }).required()
});

// Database setup (example with PostgreSQL)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// // Create detections table if not exists
// const createDetectionsTable = async () => {
//   const query = `
//     CREATE TABLE IF NOT EXISTS detections (
//       id SERIAL PRIMARY KEY,
//       timestamp TIMESTAMP NOT NULL,
//       latitude DECIMAL(10, 8) NOT NULL,
//       longitude DECIMAL(11, 8) NOT NULL,
//       location_name TEXT,
//       confidence DECIMAL(3, 2) NOT NULL,
//       severity VARCHAR(20) NOT NULL,
//       bbox_area INTEGER NOT NULL,
//       weather_conditions VARCHAR(100),
//       road_type VARCHAR(100),
//       image_path TEXT,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       is_processed BOOLEAN DEFAULT FALSE,
//       processing_notes TEXT
//     )
//   `;
//   await pool.query(query);
// };

// createDetectionsTable().catch(console.error);


router.post("/live-detections", upload.any(), async (req, res) => {
  try {
    const { data } = req.body;
    const parsedData = data ? JSON.parse(data) : {};
    const files = req.files || [];

    console.log("📦 Parsed data:", parsedData);
    console.log("🖼️ Files:", files.map(f => f.originalname));

    res.json({ success: true, parsedData, fileCount: files.length });
  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post('/live-detections-yes', upload.single('image'), async (req, res) => {
  let imagePath = null;
  
  try {
    // Parse and validate JSON data
    const { data, timeout = 30000 } = req.body;
    
    if (!data) {
      return res.status(400).json({ 
        error: 'Missing required field: data',
        details: 'Please provide detection data in JSON format'
      });
    }

    let detectionData;
    try {
      detectionData = JSON.parse(data);
    } catch (parseError) {
      return res.status(400).json({ 
        error: 'Invalid JSON data',
        details: 'The data field must contain valid JSON'
      });
    }

    // Validate detection data
    const { error, value } = detectionSchema.validate(detectionData);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    // Handle image file
    if (req.file) {
      imagePath = req.file.path;
      console.log(`📸 Image saved: ${imagePath}`);
    }

    // Set timeout if provided
    if (timeout) {
      req.setTimeout(parseInt(timeout));
    }

    // Extract data for database
    const {
      timestamp,
      location: { latitude, longitude, name: locationName },
      detection: { confidence, severity, bbox_area, weather_conditions, road_type }
    } = value;

    // Save to database
    // const insertQuery = `
    //   INSERT INTO detections (
    //     timestamp, latitude, longitude, location_name, 
    //     confidence, severity, bbox_area, weather_conditions, 
    //     road_type, image_path
    //   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    //   RETURNING id
    // `;

    const values = [
      new Date(timestamp),
      latitude,
      longitude,
      locationName,
      confidence,
      severity,
      bbox_area,
      weather_conditions,
      road_type,
      imagePath
    ];

    // const result = await pool.query(insertQuery, values);
    // const detectionId = result.rows[0].id;

    // console.log(`✅ Detection saved: ID ${detectionId}, Confidence: ${confidence}, Severity: ${severity}`);
    console.log(`✅ Detection saved: IDConfidence: ${confidence}, Severity: ${severity}`);

    // Additional processing (can be extended)
    // await processDetectionForTraining(value, imagePath);

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Detection successfully recorded',
    //   detection_id: detectionId,
    //   data: {
    //     id: detectionId,
    //     timestamp: value.timestamp,
    //     location: value.location,
    //     detection: value.detection,
    //     image_uploaded: !!imagePath
    //   }
    });

  } catch (err) {
    console.error('🔥 Server error:', err);

    // Clean up uploaded file if error occurred
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Handle different types of errors
    if (err.code === '23505') { // Unique constraint violation
      res.status(409).json({ 
        error: 'Duplicate detection',
        details: 'This detection appears to be a duplicate'
      });
    } else if (err.code === '23502') { // Not null violation
      res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Please check all required fields are provided'
      });
    } else if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({ 
          error: 'File too large',
          details: 'Image must be less than 10MB'
        });
      } else {
        res.status(400).json({ 
          error: 'File upload error',
          details: err.message
        });
      }
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        details: 'Please try again later'
      });
    }
  }
});

// Additional processing function for training data
async function processDetectionForTraining(detectionData, imagePath) {
  try {
    const { detection, location } = detectionData;
    
    // Create training data entry
    const trainingData = {
      features: {
        confidence: detection.confidence,
        severity: detection.severity,
        bbox_area: detection.bbox_area,
        weather_conditions: detection.weather_conditions,
        road_type: detection.road_type,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      },
      image_path: imagePath,
      processed_at: new Date().toISOString()
    };

    // Save training data (you can save to another table or file system)
    console.log('📊 Training data prepared:', {
      severity: detection.severity,
      confidence: detection.confidence,
      has_image: !!imagePath
    });

    // Here you can:
    // 1. Add to training dataset
    // 2. Trigger model retraining
    // 3. Send to analytics service
    // 4. Notify administrators

    // Example: Save to training dataset file
    const trainingDir = 'training_data';
    if (!fs.existsSync(trainingDir)) {
      fs.mkdirSync(trainingDir, { recursive: true });
    }

    const trainingFile = path.join(trainingDir, 'detections.jsonl');
    const trainingEntry = JSON.stringify(trainingData) + '\n';
    
    fs.appendFileSync(trainingFile, trainingEntry, 'utf8');
    
    console.log(`📈 Training data appended to ${trainingFile}`);

  } catch (error) {
    console.error('❌ Error processing training data:', error);
    // Don't throw error to avoid affecting main detection recording
  }
}

// Optional: Endpoint to get detection statistics
router.get('/auto-train/detections/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_detections,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_detections,
        severity,
        COUNT(*) as severity_count,
        AVG(confidence) as avg_confidence
      FROM detections 
      GROUP BY severity
    `;

    const result = await pool.query(statsQuery);
    
    const stats = {
      total_detections: parseInt(result.rows[0]?.total_detections || 0),
      today_detections: parseInt(result.rows[0]?.today_detections || 0),
      by_severity: result.rows.reduce((acc, row) => {
        acc[row.severity] = {
          count: parseInt(row.severity_count),
          avg_confidence: parseFloat(row.avg_confidence || 0)
        };
        return acc;
      }, {})
    };

    res.json({
      success: true,
      statistics: stats
    });

  } catch (error) {
    console.error('🔥 Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
});

// Optional: Endpoint to get recent detections
router.get('/auto-train/detections/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 records
    const offset = parseInt(req.query.offset) || 0;

    const recentQuery = `
      SELECT 
        id, timestamp, latitude, longitude, location_name,
        confidence, severity, bbox_area, weather_conditions,
        road_type, image_path, created_at
      FROM detections 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(recentQuery, [limit, offset]);
    
    res.json({
      success: true,
      detections: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rowCount
      }
    });

  } catch (error) {
    console.error('🔥 Recent detections error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent detections',
      details: error.message 
    });
  }
});

module.exports = router;