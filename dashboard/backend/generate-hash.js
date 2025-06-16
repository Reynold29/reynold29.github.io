import bcrypt from 'bcryptjs';

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
}

// Generate hashes for both passwords
generateHash('secret');
generateHash('password123'); 