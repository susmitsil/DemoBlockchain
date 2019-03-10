# MychainUi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.4.

## Installation
npm install

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Steps to execute
 
Step 1  : Ensure that t2o peers are running based on the commands provided under Mychain REST API 
Step 2  : Open at least two browser instances for each peer
Step 3  : On both instances run "http://localhost:4200/"
Step 4  : On first instance expand "Blockchain Setup" and invoke "Initialize Blockchain" button to initialize genesis block
Step 5  : On second instance expand "Blockchain Setup" and change the port to 5002 i.e. for second peer 
Step 6  : On second instance invoke "Initialize Blockchain" button to initialize genesis block on second peer
Step 7  : On first instance expand "Ledger Details" section to view the genesis block
Step 8  : On first instance expand "Add Peer Section" section
Step 9  : Ensure on "Peer Host Port" field 9002 is applied
Step 10 : Now click on Add button to add the second peer to join first's network
Step 11 : Expand "Blockchain Entry Section"
Step 12 : Enter some data on Block Payload field and click Add
Step 13 : Expand "Ledger Details" section to view the newly created block
Step 14 : On second instance, click refresh link next to "Ledger Details" section and expand it
Step 15 : On second instance will be able view the newly created block from first peer
Step 16 : On any instance try making any change on any of teh fields under "Ledger Details" section 
Step 17 : All of the affected blocks will become invalid and will appear in "Red"
Step 18 : On both instances under "Blockchain Setup" setion change difficulty level to 3 and click "Apply Configuration"
Step 19 : Now on creating blocks you will notice that teh hashes generated will have 3 zeros as prefix
Step 20 : Thus teh overall difficulty has increased
