const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, 'e4b2f472aa63e6df8b4c9a7e8c9c44f5a6d2b8cd3a83f1e9f03df7e57a41b8f7', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;


    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields (name, email, phone, password) are required' 
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

   
    const phoneExists = await User.findOne({ phone });

    if (phoneExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this phone number already exists' 
      });
    }

   
    const user = await User.create({
      name,
      email,
      phone,
      password,
      isProfileComplete: false,
    });

    if (user) {
      
      try {
        // Build user profile data
        const userProfileData = {
          user: user._id,
          profileType: 'user',
          status: 'active',
          state: '', 
          dist: '',
          dateOfBirth: new Date('1990-01-01'), 
        };

        // Only set these fields if they have values (to avoid unique constraint issues)
        if (name) userProfileData.name = name;
        if (phone) userProfileData.phone = phone;
        if (email) userProfileData.gmail = email;

        // Create user profile
        const userProfile = await Profile.create(userProfileData);
        console.log('User profile created successfully for user:', user._id);

        // Build buyer profile data (without unique fields to avoid conflicts)
        const buyerProfileData = {
          user: user._id,
          profileType: 'buyer',
          status: 'active',
        };

        // Add optional fields only if provided (phone and gmail are unique, so we skip them for buyer profile)
        if (name) buyerProfileData.name = name;

        // Create buyer profile
        const buyerProfile = await Profile.create(buyerProfileData);
        console.log('Buyer profile created successfully for user:', user._id);

        // Update user's profile completion status
        await User.findByIdAndUpdate(user._id, { isProfileComplete: true });
      } catch (profileError) {
        // Log detailed error and clean up user if profile creation fails
        console.error('Error creating default profiles:', profileError);
        console.error('Profile error details:', {
          message: profileError.message,
          code: profileError.code,
          keyPattern: profileError.keyPattern,
          keyValue: profileError.keyValue
        });
        
        // Delete the user and any created profiles if profile creation fails to maintain data consistency
        await User.findByIdAndDelete(user._id);
        await Profile.deleteMany({ user: user._id });
        
        return res.status(500).json({
          success: false,
          message: 'Failed to create user profiles. Please try again.',
          error: profileError.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isProfileComplete: true,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Fetch user's profile data to get state, district, and DOB
      const profile = await Profile.findOne({ 
        user: req.user._id, 
        $or: [
          { profileType: 'user' },
          { profileType: { $exists: false } } 
        ]
      });

      // If no profile exists, create one with default values
      let userProfile = profile;
      

      // Format date to YYYY-MM-DD (remove time)
      const formatDate = (date) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
      };

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isProfileComplete: user.isProfileComplete,
          state: userProfile?.state||'',
          dist: userProfile?.dist||'',
          dob:formatDate(userProfile.dateOfBirth) || '',
        },
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, state, dist, dob } = req.body;
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update user fields if provided
    if (name) user.name = name;
    
    // Check if email is being changed and if new email already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
      user.email = email;
    }

    // Check if phone is being changed and if new phone already exists
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number already exists' 
        });
      }
      user.phone = phone;
    }

    await user.save();

    // Find and update profile
    let profile = await Profile.findOne({ 
      user: userId, 
      $or: [
        { profileType: 'user' },
        { profileType: { $exists: false } } 
      ]
    });

      // Update profile fields if provided
      if (state !== undefined) profile.state = state || '';
      if (dist !== undefined) profile.dist = dist || '';
      if (dob) profile.dateOfBirth = new Date(dob);
      
      // Update name, phone, gmail in profile if changed
      if (name) profile.name = name;
      if (phone) profile.phone = phone;
      if (email) profile.gmail = email;

      await profile.save();
   

    // Format date to YYYY-MM-DD (remove time)
    const formatDate = (date) => {
      if (!date) return '';
      return date.toISOString().split('T')[0];
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        state: profile.state || '',
        dist: profile.dist || '',
        dob: formatDate(profile.dateOfBirth) || '',
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

