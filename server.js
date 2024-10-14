// Modify the login route in server.js
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
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Add a new route to check if any users exist
app.get('/api/users/check', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ exists: userCount > 0 });
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ error: 'An error occurred while checking user existence' });
  }
});