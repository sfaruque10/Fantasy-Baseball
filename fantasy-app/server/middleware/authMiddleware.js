const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    //Get json Bearer token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    //Return error if no token
    if (!token) {
        return res.status(401).json({ error: 'No token' });
    }

    //Check if token matches user
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    //General error catch
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;