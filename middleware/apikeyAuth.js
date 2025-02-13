// Middleware to authenticate the API key in headers
export const authenticateApiKey = (req, res, next) => {
    // Get the API key from request headers
    const apiKey = req.headers['x-api-key'];
  
    // Check if the API key is provided
    if (!apiKey) {
      return res.status(403).json({ success: false, error: 'API key is required' });
    }
  
    // Validate the API key (stored in environment variables or database)
    if (apiKey !== process.env.API_KEY) {
      return res.status(403).json({ success: false, error: 'Invalid API key' });
    }
  
    // If the API key is valid, proceed to the next middleware or route handler
    next();
  };
  

  