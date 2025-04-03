import express from 'express';
import cors from 'cors';
import { readJSON, writeJSON, appendToJSON } from './jsonStorage';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Auth middleware
const auth = (req: any, res: any, next: any) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// User registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }
    
    // Check for existing user
    const users = await readJSON<any>('users');
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString()
    };
    
    await appendToJSON('users', newUser);
    
    // Create token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }
    
    // Check for user
    const users = await readJSON<any>('users');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Students API
app.get('/api/students', auth, async (req: any, res) => {
  try {
    const students = await readJSON<any>('students');
    // Filter by tutor if tutor role
    if (req.user.role === 'tutor') {
      return res.json(students.filter(s => s.tutorId === req.user.id));
    }
    // Filter by parent if parent role
    if (req.user.role === 'parent') {
      return res.json(students.filter(s => s.parentId === req.user.id));
    }
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/students', auth, async (req: any, res) => {
  try {
    const { name, school, grade, parentEmail } = req.body;
    
    if (!name || !school || !grade || !parentEmail) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    // Check if tutor
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ msg: 'Only tutors can add students' });
    }
    
    // Check if parent exists or create an account
    const users = await readJSON<any>('users');
    let parent = users.find(u => u.email === parentEmail);
    
    if (!parent) {
      // Create temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);
      
      parent = {
        id: uuidv4(),
        name: 'Parent of ' + name,
        email: parentEmail,
        password: hashedPassword,
        role: 'parent',
        createdAt: new Date().toISOString()
      };
      
      await appendToJSON('users', parent);
      
      // TODO: In a real app, send email with credentials
      console.log(`Parent account created with email: ${parentEmail} and temporary password: ${tempPassword}`);
    }
    
    // Create student
    const newStudent = {
      id: uuidv4(),
      name,
      school,
      grade,
      tutorId: req.user.id,
      parentId: parent.id,
      createdAt: new Date().toISOString()
    };
    
    await appendToJSON('students', newStudent);
    res.status(201).json(newStudent);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Homework API
app.get('/api/homework', auth, async (req: any, res) => {
  try {
    const homework = await readJSON<any>('homework');
    const students = await readJSON<any>('students');
    
    // Filter by tutor/parent
    let filteredHomework = homework;
    
    if (req.user.role === 'tutor') {
      const tutorStudents = students.filter(s => s.tutorId === req.user.id).map(s => s.id);
      filteredHomework = homework.filter(h => tutorStudents.includes(h.studentId));
    } else if (req.user.role === 'parent') {
      const parentStudents = students.filter(s => s.parentId === req.user.id).map(s => s.id);
      filteredHomework = homework.filter(h => parentStudents.includes(h.studentId));
    }
    
    res.json(filteredHomework);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/homework', auth, async (req: any, res) => {
  try {
    const { studentId, subject, description, dueDate } = req.body;
    
    if (!studentId || !subject || !description || !dueDate) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    // Verify if user has access to this student
    const students = await readJSON<any>('students');
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    
    if (req.user.role === 'tutor' && student.tutorId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    if (req.user.role === 'parent' && student.parentId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Create homework
    const newHomework = {
      id: uuidv4(),
      studentId,
      subject,
      description,
      dueDate,
      status: 'pending',
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    await appendToJSON('homework', newHomework);
    res.status(201).json(newHomework);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update homework status (tutor only)
app.patch('/api/homework/:id', auth, async (req: any, res) => {
  try {
    const { status } = req.body;
    
    // Only tutor can update status
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ msg: 'Only tutors can update homework status' });
    }
    
    const homework = await readJSON<any>('homework');
    const homeworkIndex = homework.findIndex(h => h.id === req.params.id);
    
    if (homeworkIndex === -1) {
      return res.status(404).json({ msg: 'Homework not found' });
    }
    
    // Verify tutor has access to this student's homework
    const students = await readJSON<any>('students');
    const student = students.find(s => s.id === homework[homeworkIndex].studentId);
    
    if (student.tutorId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Update status
    homework[homeworkIndex] = {
      ...homework[homeworkIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    await writeJSON('homework', homework);
    res.json(homework[homeworkIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Exams API
app.get('/api/exams', auth, async (req: any, res) => {
  try {
    const exams = await readJSON<any>('exams');
    const students = await readJSON<any>('students');
    
    // Filter by tutor/parent
    let filteredExams = exams;
    
    if (req.user.role === 'tutor') {
      const tutorStudents = students.filter(s => s.tutorId === req.user.id).map(s => s.id);
      filteredExams = exams.filter(e => tutorStudents.includes(e.studentId));
    } else if (req.user.role === 'parent') {
      const parentStudents = students.filter(s => s.parentId === req.user.id).map(s => s.id);
      filteredExams = exams.filter(e => parentStudents.includes(e.studentId));
    }
    
    res.json(filteredExams);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/exams', auth, async (req: any, res) => {
  try {
    const { studentId, subject, date, syllabus } = req.body;
    
    if (!studentId || !subject || !date) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    // Verify if user has access to this student
    const students = await readJSON<any>('students');
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    
    if (req.user.role === 'tutor' && student.tutorId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    if (req.user.role === 'parent' && student.parentId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Create exam
    const newExam = {
      id: uuidv4(),
      studentId,
      subject,
      date,
      syllabus: syllabus || '',
      score: null,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    await appendToJSON('exams', newExam);
    res.status(201).json(newExam);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update exam score (tutor only)
app.patch('/api/exams/:id', auth, async (req: any, res) => {
  try {
    const { score } = req.body;
    
    // Only tutor can update score
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ msg: 'Only tutors can update exam scores' });
    }
    
    const exams = await readJSON<any>('exams');
    const examIndex = exams.findIndex(e => e.id === req.params.id);
    
    if (examIndex === -1) {
      return res.status(404).json({ msg: 'Exam not found' });
    }
    
    // Verify tutor has access to this student's exam
    const students = await readJSON<any>('students');
    const student = students.find(s => s.id === exams[examIndex].studentId);
    
    if (student.tutorId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Update score
    exams[examIndex] = {
      ...exams[examIndex],
      score,
      updatedAt: new Date().toISOString()
    };
    
    await writeJSON('exams', exams);
    res.json(exams[examIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Attendance API
app.get('/api/attendance', auth, async (req: any, res) => {
  try {
    const attendance = await readJSON<any>('attendance');
    const students = await readJSON<any>('students');
    
    // Filter by tutor/parent
    let filteredAttendance = attendance;
    
    if (req.user.role === 'tutor') {
      const tutorStudents = students.filter(s => s.tutorId === req.user.id).map(s => s.id);
      filteredAttendance = attendance.filter(a => tutorStudents.includes(a.studentId));
    } else if (req.user.role === 'parent') {
      const parentStudents = students.filter(s => s.parentId === req.user.id).map(s => s.id);
      filteredAttendance = attendance.filter(a => parentStudents.includes(a.studentId));
    }
    
    res.json(filteredAttendance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/attendance', auth, async (req: any, res) => {
  try {
    const { studentId, date, status, note } = req.body;
    
    if (!studentId || !date || !status) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    // Only tutor can mark attendance
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ msg: 'Only tutors can mark attendance' });
    }
    
    // Verify tutor has access to this student
    const students = await readJSON<any>('students');
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    
    if (student.tutorId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Create attendance record
    const newAttendance = {
      id: uuidv4(),
      studentId,
      date,
      status,
      note: note || '',
      createdAt: new Date().toISOString()
    };
    
    await appendToJSON('attendance', newAttendance);
    res.status(201).json(newAttendance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Fees API
app.get('/api/fees', auth, async (req: any, res) => {
  try {
    const fees = await readJSON<any>('fees');
    const students = await readJSON<any>('students');
    
    // Filter by tutor/parent
    let filteredFees = fees;
    
    if (req.user.role === 'tutor') {
      const tutorStudents = students.filter(s => s.tutorId === req.user.id).map(s => s.id);
      filteredFees = fees.filter(f => tutorStudents.includes(f.studentId));
    } else if (req.user.role === 'parent') {
      const parentStudents = students.filter(s => s.parentId === req.user.id).map(s => s.id);
      filteredFees = fees.filter(f => parentStudents.includes(f.studentId));
    }
    
    res.json(filteredFees);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/fees', auth, async (req: any, res) => {
  try {
    const { studentId, amount, dueDate, description } = req.body;
    
    if (!studentId || !amount || !dueDate) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    // Only tutor can create fee records
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ msg: 'Only tutors can create fee records' });
    }
    
    // Verify tutor has access to this student
    const students = await readJSON<any>('students');
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    
    if (student.tutorId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Create fee record
    const newFee = {
      id: uuidv4(),
      studentId,
      amount,
      dueDate,
      description: description || 'Monthly tuition fee',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await appendToJSON('fees', newFee);
    res.status(201).json(newFee);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update fee status (tutor only)
app.patch('/api/fees/:id', auth, async (req: any, res) => {
  try {
    const { status } = req.body;
    
    // Only tutor can update fee status
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ msg: 'Only tutors can update fee status' });
    }
    
    const fees = await readJSON<any>('fees');
    const feeIndex = fees.findIndex(f => f.id === req.params.id);
    
    if (feeIndex === -1) {
      return res.status(404).json({ msg: 'Fee record not found' });
    }
    
    // Verify tutor has access to this student's fee
    const students = await readJSON<any>('students');
    const student = students.find(s => s.id === fees[feeIndex].studentId);
    
    if (student.tutorId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Update status
    fees[feeIndex] = {
      ...fees[feeIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    await writeJSON('fees', fees);
    res.json(fees[feeIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Performance API
app.get('/api/performance', auth, async (req: any, res) => {
  try {
    const performance = await readJSON<any>('performance');
    const students = await readJSON<any>('students');
    
    // Filter by tutor/parent
    let filteredPerformance = performance;
    
    if (req.user.role === 'tutor') {
      const tutorStudents = students.filter(s => s.tutorId === req.user.id).map(s => s.id);
      filteredPerformance = performance.filter(p => tutorStudents.includes(p.studentId));
    } else if (req.user.role === 'parent') {
      const parentStudents = students.filter(s => s.parentId === req.user.id).map(s => s.id);
      filteredPerformance = performance.filter(p => parentStudents.includes(p.studentId));
    }
    
    res.json(filteredPerformance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/performance', auth, async (req: any, res) => {
  try {
    const { studentId, date, rating, feedback } = req.body;
    
    if (!studentId || !date || !rating) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    // Only tutor can create performance records
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ msg: 'Only tutors can create performance records' });
    }
    
    // Verify tutor has access to this student
    const students = await readJSON<any>('students');
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    
    if (student.tutorId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Create performance record
    const newPerformance = {
      id: uuidv4(),
      studentId,
      date,
      rating,
      feedback: feedback || '',
      createdAt: new Date().toISOString()
    };
    
    await appendToJSON('performance', newPerformance);
    res.status(201).json(newPerformance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
