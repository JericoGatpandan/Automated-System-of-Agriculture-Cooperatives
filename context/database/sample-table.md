## **Sample Tables** {#sample-tables}

| Role |  |
| :---- | :---- |
| **roleID** | **roleName** |
| **PK, SA, NN, ND, NC** | NN, ND |
| **1** | FACCS Admin |
| **2** | Coop Officer |
| **3** | Farmer |

| User |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **userID** | **roleID** | **email** | **password\_hash** | **createdAt** | **isDeleted** |
| **PK, UA** | FK, NN, NC | NN, ND | NN | NN | NN |
| **1** | 1 | faccs.admin@faccs.ph | $2b$12$hashed\_A | 2024-01-10 | FALSE |
| **2** | 2 | cmpc.officer@cmpc.coop | $2b$12$hashed\_B | 2024-01-15 | FALSE |
| **3** | 3 | juan.dela.cruz@farmer.ph | $2b$12$hashed\_C | 2024-02-01 | FALSE |
| **4** | 2 | mmpc.officer@mmpc.coop | $2b$12$hashed\_D | 2024-02-10 | FALSE |
| **5** | 3 | pedro.santos@farmer.ph | $2b$12$hashed\_E | 2024-03-05 | FALSE |

| PrimaryCooperative |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **coopID** | **userID** | **coopName** | **barangay** | **municipality** | **phone** | **registrationNumber** | **isDeleted** | **createdAt** |
| **PK, SA, NN, ND, NC** | FK, NN, ND | NN, ND | NN | NN |  | NN, ND | **NN** | **NN** |
| **1** | 2 | CamSur Multi-Purpose Cooperative (CMPC) | Poblacion | Pili | 9171234567 | CDA-9520-001 | **FALSE** | **2024-01-15** |
| **2** | 4 | Magarao Multi-Purpose Cooperative (MMPC) | Magarao Centro | Magarao | 9182345678 | CDA-9520-002 | **FALSE** | **2024-01-20** |
| **3** | 6 | San Agustin-San Ramon Agrarian Reform Farmers Cooperative (SARFC) | San Agustin | Bula | 9193456789 | CDA-9520-003 | **FALSE** | **2024-02-01** |
| **4** | 8 | Lirag Agrarian Reform Farmer Beneficiaries Cooperative (LARFBCO) | Lirag | Bula | 9204567890 | CDA-9520-004 | **FALSE** | **2024-02-05** |
| **5** | 10 | Sampaloc Multi-Purpose Cooperative (SMPC) | Sampaloc | Gainza | 9215678901 | CDA-9520-005 | **FALSE** | **2024-02-10** |

| Product |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **productID** | **farmerID** | **cropTypeID** | **unitPrice** | **availableQuantity** | **qualityGrade** | **isDeleted** | **updatedAt** |
| **PK, SA, NN, ND, NC** | FK, NN | FK, NN | NN | NN | NN | NN | NN |
| **1** | 1 | 1 | 25 | 500 | Grade A | FALSE | 2024-09-01 |
| **2** | 2 | 4 | 15 | 200 | Grade B | FALSE | 2024-09-05 |
| **3** | 3 | 1 | 24 | 300 | Grade A | FALSE | 2024-09-10 |
| **4** | 4 | 2 | 18 | 400 | Grade A | FALSE | 2024-09-12 |
| **5** | 5 | 3 | 12 | 600 | Grade B | FALSE | 2024-09-15 |

| Farmer |  |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **farmerID** | **userID** | **firstName** | **middleName** | **lastName** | **suffixName** | **farmName** | **municipality** | **barangay** | **isDeleted** | createdAt |
| **PK, SA, NN, ND, NC** | FK, ND | NN |  | NN |  |  | NN | NN | NN | NN |
| **1** | 3 | Juan | Reyes | Dela Cruz |  | Dela Cruz Farm | Bula | Sagrada | FALSE | 2024-02-01 |
| **2** | 5 | Pedro | Lim | Santos | Jr. | Santos Organic Farm | Pili | San Agustin | FALSE | 2024-03-05 |
| **3** | 7 | Maria | Cruz | Villanueva |  | Villanueva Rice Farm | Magarao | San Miguel | FALSE | 2024-03-10 |
| **4** | 9 | Roberto |  | Navarro |  | Navarro Farm | Gainza | Sampaloc | FALSE | 2024-03-15 |
| **5** | 11 | Ligaya | Morales | Garcia |  | Garcia Coco Farm | Bula | Cabangal | FALSE | 2024-04-01 |

