module.exports = {
  async up(db, client) {
    await db.collection('users').updateMany({}, { $set: { phoneNumber: '' } });
  },

  async down(db, client) {
    await db.collection('users').updateMany({}, { $unset: { fieldName: '' } });
  },
};
