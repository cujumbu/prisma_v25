import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Modify the login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      return res.status(404).json({ error: 'No users exist' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ email: user.email, isAdmin: user.isAdmin });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login', details: error.message });
  }
});

// Add a new route to check if any users exist
app.get('/api/users/check', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ exists: userCount > 0 });
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ error: 'An error occurred while checking user existence', details: error.message });
  }
});

// Add a route to create an admin user
app.post('/api/admin/create', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: true,
      },
    });

    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'An error occurred while creating the admin user', details: error.message });
  }
});

// Add routes for claims
app.post('/api/claims', async (req, res) => {
  try {
    const newClaim = await prisma.claim.create({
      data: {
        ...req.body,
        status: 'Pending',
      },
    });
    res.status(201).json(newClaim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'An error occurred while creating the claim', details: error.message });
  }
});

app.get('/api/claims', async (req, res) => {
  try {
    const claims = await prisma.claim.findMany();
    res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'An error occurred while fetching claims', details: error.message });
  }
});

app.get('/api/claims/:id', async (req, res) => {
  try {
    const claim = await prisma.claim.findUnique({
      where: { id: req.params.id },
    });
    if (claim) {
      res.json(claim);
    } else {
      res.status(404).json({ error: 'Claim not found' });
    }
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ error: 'An error occurred while fetching the claim', details: error.message });
  }
});

app.patch('/api/claims/:id', async (req, res) => {
  try {
    const updatedClaim = await prisma.claim.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedClaim);
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ error: 'An error occurred while updating the claim', details: error.message });
  }
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