| CropType |  |  |
| :---- | :---- | :---- |
| **cropTypeID** | **cropName** | **category** |
| **PK, SA, NN, ND, NC** | NN, ND | NN |
| **1** | Rice | Grain |
| **2** | Corn | Grain |
| **3** | Coconut | Plantation Crop |
| **4** | Vegetables | Horticulture |
| **5** | Pandan | Industrial Crop |

| FarmerCooperative |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| **farmerCoopID** | farmerID | primaryCoopID | joinedDate | status |
| **PK, SA, NN, ND, NC** | FK1, NN | FK2, NN | NN | NN |
| **1** | 1 | 3 | 2022-06-01 | active |
| **2** | 2 | 1 | 2021-09-15 | active |
| **3** | 3 | 2 | 2023-01-10 | active |
| **4** | 4 | 5 | 2023-03-20 | active |
| **5** | 5 | 4 | 2022-11-05 | inactive |

| BuyerOrder |  |  |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **orderID** | **managedBy** | **buyerName** | **buyerCompany** | **buyerContact** | **cropTypeID** | **requestedQuantity** | **urgencyLevel** | **orderDate** | **status** | **notes** |
| **PK, SA, NN, ND, NC** | FK, NN | NN |  | NN | FK, NN | NN | NN | NN | NN |  |
| **1** | 1 | NFA Regional Office | National Food Authority | 9171110001 | 1 | 2000 | high | 2024-09-01 | inProgress | Urgent rice procurement |
| **2** | 1 | PhilRice | Philippine Rice Research Inst. | 9172220002 | 1 | 1000 | normal | 2024-09-05 | assigned | Research-grade rice |
| **3** | 1 | Bigg's Inc. | Bigg's Diner Chain | 9173330003 | 4 | 300 | normal | 2024-09-10 | pending | Fresh vegetables |
| **4** | 1 | Camsur Provincial Gov. | Provincial Agriculture Office | 9174440004 | 2 | 500 | high | 2024-09-12 | consolidated | Corn for seedling dist. |
| **5** | 1 | Kadiwa ng Pangulo | DA-KADIWA Program | 9175550005 | 3 | 1500 | normal | 2024-09-15 | pending | Coconut products |

| CoopAssignment |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **assignmentID** | **orderID** | **primaryCoopID** | **assignedBy** | **assignedDate** | **quantityRequired** | **status** |
| **PK, SA, NN, ND, NC** | FK, NN | FK, NN | FK, NN | NN | NN | NN |
| **1** | 1 | 3 | 1 | 2024-09-02 | 800 | matched |
| **2** | 1 | 4 | 1 | 2024-09-02 | 700 | matched |
| **3** | 1 | 1 | 1 | 2024-09-02 | 500 | ready |
| **4** | 2 | 2 | 1 | 2024-09-06 | 1000 | pending |
| **5** | 3 | 5 | 1 | 2024-09-11 | 300 | pending |

| FarmerFulfillment |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **fulfillmentID** | **assignmentID** | **farmerID** | **assignedBy** | **quantityCommitted** | **status** | **notes** |
| **PK, SA, NN, ND, NC** | FK, NN | FK, NN | FK, NN | NN | NN |  |
| **1** | 1 | 1 | 2 | 400 | confirmed | Ready for pickup |
| **2** | 1 | 5 | 2 | 400 | ready | Bagged and labeled |
| **3** | 2 | 3 | 4 | 700 | assigned | Awaiting farmer confirmation |
| **4** | 3 | 2 | 2 | 500 | confirmed | Will deliver Sept 20 |
| **5** | 5 | 4 | 10 | 300 | assigned | Fresh harvest available |

| DeliveryRecord |  |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **deliveryID** | **orderID** | **managedBy** | **consolidationDate** | **deliveryDate** | **totalTransactionAmount** | **commissionRateFederation** | **commissionRateCoop** | **status** | **notes** |
| **PK, SA, NN, ND, NC** | FK, NN | FK, NN | NN |  | NN | NN | NN | NN |  |
| **1** | 1 | 1 | 2024-09-20 | 2024-09-22 | 45000 | 0.03 | 0.05 | delivered | Full delivery for Order 1 |
| **2** | 2 | 1 | 2024-09-25 | 2024-09-27 | 25000 | 0.03 | 0.05 | delivered | PhilRice delivery |
| **3** | 3 | 1 | 2024-09-28 |  | 7500 | 0.03 | 0.05 | pending | Vegetable delivery pending |
| **4** | 4 | 1 | 2024-09-18 | 2024-09-19 | 10000 | 0.03 | 0.05 | delivered | Corn delivery complete |
| **5** | 1 | 1 | 2024-09-22 | 2024-09-23 | 15000 | 0.03 | 0.05 | delivered | Partial delivery – Order 1 |

