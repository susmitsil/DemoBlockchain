Start Node
==========================================================
MYCHAIN_HTTP_PORT=5001 MYCHAIN_P2P_PORT=9001 npm start

MYCHAIN_HTTP_PORT=5002 MYCHAIN_P2P_PORT=9002 npm start

MYCHAIN_HTTP_PORT=5003 MYCHAIN_P2P_PORT=9003 npm start

Initialize blockchain
==========================================================

curl -H "Content-type:application/json" --data '{"difficulty" : 4}' http://localhost:5001/initializeBlockchain

curl -H "Content-type:application/json" --data '{"difficulty" : 4}' http://localhost:5002/initializeBlockchain

curl -H "Content-type:application/json" --data '{"difficulty" : 4}' http://localhost:5003/initializeBlockchain

Apply Difficulty
==========================================================

curl -H "Content-type:application/json" --data '{"difficulty" : 6}' http://localhost:5001/applyDifficulty

curl -H "Content-type:application/json" --data '{"difficulty" : 6}' http://localhost:5002/applyDifficulty

curl -H "Content-type:application/json" --data '{"difficulty" : 6}' http://localhost:5003/applyDifficulty

Add Block
==========================================================

curl -H "Content-type:application/json" --data '{"data" : "Here goes my first block to the chain!"}' http://localhost:5001/addBlock


Get blockchain ledger
==========================================================
curl http://localhost:5001/blocks

curl http://localhost:5002/blocks

curl http://localhost:5003/blocks


Add peer
==========================================================

curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:9002"}' http://localhost:5001/addPeer

curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:9003"}' http://localhost:5001/addPeer

curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:9001"}' http://localhost:5002/addPeer

curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:9003"}' http://localhost:5002/addPeer

curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:9001"}' http://localhost:5003/addPeer

curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:9002"}' http://localhost:5003/addPeer


Query connected peers
==========================================================
curl http://localhost:5001/peers


Util
==========================================================
lsof -i :5001

