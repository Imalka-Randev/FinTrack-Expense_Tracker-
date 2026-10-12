const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400);
    return next(new Error('Please provide a valid name'));
  }

  if (!email || typeof email !== 'string') {
    res.status(400);
    return next(new Error('Please provide a valid email'));
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email.trim())) {
    res.status(400);
    return next(new Error('Please provide a valid email format'));
  }

  if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    res.status(400);
    return next(new Error('Password must be between 8 and 128 characters'));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('Please provide an email and password'));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