## **DATA DICTIONARY** {#data-dictionary}

**ASAC-Database** \= Role-Table \+ User-Table \+ PrimaryCooperative-Table \+ Farmer-Table \+  
                CropType-Table \+ Product-Table \+ FarmerCooperative-Table \+  
                BuyerOrder-Table \+ CoopAssignment-Table \+ FarmerFulfillment-Table \+  
                DeliveryRecord-Table \+ FarmerAccount-Table \+ SalesRecord-Table \+  
                FeeRecord-Table \+ LoanRecord-Table \+ PrintedStatement-Table

**Role-Table** \= @roleID \+ roleName  
roleID  \= Number \* Long Integer  
roleName  \= 1{Legal-Character}50  
            Legal Character \= \[a-z | A-Z | 0-9 | \- | \_ | \]

**User-Table** \= @userID \+ roleID \+ email \+ password\_hash \+ createdAt \+ isDeleted  
userID \= Number \* Long Integer  
roleID \= \* FK from Role-Table in column roleID  
email \= 1{Legal-Character}100  
                Legal Character \= \[a-z | A-Z | 0-9 | @ | . | \_ | \-\]  
password\_hash \= 1{Legal-Character}255  
                Legal Character \= \[a-z | A-Z | 0-9 | $ | . | /\]  
createdAt \= Legal-Date \* "yyyy-mm-dd hh:mm:ss"  
isDeleted \= Number \* Boolean  
                Legal Character \= \[0 | 1\]

**PrimaryCooperative-Table** \= @primaryCoopID \+ userID \+ coopName \+ barangay \+  
                            municipality \+ phone \+ registrationNumber \+ createdAt \+ isDeleted  
primaryCoopID \= Number \* Long Integer  
userID   \= \* FK from User-Table in column userID  
coopName \= 1{Legal-Character}100  
                     Legal Character \= \[a-z | A-Z | 0-9 | . | \- | ( | ) | \]  
barangay \= 1{Legal-Character}100  
                     Legal Character \= \[a-z | A-Z | 0-9 | . | \- | \]  
municipality \= 1{Legal-Character}100  
                     Legal Character \= \[a-z | A-Z | 0-9 | . | \- | \]  
phone \= 1{Legal-Character}20  
                     Legal Character \= \[0-9 | \+ | \- | \]  
registrationNumber \= 1{Legal-Character}50  
                     Legal Character \= \[a-z | A-Z | 0-9 | \- | \]  
createdAt \= Legal-Date \* "yyyy-mm-dd hh:mm:ss"  
isDeleted \= Number \* Boolean  
                     Legal Character \= \[0 | 1\]

**Farmer-Table** \= @farmerID \+ userID \+ firstName \+ (middleName) \+ lastName \+  
               (suffixName) \+ farmName \+ municipality \+ barangay \+ createdAt \+ isDeleted  
farmerID \= Number \* Long Integer  
userID \=  \* FK from User-Table in column userID  
firstName   \= 1{Legal-Character}50  
middleName \= 1{Legal-Character}50 (optional)  
lastName \= 1{Legal-Character}50  
               Legal Character \= \[a-z | A-Z | . | \- | \]  
suffixName  \= 1{Legal-Character}10 (optional)  
               Legal Character \= \[a-z | A-Z | . | \]  
               Suffix \= \["Jr." | "Sr." | "II" | "III"\]  
farmName \= 1{Legal-Character}100  
               Legal Character \= \[a-z | A-Z | 0-9 | . | \- | \]  
municipality \= 1{Legal-Character}100  
                     Legal Character \= \[a-z | A-Z | 0-9 | . | \- | \]  
barangay \= 1{Legal-Character}100  
                     Legal Character \= \[a-z | A-Z | 0-9 | . | \- | \]  
createdAt   \= Legal-Date \* "yyyy-mm-dd hh:mm:ss"  
isDeleted   \= Number \* Boolean  
               Legal Character \= \[0 | 1\]

**CropType-Table** \= @cropTypeID \+ cropName \+ category  
cropTypeID \= Number \* Long Integer  
cropName \= 1{Legal-Character}50  
             Legal Character \= \[a-z | A-Z | 0-9 | . | \- | \]  
