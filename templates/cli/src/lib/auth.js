// Hardcoded no-auth pattern for hackathon demos.
// JS mirror of web/src/lib/auth.ts; cross-stack interface parity.

const HARDCODED_USER = {
  id: 'demo-user',
  name: 'Demo User',
  role: 'developer',
};

export function getCurrentUser() {
  return HARDCODED_USER;
}

export function isAuthenticated() {
  return true;
}
