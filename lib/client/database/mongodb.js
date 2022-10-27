const { MongoClient, ObjectId } = require('mongodb');

class Db {
  constructor() {
    this.client = null;
    this.db = null;
    this.collections = new Map();
    this.ObjectId = ObjectId;
    this.transactionOptionsDefault = {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary'
    };
  }

  async connect(url, options = {}) {
    const self = this;
    if (this.client) {
      if (this.client.topology.isConnected()) {
        return Promise.resolve();
      }
      return new Promise((resolve) => self.client.topology.on('serverOpening', resolve));
    }
    this.client = new MongoClient(url, options);
    await this.client.connect();
    this.db = this.client.db();
  }

  getCollection(collectionName) {
    let collection = this.collections.get(collectionName);
    if (!collection) {
      collection = this.db.collection(collectionName);
      this.collections.set(collectionName, collection);
    }
    return collection;
  }

  startSession() {
    return this.client.startSession();
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collections.clear();
    }
  }
}

module.exports = Db;