import jwt from 'jsonwebtoken';

// Define the verifyToken middleware
const verifyToken = (req, res, next) => {
    const authtoken =  req.headers.authorization?.split(' ')[1];

    // Parse the JSON string to extract the token
    const token = JSON.parse(authtoken).token;

    //req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.userId; // store user info in req if needed
        next();
    });
};

export default verifyToken;
