const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, nationalId, address } = req.body;

    // تحقق من الرقم القومي السعودي: 10 أرقام ويبدأ بـ 1 أو 2
    if (!/^([1-2])\d{9}$/.test(nationalId)) {
      return res.status(400).json({ success: false, message: 'الرقم القومي يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2' });
    }
    if (!address || address.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'العنوان مطلوب' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone, nationalId, address });
    await user.save();

    // تقدر تحذف الباسورد قبل الإرسال
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userObj
    });

  } catch (err) {
    console.error('Registration error:', err); // طباعة الخطأ
    return res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt with:', { email: req.body.email });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, role: user.role }, 'secretkey', { expiresIn: '1d' });
    console.log('JWT Token (after login):', token);
    
    // تحديث lastLogin بدون الحقول المطلوبة
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updateFields = { ...req.body };
    // تحقق من الرقم القومي إذا تم إرساله
    if (updateFields.nationalId && !/^([1-2])\d{9}$/.test(updateFields.nationalId)) {
      return res.status(400).json({ message: 'الرقم القومي يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2' });
    }
    if (updateFields.address !== undefined && (!updateFields.address || updateFields.address.trim().length === 0)) {
      return res.status(400).json({ message: 'العنوان مطلوب' });
    }
    // لا تحدث الباسورد هنا
    delete updateFields.password;
    const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User status updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// جلب بيانات المستخدم الحالي
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// إحصائيات العملاء الجدد مع نسبة التغيير السنوي
exports.getNewUsersStats = async (req, res) => {
  try {
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    const startOfThisYear = new Date(thisYear, 0, 1);
    const endOfThisYear = new Date(thisYear + 1, 0, 1);
    const startOfLastYear = new Date(lastYear, 0, 1);
    const endOfLastYear = new Date(thisYear, 0, 1);

    const thisYearCount = await User.countDocuments({ createdAt: { $gte: startOfThisYear, $lt: endOfThisYear } });
    const lastYearCount = await User.countDocuments({ createdAt: { $gte: startOfLastYear, $lt: endOfLastYear } });

    let change = 0;
    let changeType = 'increase';
    if (lastYearCount > 0) {
      change = ((thisYearCount - lastYearCount) / lastYearCount) * 100;
      changeType = change >= 0 ? 'increase' : 'decrease';
    } else if (thisYearCount > 0) {
      change = 100;
      changeType = 'increase';
    }

    res.json({
      success: true,
      count: thisYearCount,
      change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      changeType
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
