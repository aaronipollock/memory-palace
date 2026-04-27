# Centralized Error Handling Guide

## Overview

The application uses a centralized error handling system that:
- Automatically catches async errors
- Provides consistent error responses
- Logs errors with structured context
- Handles different error types appropriately

## Usage

### 1. Wrap route handlers with `asyncHandler`

```javascript
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

router.get('/example', asyncHandler(async (req, res) => {
  // Your async code here
  // No need for try/catch - errors are automatically caught
  res.json({ success: true });
}));
```

### 2. Throw `AppError` for expected errors

```javascript
router.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ user });
}));
```

### 3. Let unexpected errors bubble up

```javascript
router.post('/data', asyncHandler(async (req, res) => {
  // Database errors, network errors, etc. will be caught automatically
  const data = await SomeModel.create(req.body);
  res.json({ data });
}));
```

## Error Types Handled

The error handler automatically handles:
- **AppError**: Custom application errors (operational)
- **ValidationError**: Mongoose validation errors → 400
- **CastError**: Invalid ObjectId → 404
- **Duplicate Key (11000)**: Unique constraint violations → 400
- **JsonWebTokenError**: Invalid JWT → 401
- **TokenExpiredError**: Expired JWT → 401
- **All other errors**: → 500 (unexpected/programming errors)

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": { /* optional details */ },
  "stack": "/* only in development */"
}
```

## Migration from Old Pattern

### Before:
```javascript
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### After:
```javascript
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json({ user });
});
```

## Benefits

1. **Less boilerplate**: No need for try/catch in every route
2. **Consistent responses**: All errors follow the same format
3. **Automatic logging**: Errors are logged with full context
4. **Better debugging**: Stack traces in development
5. **Security**: No sensitive data leaked in production
