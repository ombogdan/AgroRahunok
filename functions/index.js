const functions = require('firebase-functions/v1');
const {initializeApp} = require('firebase-admin/app');
const {getAuth} = require('firebase-admin/auth');

initializeApp();

// Supabase's Firebase integration requires this claim on every Firebase user.
exports.grantSupabaseRole = functions.auth.user().onCreate(async user => {
  const auth = getAuth();
  const record = await auth.getUser(user.uid);
  const claims = record.customClaims || {};
  if (claims.role && claims.role !== 'authenticated') {
    throw new Error('Existing Firebase role claim must be reviewed before enabling Supabase');
  }
  await auth.setCustomUserClaims(user.uid, {...claims, role: 'authenticated'});
});
