const jwt = require("jsonwebtoken");

export default function handler(req, res) {
  switch (req.method) {
    case "GET":
      res.send(authenticate());
      return
    default:
      return res.status(405).end(`Method ${req.method} Not allowed`);
  }
  
  function authenticate() {
    const cert = process.env.NEXT_PUBLIC_JWT_CERT;
    try {
      const decoded = jwt.verify(req.query.token, cert, {
        algorithms: ["RS256"],
      });
      return decoded;
    } catch (err) {
      throw err;
    }
  }
  
}
