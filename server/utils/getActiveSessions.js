const Session = require('../models/Session');

const getActiveSessionsState = async () => {
  const activeSessions = await Session.find({ active: true });
  const state = {};
  activeSessions.forEach(s => {
    state[s.userId] = s;
  });
  return state;
};

module.exports = getActiveSessionsState;