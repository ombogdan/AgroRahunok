const {applicationDefault, initializeApp} = require('firebase-admin/app');
const {getAuth} = require('firebase-admin/auth');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.FIREBASE_PROJECT_ID) {
  throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS and FIREBASE_PROJECT_ID first.');
}

initializeApp({credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID});

async function main() {
  const auth = getAuth();
  let pageToken;
  let changed = 0;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const user of page.users) {
      const claims = user.customClaims || {};
      if (claims.role === 'authenticated') continue;
      if (claims.role) throw new Error('An existing user has another role claim; review it first.');
      await auth.setCustomUserClaims(user.uid, {...claims, role: 'authenticated'});
      changed++;
    }
    pageToken = page.pageToken;
  } while (pageToken);
  console.log(`Supabase role assigned to ${changed} existing Firebase users.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
