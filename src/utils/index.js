import axios from 'axios'
export const countries = [
  { name: 'Kenya', code: 'ke' },
  { name: 'Uganda', code: 'ug' },
  { name: 'Tanzania', code: 'Tz' },
  { name: 'Ethiopia', code: 'Et' },
  { name: 'Rwanda', code: 'rd' },
  { name: 'Burundi', code: 'Bu' },
  { name: 'DRC', code: 'Drc' },
  { name: 'Somalia', code: 'Sm' },
  { name: 'Sudan', code: 'Sd' },
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'United Kingdom', code: 'UK' },
  { name: 'Australia', code: 'AU' },
];

// export const BACKEND_URL ='http://localhost:5000'
export const BACKEND_URL ='https://app.tera-in.top'

export const API_BASE_URL = `${BACKEND_URL}/api`;

export const END_POINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/register`,
  IMAGE_UPLOAD: `${API_BASE_URL}/upload`,
  ANALYZE: `${API_BASE_URL}/analyze`,
  REFRESH_TOKEN: `${API_BASE_URL}/refresh-token`,
  VERIFY_IDENTIFIER: `${API_BASE_URL}/verify-identifier`,
  VERIFY_OTP: `${API_BASE_URL}/verify-otp`,
  SAVE_PASSWORD: `${API_BASE_URL}/change-password`,

  UPLOAD_URL: `${BACKEND_URL}/upload`,
  API_ENDPOINT: `${BACKEND_URL}/analyze`,

  FETCH_DETECTION(detectionId) {
    return `${BACKEND_URL}/detections/${detectionId}`;
  }
};


export const refreshToken = async (payload) => {
  try {
    const response = await axios.post(END_POINTS.REFRESH_TOKEN, payload)

    if (response.status === 200 && response.data) {
      return response.data
    } else {
      throw new Error('Failed to refresh token: Invalid response')
    }
  } catch (error) {
    console.error('refreshToken error:', error)
    throw error
  }
}


export async function getUserLocation() {
  try {
    const response = await fetch("https://ipwho.is/");
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to get location");
    }

    return {
      ip: data.ip,
      country: data.country,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      isp: data.connection?.isp || null
    };
  } catch (err) {
    console.error("Error fetching location:", err.message);
    return null;
  }
}

export function generateRoomId(prefix = "room") {
  const randomPart = Math.random().toString(36).substring(2, 8); // 6-char alphanumeric
  const timestamp = Date.now().toString(36); // time component
  return `${prefix}-${timestamp}-${randomPart}`;
}
