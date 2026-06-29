import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'travel_by';
let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl)
  .then(client => {
    console.log('🔌 Connected to local MongoDB at mongodb://localhost:27017');
    db = client.db(dbName);
  })

// REST API Endpoints

app.get('/', (req, res) => {
  res.send('⚙️ MongoDB Express API Server for travel_by is fully online and running! 🚀');
});

// 1. App Users
app.post('/api/users/signup', async (req, res) => {
  try {
    const { email, password, profile_pic, first_name, last_name, address, pin_code, state } = req.body;
    const existing = await db.collection('app_users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }
    const newUser = {
      email: email.toLowerCase(),
      password,
      profile_pic,
      first_name,
      last_name,
      address,
      pin_code,
      state,
      created_at: new Date().toISOString()
    };
    const result = await db.collection('app_users').insertOne(newUser);
    const saved = { ...newUser, id: result.insertedId.toString() };
    delete saved._id;

    // Log event
    await db.collection('system_logs').insertOne({
      category: 'NEW USER',
      message: `New User Sign-up: ${first_name} ${last_name} (${email}) registered.`,
      created_at: new Date().toISOString()
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection('app_users').findOne({ email: email.toLowerCase(), password });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    const id = user._id.toString();
    const saved = { ...user, id };
    delete saved._id;

    // Update last login
    const loginTime = new Date().toISOString();
    await db.collection('app_users').updateOne({ _id: user._id }, { $set: { last_login: loginTime } });
    
    // Log event
    await db.collection('system_logs').insertOne({
      category: 'USER LOGIN',
      message: `User Login: ${user.first_name} ${user.last_name} (${user.email}) logged in.`,
      created_at: new Date().toISOString()
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = { ...req.body };
    delete updates.sessionEmail; // clean internal payload
    
    let query;
    if (ObjectId.isValid(userId)) {
      query = { _id: new ObjectId(userId) };
    } else {
      query = { id: userId }; // local localStorage fallback mock ids
    }

    let result = await db.collection('app_users').updateOne(query, { $set: updates });
    if (result.matchedCount === 0 && req.body.sessionEmail) {
      console.warn(`User ID ${userId} not matched, falling back to update by sessionEmail: ${req.body.sessionEmail}`);
      query = { email: req.body.sessionEmail.toLowerCase().trim() };
      await db.collection('app_users').updateOne(query, { $set: updates });
    }

    const user = await db.collection('app_users').findOne(query);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Sync profile picture across other collections if updated
    if (updates.profile_pic) {
      await db.collection('admins').updateOne({ username: 'Surendra@admin' }, { $set: { profile_pic: updates.profile_pic } });
      await db.collection('drivers').updateOne({ email: 'surendra@gmail.com' }, { $set: { profile_pic: updates.profile_pic } });
      console.log('🔄 Synced profile picture from user to admin and driver.');
    }

    const id = user._id ? user._id.toString() : user.id;
    const saved = { ...user, id };
    delete saved._id;
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('app_users').find().sort({ created_at: -1 }).toArray();
    const mapped = users.map(u => {
      const id = u._id.toString();
      const item = { ...u, id };
      delete item._id;
      return item;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Admins
app.post('/api/admin/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Self-healing check: if admins collection is empty, create the default admin
    const adminCount = await db.collection('admins').countDocuments();
    if (adminCount === 0 && username === 'Surendra@admin' && password === 'Admin@123') {
      await db.collection('admins').insertOne({
        username: 'Surendra@admin',
        password: 'Admin@123',
        first_name: 'Bezawada',
        last_name: 'SurendraNath',
        profile_pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      });
      console.log('🌱 Admins collection was empty. Created default admin account.');
    }

    const admin = await db.collection('admins').findOne({ username, password });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid admin credentials.' });
    }
    const id = admin._id.toString();
    const saved = { ...admin, id };
    delete saved._id;
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const updates = req.body;
    
    let query;
    if (adminId === 'admin-local-id') {
      query = { username: 'Surendra@admin' };
    } else if (ObjectId.isValid(adminId)) {
      query = { _id: new ObjectId(adminId) };
    } else {
      query = { id: adminId };
    }

    let result = await db.collection('admins').updateOne(query, { $set: updates });
    if (result.matchedCount === 0) {
      console.warn(`Admin ID ${adminId} not found, falling back to update first admin in collection.`);
      const firstAdmin = await db.collection('admins').findOne();
      if (firstAdmin) {
        query = { _id: firstAdmin._id };
        await db.collection('admins').updateOne(query, { $set: updates });
      }
    }

    const admin = await db.collection('admins').findOne(query);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found.' });
    }

    // Sync profile picture across other collections if updated
    if (updates.profile_pic) {
      await db.collection('app_users').updateOne({ email: 'surendranathbezawada@gmail.com' }, { $set: { profile_pic: updates.profile_pic } });
      await db.collection('drivers').updateOne({ email: 'surendra@gmail.com' }, { $set: { profile_pic: updates.profile_pic } });
      console.log('🔄 Synced profile picture from admin to user and driver.');
    }

    const id = admin._id ? admin._id.toString() : 'admin-local-id';
    const saved = { ...admin, id };
    delete saved._id;
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. System Logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await db.collection('system_logs').find().sort({ created_at: -1 }).limit(50).toArray();
    const mapped = logs.map(l => {
      const id = l._id.toString();
      const item = { ...l, id };
      delete item._id;
      return item;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const { category, message } = req.body;
    const newLog = {
      category,
      message,
      created_at: new Date().toISOString()
    };
    const result = await db.collection('system_logs').insertOne(newLog);
    res.json({ ...newLog, id: result.insertedId.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Drivers
app.post('/api/drivers/signup', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, vehicle_type, vehicle_number, license_number, profile_pic } = req.body;
    const existing = await db.collection('drivers').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered as a driver.' });
    }
    const newDriver = {
      email: email.toLowerCase(),
      password,
      first_name,
      last_name,
      phone,
      vehicle_type,
      vehicle_number,
      license_number,
      profile_pic,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    const result = await db.collection('drivers').insertOne(newDriver);
    const saved = { ...newDriver, id: result.insertedId.toString() };
    delete saved._id;

    // Log event
    await db.collection('system_logs').insertOne({
      category: 'NEW DRIVER',
      message: `New Driver Registered: ${first_name} ${last_name} (${email}) for ${vehicle_type} (${vehicle_number}).`,
      created_at: new Date().toISOString()
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drivers/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const driver = await db.collection('drivers').findOne({ email: email.toLowerCase(), password });
    if (!driver) {
      return res.status(400).json({ error: 'Invalid driver email or password.' });
    }
    const id = driver._id.toString();
    const saved = { ...driver, id };
    delete saved._id;

    // Log event
    await db.collection('system_logs').insertOne({
      category: 'DRIVER LOGIN',
      message: `Driver Login: ${driver.first_name} ${driver.last_name} (${driver.email}) logged into driver portal.`,
      created_at: new Date().toISOString()
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const driverId = req.params.id;
    const updates = { ...req.body };
    delete updates.sessionEmail; // clean internal payload
    
    let query;
    if (driverId === 'driver-local-id') {
      query = { email: 'test@driver.com' };
    } else if (ObjectId.isValid(driverId)) {
      query = { _id: new ObjectId(driverId) };
    } else {
      query = { id: driverId };
    }

    let result = await db.collection('drivers').updateOne(query, { $set: updates });
    if (result.matchedCount === 0) {
      if (req.body.sessionEmail) {
        console.warn(`Driver ID ${driverId} not matched, falling back to update by sessionEmail: ${req.body.sessionEmail}`);
        query = { email: req.body.sessionEmail.toLowerCase().trim() };
        await db.collection('drivers').updateOne(query, { $set: updates });
      } else {
        const matchCriteria = [];
        if (updates.license_number) matchCriteria.push({ license_number: updates.license_number });
        if (updates.vehicle_number) matchCriteria.push({ vehicle_number: updates.vehicle_number });
        
        if (matchCriteria.length > 0) {
          const found = await db.collection('drivers').findOne({ $or: matchCriteria });
          if (found) {
            console.warn(`Driver ID ${driverId} not matched, falling back to unique match details.`);
            query = { _id: found._id };
            await db.collection('drivers').updateOne(query, { $set: updates });
          }
        }
      }
    }

    const driver = await db.collection('drivers').findOne(query);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    // Sync profile picture across other collections if updated
    if (updates.profile_pic) {
      await db.collection('app_users').updateOne({ email: 'surendranathbezawada@gmail.com' }, { $set: { profile_pic: updates.profile_pic } });
      await db.collection('admins').updateOne({ username: 'Surendra@admin' }, { $set: { profile_pic: updates.profile_pic } });
      console.log('🔄 Synced profile picture from driver to user and admin.');
    }

    const id = driver._id ? driver._id.toString() : 'driver-local-id';
    const saved = { ...driver, id };
    delete saved._id;
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await db.collection('drivers').find().sort({ created_at: -1 }).toArray();
    const mapped = drivers.map(d => {
      const id = d._id.toString();
      const item = { ...d, id };
      delete item._id;
      return item;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Driver Documents
app.post('/api/documents', async (req, res) => {
  try {
    const docData = req.body;
    const emailClean = docData.email.toLowerCase().trim();
    
    const existing = await db.collection('driver_documents').findOne({ email: emailClean });
    let savedId;
    if (existing) {
      await db.collection('driver_documents').updateOne(
        { _id: existing._id },
        { $set: {
            driver_name: docData.driver_name,
            mobile_number: docData.mobile_number,
            passport_pic: docData.passport_pic,
            passport_pic_name: docData.passport_pic_name,
            tenth_certificate: docData.tenth_certificate,
            tenth_certificate_name: docData.tenth_certificate_name,
            driving_license: docData.driving_license,
            driving_license_name: docData.driving_license_name,
            bike_image: docData.bike_image,
            bike_image_name: docData.bike_image_name,
            driver_id: docData.driver_id
          }
        }
      );
      savedId = existing._id;
    } else {
      const newDoc = {
        driver_id: docData.driver_id,
        driver_name: docData.driver_name,
        email: emailClean,
        mobile_number: docData.mobile_number,
        passport_pic: docData.passport_pic,
        passport_pic_name: docData.passport_pic_name,
        tenth_certificate: docData.tenth_certificate,
        tenth_certificate_name: docData.tenth_certificate_name,
        driving_license: docData.driving_license,
        driving_license_name: docData.driving_license_name,
        bike_image: docData.bike_image,
        bike_image_name: docData.bike_image_name,
        created_at: new Date().toISOString()
      };
      const inserted = await db.collection('driver_documents').insertOne(newDoc);
      savedId = inserted.insertedId;
    }

    const doc = await db.collection('driver_documents').findOne({ _id: savedId });
    const id = doc._id.toString();
    const saved = { ...doc, id };
    delete saved._id;

    // Log event
    await db.collection('system_logs').insertOne({
      category: 'DOCUMENT UPLOAD',
      message: `Driver documents updated for: ${docData.driver_name} (${emailClean}).`,
      created_at: new Date().toISOString()
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const doc = await db.collection('driver_documents').findOne({ email });
    if (!doc) {
      return res.json(null);
    }
    const id = doc._id.toString();
    const saved = { ...doc, id };
    delete saved._id;
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    const docs = await db.collection('driver_documents').find().sort({ created_at: -1 }).toArray();
    const mapped = docs.map(d => {
      const id = d._id.toString();
      const item = { ...d, id };
      delete item._id;
      return item;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/documents/verify/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const { verificationStatus, driverId } = req.body;
    const driverStatus = verificationStatus === 'verified' ? 'approved' : 'rejected';

    // 1. Update verification_status in driver_documents
    await db.collection('driver_documents').updateOne(
      { _id: new ObjectId(docId) },
      { $set: { verification_status: verificationStatus } }
    );
    const docResult = await db.collection('driver_documents').findOne({ _id: new ObjectId(docId) });

    // 2. Update driver status in drivers
    if (driverId && driverId !== 'driver-local-id') {
      await db.collection('drivers').updateOne(
        { _id: new ObjectId(driverId) },
        { $set: { status: driverStatus } }
      );
    } else if (docResult && docResult.email) {
      await db.collection('drivers').updateOne(
        { email: docResult.email.toLowerCase().trim() },
        { $set: { status: driverStatus } }
      );
    }

    // 3. Log event
    await db.collection('system_logs').insertOne({
      category: 'DOC VERIFY',
      message: `Driver documents status set to ${verificationStatus} for driver ID ${driverId || 'unknown'}.`,
      created_at: new Date().toISOString()
    });

    const id = docResult._id.toString();
    const saved = { ...docResult, id };
    delete saved._id;
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Express API Server running on http://localhost:${PORT}`);
});
