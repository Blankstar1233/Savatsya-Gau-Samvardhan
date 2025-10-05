import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

// Get Supabase project reference from env or hardcode
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'gjqdyvmpwmdfqhdrpcjb';
const JWKS_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1/keys`;

let cachedKeys = null;
let cachedAt = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getSupabaseJWKs() {
  if (cachedKeys && Date.now() - cachedAt < CACHE_TTL) return cachedKeys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error('Failed to fetch Supabase JWKS');
  const { keys } = await res.json();
  cachedKeys = keys;
  cachedAt = Date.now();
  return keys;
}

function getKey(header, callback) {
  getSupabaseJWKs()
    .then(keys => {
      const key = keys.find(k => k.kid === header.kid);
      if (!key) return callback(new Error('No matching JWK'));
      // Build public key in PEM format
      const pub = jwkToPem(key);
      callback(null, pub);
    })
    .catch(err => callback(err));
}

// Helper to convert JWK to PEM
import jwkToPem from 'jwk-to-pem';

export function supabaseAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.supabaseUser = decoded;
    next();
  });
}