category \= 1{Legal-Character}50  
             Legal Character \= \[a-z | A-Z | 0-9 | . | \- | \]

**Product-Table** \= @productID \+ farmerID \+ cropTypeID \+ unitPrice \+  
                availableQuantity \+ qualityGrade \+ updatedAt \+ isDeleted  
productID   \= Number \* Long Integer  
farmerID \= \* FK from Farmer-Table in column farmerID  
cropTypeID \= \* FK from CropType-Table in column cropTypeID  
unitPrice   \= Number \* Double(10,2)  
availableQuantity \= Number \* Long Integer  
qualityGrade \= 1{Legal-Character}10  
                    Legal Character \= \[A | B | C\]  
updatedAt   \= Legal-Date \* "yyyy-mm-dd hh:mm:ss"  
isDeleted   \= Number \* Boolean  
                    Legal Character \= \[0 | 1\]

**FarmerCooperative-Table** \= @farmerCoopID \+ farmerID \+ primaryCoopID \+ joinedDate \+ status  
farmerCoopID \= Number \* Long Integer  
farmerID \= \* FK from Farmer-Table in column farmerID  
primaryCoopID  \= \* FK from PrimaryCooperative-Table in column primaryCoopID  
joinedDate \= Legal-Date \* "yyyy-mm-dd"  
status   \= Legal-Character  
                 Legal Character \= \[active | inactive | suspended\]

**BuyerOrder-Table** \= @orderID \+ managedBy \+ buyerName \+ buyerCompany \+ buyerContact \+ cropTypeID \+ requestedQuantity \+ urgencyLevel \+ orderDate \+ status \+ (notes)  
orderID \= Number \* Long Integer  
managedBy   \= \* FK from User-Table in column userID  
buyerName   \= 1{Legal-Character}100  
                    Legal Character \= \[a-z | A-Z | . | \- | \]  
buyerCompany \= 1{Legal-Character}100  
                    Legal Character \= \[a-z | A-Z | 0-9 | . | \- | ( | ) | \]  
buyerContact \= 1{Legal-Character}50  
                    Legal Character \= \[0-9 | \+ | \- | \]  
cropTypeID \= \* FK from CropType-Table in column cropTypeID  
requestedQuantity \= Number \* Long Integer  
urgencyLevel \= Legal-Character  
                    Legal Character \= \[low | normal | high\]  
orderDate   \= Legal-Date \* "yyyy-mm-dd"  
status \= Legal-Character  
                    Legal Character \= \[pending | assigned | consolidated | delivered | cancelled\]  
notes \= 1{Legal-Character}unlimited (optional)  
                    Legal Character \= \[a-z | A-Z | 0-9 | , | . | \- | \]

**CoopAssignment-Table** \= @assignmentID \+ orderID \+ primaryCoopID \+ assignedBy \+  
                        assignedDate \+ quantityRequired \+ status  
assignmentID \= Number \* Long Integer  
orderID \= \* FK from BuyerOrder-Table in column orderID  
primaryCoopID   \= \* FK from PrimaryCooperative-Table in column primaryCoopID  
assignedBy \= \* FK from User-Table in column userID  
assignedDate \= Legal-Date \* "yyyy-mm-dd"  
quantityRequired \= Number \* Long Integer  
status \= Legal-Character  
                   Legal Character \= \[pending | matched | ready | cancelled\]

**FarmerFulfillment-Table** \= @fulfillmentID \+ assignmentID \+ farmerID \+ assignedBy \+  
                           quantityCommitted \+ status \+ (notes)  
fulfillmentID \= Number \* Long Integer  
assignmentID \= \* FK from CoopAssignment-Table in column assignmentID  
farmerID \= \* FK from Farmer-Table in column farmerID  
assignedBy \= \* FK from User-Table in column userID  
quantityCommitted \= Number \* Long Integer  
status \= Legal-Character  
                    Legal Character \= \[assigned | confirmed | ready | delivered | cancelled\]  
notes  \= 1{Legal-Character}unlimited (optional)  
                    Legal Character \= \[a-z | A-Z | 0-9 | , | . | \- | \]

**DeliveryRecord-Table** \= @deliveryID \+ orderID \+ managedBy \+ consolidationDate \+ deliveryDate \+ totalTransactionAmount \+ commissionRateFederation \+ commissionRateCoop \+ status \+ (notes)  
deliveryID \= Number \* Long Integer  
orderID     \= \* FK from BuyerOrder-Table in column orderID  
managedBy   \= \* FK from User-Table in column userID  
consolidationDate   \= Legal-Date \* "yyyy-mm-dd"  
deliveryDate \= Legal-Date \* "yyyy-mm-dd"  
totalTransactionAmount   \= Number \* Double(12,2)  
commissionRateFederation \= Number \* Double(5,2) \* \[0.00 \- 1.00\]  
commissionRateCoop \= Number \* Double(5,2) \* \[0.00 \- 1.00\]  
status      \= Legal-Character  
                            Legal Character \= \[pending | delivered | cancelled\]  
