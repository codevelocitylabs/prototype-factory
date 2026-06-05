// Hardcoded no-auth pattern for hackathon demos.
// Mirror of templates/cli/src/lib/auth.js; cross-stack interface parity.

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
