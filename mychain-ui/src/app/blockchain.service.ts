import {Injectable} from '@angular/core'
import {HttpClient, HttpHeaders} from '@angular/common/http';


const httpOptions = {
    headers: new HttpHeaders({'Content-Type':'application/json'})
}


@Injectable()
export class BlockchainService{
    constructor(private http:HttpClient){

    }

    getAllBlocks(hostAddress){
        return this.http.get(hostAddress+'/blocks');
    }

    getAllPeers(hostAddress){
        return this.http.get(hostAddress+'/peers');
    }

    addTransaction(hostAddress, blockData){
        let body = {"data":JSON.stringify(blockData)};
        return this.http.post(hostAddress+'/addBlock', body, httpOptions);
    }

    initializeBlockchain(hostAddress, difficulty){
        let body = {"difficulty":difficulty};
        return this.http.post(hostAddress+'/initializeBlockchain', body, httpOptions);
    }

    applyDifficulty(hostAddress, difficulty){
        let body = {"difficulty":difficulty};
        return this.http.post(hostAddress+'/applyDifficulty', body, httpOptions);
    }

    getGenesisBlock(hostAddress){
        return this.http.get(hostAddress+'/genesisBlock');
    }

    addPeer(hostAddress, peerAddress){
        let body = {"peer":peerAddress};
        return this.http.post(hostAddress+'/addPeer', body, httpOptions);
    }
}