notes       \= 1{Legal-Character}unlimited (optional)  
                            Legal Character \= \[a-z | A-Z | 0-9 | , | . | \- | \]

**FarmerAccount-Table** \= @farmerAccountID \+ farmerID \+ primaryCoopID \+ createdDate \+ status  
farmerAccountID \= Number \* Long Integer  
farmerID \= \* FK from Farmer-Table in column farmerID  
primaryCoopID \= \* FK from PrimaryCooperative-Table in column primaryCoopID  
createdDate \= Legal-Date \* "yyyy-mm-dd"  
status \= Legal-Character  
                  Legal Character \= \[active | inactive | suspended\]

**SalesRecord-Table** \= @salesRecordID \+ farmerAccountID \+ deliveryID \+ grossAmount \+  
                     commissionAmount \+ netAmount \+ transactionDate \+ (remarks)  
salesRecordID   \= Number \* Long Integer  
farmerAccountID \= \* FK from FarmerAccount-Table in column farmerAccountID  
deliveryID \= \* FK from DeliveryRecord-Table in column deliveryID  
grossAmount \= Number \* Double(12,2)  
commissionAmount \= Number \* Double(12,2)  
netAmount \= Number \* Double(12,2)  
transactionDate \= Legal-Date \* "yyyy-mm-dd"  
remarks \= 1{Legal-Character}unlimited (optional)  
                   Legal Character \= \[a-z | A-Z | 0-9 | , | . | \- | \]

**FeeRecord-Table** \= @feeRecordID \+ farmerAccountID \+ salesRecordID \+ feeType \+ rate \+ amount \+ status  
feeRecordID \= Number \* Long Integer  
farmerAccountID \= \* FK from FarmerAccount-Table in column farmerAccountID  
salesRecordID \= \* FK from SalesRecord-Table in column salesRecordID  
feeType   \= Legal-Character  
                  Legal Character \= \[federationFee | coopFee | capitalContribution | capitalRetention\]  
rate \= Number \* Double(5,2) \* \[0.00 \- 1.00\]  
amount \= Number \* Double(12,2)  
status \= Legal-Character  
                  Legal Character \= \[recorded | waived\]

**LoanRecord-Table** \= @loanRecordID \+ farmerAccountID \+ loanAmount \+ purpose \+ releaseDate \+ dueDate \+ amountRepaid \+ outstandingBalance \+ status \+ approvedBy  
loanRecordID \= Number \* Long Integer  
farmerAccountID \= \* FK from FarmerAccount-Table in column farmerAccountID  
loanAmount \= Number \* Double(12,2)  
purpose \= 1{Legal-Character}100  
                    Legal Character \= \[a-z | A-Z | 0-9 | . | \- | \]  
releaseDate \= Legal-Date \* "yyyy-mm-dd"  
dueDate \= Legal-Date \* "yyyy-mm-dd"  
amountRepaid \= Number \* Double(12,2)  
outstandingBalance \= Number \* Double(12,2)  
status \= Legal-Character  
                    Legal Character \= \[active | partial | paid | overdue\]  
approvedBy \= \* FK from User-Table in column userID

**PrintedStatement-Table** \= @printedStatementID \+ farmerAccountID \+ periodStart \+ periodEnd \+ generatedBy \+ generatedDate \+ totalGrossSales \+ totalCommission \+ totalShareCapital \+ totalLoans \+ netBalance  
printedStatementID \= Number \* Long Integer  
farmerAccountID   \= \* FK from FarmerAccount-Table in column farmerAccountID  
periodStart \= Legal-Date \* "yyyy-mm-dd"  
periodEnd \= Legal-Date \* "yyyy-mm-dd"  
generatedBy \= \* FK from User-Table in column userID  
generatedDate \= Legal-Date \* "yyyy-mm-dd"  
totalGrossSales   \= Number \* Double(12,2)  
totalCommission   \= Number \* Double(12,2)  
totalShareCapital  \= Number \* Double(12,2)  
totalLoans   \= Number \* Double(12,2)  
netBalance   \= Number \* Double(12,2)