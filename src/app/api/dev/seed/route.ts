import { NextResponse } from 'next/server';
import { getSql } from '@/lib/neon';
import { ensureRedConnectTables } from '@/lib/redconnect-db';
import crypto from 'crypto'; // Node.js crypto for server-side key derivation
import bcrypt from 'bcryptjs';

// Only allow in development
const IS_DEV = process.env.NODE_ENV === 'development';

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits = 32 bytes
const IV_LENGTH = 12;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}

// Node.js crypto equivalent for deriveKey
function deriveKeyNode(password: string, saltBase64: string): Buffer {
  const salt = Buffer.from(saltBase64, 'base64');
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

// Node.js crypto equivalent for AES-GCM encrypt
function encryptNode(key: Buffer, plaintext: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  // WebCrypto AES-GCM appends the auth tag to the ciphertext
  const combined = Buffer.concat([encrypted, authTag]);
  
  return {
    ciphertext: combined.toString('base64'),
    iv: iv.toString('base64')
  };
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Realistic post contents
const POST_TEMPLATES = [
  { tag: 'query', content: "Has anyone experienced worse cramps after switching from coffee to matcha? I thought reducing caffeine would help, but this month has been brutal." },
  { tag: 'experience', content: "Just wanted to share a win: taking magnesium glycinate for the last 3 months has completely eliminated my pre-period migraines. So relieved!" },
  { tag: 'suggestion', content: "If you struggle with lower back pain during your luteal phase, try the 'Child's Pose' stretch with a heating pad on your lower back. Game changer." },
  { tag: 'general', content: "Why do we always crave the unhealthiest things exactly 3 days before our period starts? I just ate an entire bag of chips." },
  { tag: 'query', content: "Is it normal for cycle length to jump from 28 to 34 days just from stress? Work has been crazy lately." },
  { tag: 'experience', content: "I finally started tracking my energy levels alongside my cycle, and the patterns are so clear. I'm literally useless on day 2." },
  { tag: 'suggestion', content: "Pro tip: Prep your meals for the first few days of your cycle *before* you actually start. You'll thank yourself later." },
  { tag: 'query', content: "Does anyone else get crazy insomnia right before their period? I'm exhausted but can't sleep." },
  { tag: 'general', content: "The brain fog during the follicular phase is real today. I can barely form a sentence." },
  { tag: 'experience', content: "Switched to a menstrual cup this month and honestly, I wish I did it years ago. There's a learning curve but it's so much better." }
];

function generateRealisticCycleData() {
  const now = new Date();
  
  // Random cycle length between 25 and 35
  const cycleLength = Math.floor(Math.random() * 11) + 25;
  // Random period length between 3 and 7
  const periodLength = Math.floor(Math.random() * 5) + 3;
  // Last period started between 0 and 35 days ago
  const daysAgo = Math.floor(Math.random() * 36);
  
  const lastPeriodStart = new Date(now);
  lastPeriodStart.setDate(now.getDate() - daysAgo);
  
  const nextPeriodStart = new Date(lastPeriodStart);
  nextPeriodStart.setDate(lastPeriodStart.getDate() + cycleLength);

  // Generate some symptoms for the last few days
  const symptoms = [];
  const startLogs = new Date(now);
  startLogs.setDate(now.getDate() - 10);
  
  const possibleSymptoms = ['cramps', 'headache', 'fatigue', 'bloating', 'acne', 'mood_swings'];
  
  const data = {
    settings: {
      averageCycleLength: cycleLength,
      averagePeriodLength: periodLength,
    },
    cycleInfo: {
      lastPeriodStart: lastPeriodStart.toISOString().split('T')[0],
      nextPeriodStart: nextPeriodStart.toISOString().split('T')[0],
    },
    entries: {} as Record<string, any>
  };

  // Add 3-5 random entries
  const numEntries = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < numEntries; i++) {
    const entryDate = new Date(startLogs);
    entryDate.setDate(startLogs.getDate() + Math.floor(Math.random() * 10));
    const dateStr = entryDate.toISOString().split('T')[0];
    
    // Pick 1-3 random symptoms
    const numSymptoms = Math.floor(Math.random() * 3) + 1;
    const dailySymptoms = [];
    for (let j = 0; j < numSymptoms; j++) {
      dailySymptoms.push(possibleSymptoms[Math.floor(Math.random() * possibleSymptoms.length)]);
    }
    
    data.entries[dateStr] = {
      date: dateStr,
      symptoms: [...new Set(dailySymptoms)],
      notes: "Auto-generated note"
    };
  }

  return data;
}

// Realistic usernames (Indian & Global)
const USERNAMES = [
  "anya_sharma", "priya_desai", "sarah.j", "emily_rose", "kavita.r",
  "mia_chen", "zara_ahmed", "chloe_b", "neha.patel", "olivia_w",
  "shruti_k", "sophia_m", "ananya_99", "isabella_v", "diya_singh",
  "grace_hop", "tara_jain", "lily.pad", "nisha_varma", "zoe_life",
  "roshni.d", "emma_lou", "meera_n", "maya_r", "ava_smith",
  "simran_k", "ella_fitz", "sneha_p", "lucy_sky", "isha_g"
];

// Realistic comments
const COMMENT_TEMPLATES = [
  "I totally feel you on this!",
  "Thanks for sharing, this was really helpful.",
  "Same here, it's been so frustrating.",
  "Have you tried drinking ginger tea? It helped me a lot.",
  "This is so relatable.",
  "I thought I was the only one!",
  "Great tip, definitely going to try this next month.",
  "Oh wow, I didn't know that could cause issues.",
  "Sending hugs! It gets better.",
  "My doctor actually suggested something similar.",
  "I've been dealing with this too. You're not alone.",
  "Yes! This exact thing happened to me last week."
];

export async function GET(request: Request) {
  if (!IS_DEV) {
    return NextResponse.json({ error: "Only available in development mode" }, { status: 403 });
  }

  try {
    const sql = getSql();
    await ensureRedConnectTables();

    // Check for clear flag
    const url = new URL(request.url);
    if (url.searchParams.get("clear") === "true") {
      await sql`TRUNCATE TABLE rc_comments, rc_posts, encrypted_blobs, user_meta, users CASCADE`;
    }

    const results = {
      users_created: 0,
      posts_created: 0,
      comments_created: 0,
    };

    const PASSWORD = "Password123!";
    
    // Shuffle usernames array
    const shuffledUsernames = [...USERNAMES].sort(() => 0.5 - Math.random());

    for (let i = 1; i <= 30; i++) {
      const email = `user${i}@test.com`;
      const username = shuffledUsernames[i - 1] || `user${i}`;
      
      const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (existing.length > 0) continue;

      // 1. Create User
      const passwordHash = await bcrypt.hash(PASSWORD, 10);
      const result = await sql`
        INSERT INTO users (email, password_hash)
        VALUES (${email}, ${passwordHash})
        RETURNING id
      `;
      const userId = result[0].id;

      // 2. Create User Meta
      const saltBuffer = crypto.randomBytes(16);
      const saltBase64 = arrayBufferToBase64(saltBuffer);
      
      await sql`
        INSERT INTO user_meta (user_id, onboarding_done, salt)
        VALUES (${userId}, true, ${saltBase64})
      `;

      // 3. Generate and Encrypt Health Data
      const cycleData = generateRealisticCycleData();
      const derivedKey = deriveKeyNode(PASSWORD, saltBase64);
      const { ciphertext, iv } = encryptNode(derivedKey, JSON.stringify(cycleData));

      await sql`
        INSERT INTO encrypted_blobs (user_id, blob_type, ciphertext, iv, updated_at)
        VALUES (${userId}, 'full_sync', ${ciphertext}, ${iv}, now())
      `;

      results.users_created++;

      // 4. Create Posts
      const numPosts = Math.floor(Math.random() * 5) + 1;
      for (let p = 0; p < numPosts; p++) {
        const template = POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)];
        
        const postDate = new Date();
        postDate.setHours(postDate.getHours() - Math.floor(Math.random() * 720)); // Up to 30 days ago
        const postDateStr = postDate.toISOString();
        
        const postId = generateId();
        
        // Random comments count
        const numComments = Math.floor(Math.random() * 6); // 0 to 5 comments
        
        await sql`
          INSERT INTO rc_posts (id, user_id, username, content, tag, created_at, updated_at, like_count, save_count, comment_count)
          VALUES (${postId}, ${userId}, ${username}, ${template.content}, ${template.tag}, ${postDateStr}, ${postDateStr}, ${Math.floor(Math.random() * 15)}, 0, ${numComments})
        `;
        results.posts_created++;

        // Generate comments from random users
        for (let c = 0; c < numComments; c++) {
          const commentId = generateId();
          const commentContent = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)];
          const randomUsername = USERNAMES[Math.floor(Math.random() * USERNAMES.length)];
          // Using a generic user_id for comments since we just need them to render realistically
          const genericUserId = generateId(); 
          
          const commentDate = new Date(postDate);
          commentDate.setHours(commentDate.getHours() + Math.floor(Math.random() * 48)); // 0-48 hours after post
          const commentDateStr = commentDate.toISOString();

          await sql`
            INSERT INTO rc_comments (id, post_id, user_id, username, content, created_at, updated_at)
            VALUES (${commentId}, ${postId}, ${genericUserId}, ${randomUsername}, ${commentContent}, ${commentDateStr}, ${commentDateStr})
          `;
          results.comments_created++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully", 
      results 
    });

  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
