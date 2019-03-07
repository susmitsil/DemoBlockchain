class BlockDetail {
    constructor(index, previousHash, timestamp, data, hash, proof) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
        this.proof = proof;
    }
}

module.exports = BlockDetail;