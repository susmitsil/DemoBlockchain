import { Component } from '@angular/core';
import { BlockchainService } from './blockchain.service';
import * as CryptoJS from 'crypto-js';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mychain-ui';
  blocks:any=[];
  transactionData='';
  hostPort=5001;
  hostIp="localhost";
  hostAddress="http://localhost:5001";
  peers:any=[];
  peerHostIp="localhost";
  peerHostPort=9002;
  difficultyLevel=2;



  constructor(private _blockchainService: BlockchainService, private spinner: NgxSpinnerService){
    this.getAllBlocks();
    this.getAllPeers();
  }

  showSpinner(ms){
    /** spinner starts on init */
    this.spinner.show();
    if(ms>0){
      setTimeout(() => {
        /** spinner ends after 5 seconds */
        this.spinner.hide();
      }, ms);
    }
    
  }

  applyConfig(){
    this.showSpinner(1000);
    this.hostAddress = "http://"+this.hostIp +":"+ this.hostPort;
    this.applyDifficulty();
    this.getAllBlocks();
    this.getAllPeers();
  }

  isAllZero(text){
    for(var i=0;i<text.length;i++){
        if(text.charAt(i)!=='0'){
            return false;
        }
    }
    return true;
  }

  reCalculateHash(currBlock){

    console.log('Recalculating Hash for :'+ this.blocks[currBlock.index].data);
    var prevHash = "";
    this.blocks.forEach(block => {
      if(prevHash !==""){
        block.previousHash = prevHash;
      }
      var hash = CryptoJS.SHA256(block.index + block.proof + block.previousHash + block.timestamp + block.data).toString();
      block.hash = hash;
      
      if(this.isAllZero(hash.substring(0,block.difficulty))===false)
        block.isValid = false;
      else
        block.isValid = true;

      prevHash = hash;
    });
  
  }

  getAllBlocks(){
    return this._blockchainService.getAllBlocks(this.hostAddress).subscribe(
      data => {
        console.log('All Blocks Fetched');
        this.blocks=data;
      },
      err => {
        console.error(err);
      }
    );
  }

  getAllPeers(){
    return this._blockchainService.getAllPeers(this.hostAddress).subscribe(
      data => {
        console.log('All Peers fetched');
        this.peers = data;
      },
      err => {
        console.error(err);
      }
    );
  }

  addBlock(){
    this.showSpinner(0);
    console.log("Introducing new block, Transaction data: "+ this.transactionData);

    this._blockchainService.addTransaction(this.hostAddress, this.transactionData).subscribe(
      data => {
        console.log('Add transaction: '+ data);
        this.getAllBlocks();
        this.spinner.hide();
      },
      err => {
        console.error(err);
      },
      ()=>{
        console.log('Block added');
      }
    ); 
  }

  addPeer(){
    this.showSpinner(1000);
    this.hostAddress="http://"+this.hostIp +":"+this.hostPort;
    var peerAddress="ws://"+this.peerHostIp +":"+this.peerHostPort;

    console.log("Introducing new peer, Peer data: "+ this.hostAddress +":"+peerAddress);


    return this._blockchainService.addPeer(this.hostAddress, peerAddress).subscribe(
      data => {
        console.log('Add a peer: '+ data);
        this.getAllPeers();
      },
      err => {
        console.error(err);
      },
      ()=>{
        console.log('Peer added');
      }
    ); 
  }

  initializeBlockchain(){
    this.showSpinner(1000);
    return this._blockchainService.initializeBlockchain(this.hostAddress, this.difficultyLevel).subscribe(
      data => {
        console.log('Initialize blockchain');
        this.getAllBlocks();
      },
      err => {
        console.error(err);
      },
      ()=>{
        console.log('Blockchain initialized');
      }
    );
  }

  applyDifficulty(){
    return this._blockchainService.applyDifficulty(this.hostAddress, this.difficultyLevel).subscribe(
      data => {
        console.log('Blockchain Diffuclty applied: '+ this.difficultyLevel);
        this.getAllBlocks();
      },
      err => {
        console.error(err);
      }
    );
  }

  getGenesisBlock(){
    return this._blockchainService.getGenesisBlock(this.hostAddress).subscribe(
      data => {
        console.log('Fetching Genesis Block: '+ data);
      },
      err => {
        console.error(err);
      },
      ()=>{
        console.log('Genesis block fetched');
      }
    );
  }
}
