module.exports = {
  async up(db, _client) {
    await db.collection('users').updateMany({}, { $set: { phoneNumber: '' } });
  },

  async down(db, _client) {
    await db.collection('users').updateMany({}, { $unset: { fieldName: '' } });
  },
};
