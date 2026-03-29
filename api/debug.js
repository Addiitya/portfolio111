const mongoose = require('mongoose');

module.exports = async (req, res) => {
  const uri = process.env.MONGODB_URI || "MISSING";
  const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  
  const state = mongoose.connection.readyState;
  let connectionError = null;
  
  try {
    if (state === 0) {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    }
  } catch(e) {
    connectionError = e.message;
  }
  
  res.json({
    uriConfigured: uri !== "MISSING",
    maskedUri: maskedUri,
    connectionState: mongoose.connection.readyState,
    connectionError: connectionError
  });
};
