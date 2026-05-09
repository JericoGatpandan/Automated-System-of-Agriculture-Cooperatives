#

# **Project Specification: Automated System of Agriculture Cooperatives (ASAC)**

In Partial Fulfillment for  
Database Management (Info Mgt) 2

Jerico C. Gatpandan  
Thatiana Nicole R. Calma  
Frence Sherwin S. Triste

Maria Arka Danila  
**Professor**

**Table of Contents**

[I. Establishment Analysis 4](#establishment-analysis)

[Establishment Name: “Federation of Agriculture Cooperatives in Camarines Sur” 4](#establishment-name:-“federation-of-agriculture-cooperatives-in-camarines-sur”)

[Background: 4](#background:)

[Nature of Business / Key Processes: 4](#nature-of-business-/-key-processes:)

[Size: 5](#size:)

[Identified Problem/Inefficiency: 6](#identified-problem/inefficiency:)

[II. App Proposal: Automated System of Agriculture Cooperatives (ASAC) 7](#app-proposal:-accounting-system-of-agriculture-cooperatives-\(asac\))

[1\. Problem Statement: 7](#problem-statement:)

[2\. Proposed Solution: 9](#proposed-solution:)

[3\. Key Features: 10](#key-features:)

[4\. Conceptual Database Design: 12](#4.-conceptual-database-design:)

[Core Entities 12](#core-entities)

[Transaction Entities 13](#transaction-entities)

[FarmLedger Accounting Entities 13](#farmledger-accounting-entities)

[Commission Calculation Model 14](#commission-calculation-model)

[Proportional Allocation of Delivery Amount 14](#proportional-allocation-of-delivery-amount)

[Relationships: 15](#relationships:)

[5\. Justification / Benefits: 18](#5.-justification-/-benefits:)

[III. Business Rules (Per transaction/processes) 20](#business-rules-\(per-transaction/processes\))

1. ## **Establishment Analysis**  {#establishment-analysis}

#### **Establishment Name: “Federation of Agriculture Cooperatives in Camarines Sur”**  {#establishment-name:-“federation-of-agriculture-cooperatives-in-camarines-sur”}

#### **Background:**  {#background:}

FACCS is a secondary cooperative federation established in 2019 with the vision to unify agriculture cooperatives in the Province of Camarines Sur. As a secondary cooperative, FACCS does not directly manage farmers or conduct agricultural production; it oversees, supports, and unifies its 18 primary member cooperatives. FACCS holds events such as programs, inspections, and training sessions to support cooperatives and their farmer-members throughout the province. FACCS is registered with the Cooperative Development Authority and is headquartered in Naga City, Camarines Sur. A critical distinction is that FACCS and its primary cooperatives are structured not to compete with each other. FACCS helps its member cooperatives grow their businesses by managing federation-level logistics, consolidating orders from buyers, coordinating deliveries, and maintaining federation-wide records functions that individual cooperatives cannot perform at scale on their own.

#### **Nature of Business / Key Processes:** {#nature-of-business-/-key-processes:}

FACCS operates as a two-tier cooperative structure with clearly defined responsibilities at each level.

At the Federation Level (FACCS): FACCS manages logistics and consolidation for orders that need to be processed across cooperatives. It receives buyer orders, records and distributes referrals to the appropriate primary cooperatives, coordinates and manages harvest delivery from cooperatives to buyers, and maintains federation-wide records of data across all 18 cooperatives.

At the Primary Cooperative Level: Each of the 18 primary cooperatives manages its own farmer-members, farmer loans, and harvest records. Cooperatives receive referrals from FACCS, find the best farmer-supplier from their membership, coordinate farmer harvests, and manage thousands of farmer records and financial data. Each cooperative also handles internal transactions where one farmer-member purchases from a fellow farmer within the same cooperative independently of FACCS.

At the Farmer Level: Farmers plant crops and look to their cooperative to connect them with buyers. They update their cooperatives on planting progress and harvest readiness, and maintain their information within the cooperative for credibility and loan eligibility. Farmers are not system users, all their data is managed on their behalf by cooperative officers.

At the Buyer Level: Buyers find suppliers through FACCS or the primary cooperatives. They submit their crop needs, manage their requested orders, and provide their business information to the federation. Buyers are not system users; their requests and information are logged by FACCS Admin or cooperative officers on their behalf.

#### **Size:**  {#size:}

FACCS holds 18 primary cooperatives with an estimated 10,000 total members. Three-quarters (approximately 6,750 to 7,500) are active farmer-members. The remaining quarter consists of non-farmer community members, institutional members, and participants in multipurpose, credit, agri, irrigator associations, hospitals such as the Naga Imaging Center Cooperative (NICC), and organic fisheries cooperatives.

**Approximate Number of Employees:**

The non-farmer quarter of 10,000 membership includes institutional members, and participants in multipurpose and credit cooperative staff, agri cooperative officers, irrigators association staff, hospitals such as Naga Imaging Center Cooperative (NICC) and organic fisheries cooperatives. Each primary cooperative has its own designated officer who manages farmer records, coordinates harvest matching, and oversees cooperative finances independently. FACCS as the secondary federation maintains oversight of all 18 cooperatives and handles federation-level order management and logistics without directly intervening in individual cooperative operations. A 10% commission is applied to all transactions. For external transactions managed through FACCS, this commission is split between the federation and the primary cooperative at rates to be confirmed. For internal cooperative transactions between farmer-members, a separate commission rate applies, also to be confirmed. Within the cooperative's share, a portion goes to the farmer's Share Capital as a permanent investment broken down as a capital contribution rate and a retention rate with the remainder as the cooperative's service fee.

#### **Identified Problem/Inefficiency:**  {#identified-problem/inefficiency:}

The following inefficiencies were identified and confirmed through direct interview with FACCS management on February 13, 2026:

* Seasonal and weather inconsistencies, including frequent typhoons, regularly disrupt planting cycles and harvest timelines with no system to track or adapt to these disruptions.  
* The absence of structured, relational transaction and financial recording across federation and cooperative levels.  
* Market linkage gaps leave farmers unable to sell produce beyond the local centro market. The cooperative's referral-and-matching process is entirely informal and unsystematized.  
* Chronic oversupply of rice and other high-quality crops occurs because farmers plant without visibility into what others are planting or what buyers actually need. While each primary cooperative operates its own Kadiwa store as a direct selling outlet, it cannot absorb the full harvest volume. Surplus produce is sometimes repurposed as chips, organic fertilizer, or animal feed, but a large portion is wasted or discarded. Farmers are forced into rush-selling at depressed prices or lose their harvest entirely.  
* Farmers are not accustomed to digital platforms. Many are elderly and traditional, and a significant number have no smartphones or reliable internet access.  
* Farmers earn very little and do not view digital tools as accessible or worth adopting without clear, immediate income benefit and community-assisted support.  
* Existing platforms in similar contexts have failed due to high operating costs and low farmer adoption, leaving no sustainable digital solution in place.  
* Lack of nearby markets results in buyer preference for cheaper imported goods over locally grown produce.  
* Neither buyers nor sellers are motivated to invest in delivery coordination, creating a logistical gap that further limits market reach.  
* No farmer-level financial records exist. There is no system for individual farmers to view their sales income, cooperative fees, loan balances, or planting expenses and no document they can bring to cooperative meetings or loan applications.

1. ## **App Proposal: Automated System of Agriculture Cooperatives (ASAC)** {#app-proposal:-accounting-system-of-agriculture-cooperatives-(asac)}

1. #### **Problem Statement:**  {#problem-statement:}

   The Federation of Agriculture Cooperatives in Camarines Sur (FACCS), a secondary cooperative established in 2019 and representing approximately 18 primary cooperatives and an estimated 6,000 to 7,000 active farmer members, faces a persistent and compounding set of market access and supply coordination challenges that significantly limit farmer’s economic potential in the Bicol Region.  
   Despite producing high-quality crops including rice, kamote, corn, coconut, okra, lemon, and langka FACCS member-farmers remain largely confined to selling at local centro markets and through their cooperative's Kadiwa store, a cooperative-managed outlet that provides farmers a direct selling point for their produce. While the Kadiwa offers some local market access, it is insufficient to absorb the full volume of harvest output. This restricted market reach, combined with uncoordinated planting cycles that ignore real

   buyer demand, regularly results in oversupply particularly of rice with no reliable mechanism to redirect the excess. When oversupply occurs, some produce is repurposed surplus crops may be processed into chips, converted into organic fertilizer, or used as animal feed but much of it is simply wasted or discarded entirely. Farmers are then forced into rush-selling at prices far below the value of their produce, or accept a total loss on crops that could not find a buyer in time.  
   A critical structural gap is the absence of a digital market linkage tool. DTI-published price guidelines exist but are not followed in practice, and farmers have no visibility into what buyers actually need or when. Existing buyers such as restaurants and institutional buyers already in the FACCS network transact on a purely informal, referral-based basis. The cooperative currently acts only as a matching body with no formal order management, supply planning, or financial recordkeeping infrastructure.  
   The technology barrier deepens the problem. A significant portion of FACCS farmer-members are traditional farmers who do not use smartphones or have access to reliable internet particularly in farming barangays. Previous digital initiatives in similar contexts stalled due to high platform costs and low farmer adoption. Farmers who already earn very little do not see digital tools as accessible without clear income benefits and community-assisted onboarding.  
   Additionally, there is a complete absence of farmer-level financial records. No farmer can view a summary of their own sales, fees owed to the cooperative, outstanding loan balance, or planting expenses. Cooperative officers must reconstruct each farmer's financial history manually whenever needed for audits, loan decisions, or FACCS inspection events.  
   Without a platform that bridges market demand with farmer supply in real time and a companion accounting module that gives every farmer a transparent, printable record of  
   their financial standing, FACCS farmer-members will continue to face oversupply losses, missed market opportunities, and exclusion from the benefits of cooperative membership.

1. #### **Proposed Solution:**  {#proposed-solution:}

   "ASAC" \- Automated System of Agriculture Cooperatives  
   ASAC is a digital cooperative management system built around two clearly defined modules that share one database. It is designed specifically for the two-tier structure of FACCS where 18 independent primary cooperatives each manage their own farmers, and FACCS serves as the oversight federation above them. The system is operated primarily by Primary Cooperative Officers on behalf of their farmer-members. This officer-operated model was chosen deliberately: the confirmed reality from the on-site interview is that most FACCS farmer-members are traditional farmers who do not own smartphones or have reliable internet access in their farming barangays. The system brings digital recordkeeping to the cooperative without requiring farmers to change how they work.  
   **Module 1 \- Order and Transaction Management.** Digitalizes the federation-level order management process and each cooperative's farmer matching and transaction recording. At the FACCS level, the Admin logs buyer orders, assigns them to cooperatives, and tracks delivery coordination. At the cooperative level, officers manage their farmer registry, receive assignments from FACCS, match the best farmer to each order, and confirm harvest readiness. Every completed delivery triggers the FarmLedger accounting chain automatically.  
   **Module 2 \- FarmLedger Accounting.** It gives every registered farmer a personal financial ledger that is automatically updated the moment a DeliveryRecord is marked Delivered in Module 1\. Sales income is recorded, the applicable commission is split and allocated automatically, the farmer's Share Capital grows as a permanent cooperative investment, loan records are managed by cooperative officers, and a printable Farmer Balance Sheet is generated on demand. This Balance Sheet showing total sales,

   commission breakdown, share capital accumulated, outstanding loans, and net balance is the primary output of the entire system.  
    The primary system users are the FACCS Admin (one account logs buyer orders, assigns to coops, manages delivery records) and Primary Cooperative Officers (one per cooperative, 18 total manages farmer registry, receives assignments, confirms transactions, manages loans). Farmers access the system in a view-only capacity to check their own ledger and balance. Buyers are never system users; their name, contact, and order details are logged by the FACCS Admin on their behalf.

1. #### **Key Features:**  {#key-features:}

   **Referral Management Module**  
1. **User Authentication & Role-Based Access** \- Secure login with role-based access for three roles: FACCS Admin (federation-wide order management and delivery coordination), Primary Coop Officer (full management within their own cooperative only), and Farmer (view-only ledger access). Each role sees only what is relevant to their level of the cooperative structure.  
1. **Buyer Order Management (FACCS Level)** \- FACCS Admin logs incoming buyer orders (buyer name, company, contact, crop type, quantity, urgency). Each order is assigned to one or more primary cooperatives based on which cooperative has farmers with the requested crop. Assignments are tracked through statuses: Pending, Assigned, In Progress, Consolidated, Delivered, Cancelled.  
1. **Delivery & Consolidation Management (FACCS Level)** \- FACCS Admin records delivery coordination details when harvest is consolidated from the cooperative and delivered to the buyer. Marks the order as Delivered, which triggers commission recording at both federation and cooperative level.  
1. **Farmer Registry & Crop Listing (Cooperative Level)** \- Primary Coop Officers register and manage their farmer-members. Farmer profiles include personal

   details, farm information, available crops, and cooperative membership. A farmer may belong to multiple cooperatives. Officers also log available crop quantities per farmer, used when matching farmers to orders.

1. **Order Fulfillment Matching (Cooperative Level)** \- When FACCS assigns an order to a cooperative, the Coop Officer receives it, identifies the best available farmer from their registry, and records which farmer will fulfill the order. Status tracked: Pending, Matched, Ready, Cancelled.  
1. **Transaction Completion \-** When a DeliveryRecord is marked Delivered and the transaction amount is entered, the system automatically triggers the full FarmLedger accounting chain for the fulfilling farmer.

**FarmLedger Accounting Module**

1. **Farmer Ledger Dashboard** \- Each registered farmer has a personal financial dashboard showing: total gross sales, total commission deducted, share capital accumulated, net earnings, outstanding loans, and current balance. Automatically updated from every completed transaction in Module 1\.  
2. **Automatic Sales & Commission Recording** \- When a transaction is marked Completed, the system automatically creates a SalesRecord, generates FeeRecords for each commission component, and updates the farmer's Share Capital and current balance. No manual entry required by any user.  
3. **Share Capital Tracking** \- Tracks each farmer's permanent cooperative investment. Grows automatically with every completed transaction. Forms the basis for annual dividend calculation by cooperative officers.  
4. **Loan & Credit Management** \- Primary Coop Officers record loan releases and repayments per farmer. Outstanding balances are auto-calculated. Loan status updates automatically based on repayment progress: Active, Partial, Paid, Overdue  
5. **Printable Farmer Balance Sheet** \- One-page formatted document showing all sales, full commission breakdown, share capital balance, loans outstanding, and net balance for a selected period. Includes farmer name, cooperative name, date generated, and signature lines for farmer and officer. Designed for physical presentation at cooperative meetings, FACCS inspections, and loan applications.  
6. **FACCS Federation Overview** \- FACCS Admin can view a federation-wide summary across all 18 cooperatives: total external orders, total transactions completed, commissions collected at federation level, and aggregate farmer financial data per cooperative. Read-only \- FACCS cannot edit individual cooperative or farmer records.

#### **4\. Conceptual Database Design:**  {#4.-conceptual-database-design:}

##### **Core Entities** {#core-entities}

* **User (userID (PK)**, roleID (FK), email, password\_hash, createdAt, isDeleted)  
* **Role** (**roleID (PK)**, roleName)  
* **PrimaryCooperative** (**primaryCoopID (PK)**, userID (FK), coopName, barangay, municipality, phone, registrationNumber, isDeleted, createdAt)  
* **Farmer** (**farmerID (PK)**, userID (FK), firstName, middleName, lastName, suffixName, farmName, farmLocation, isDeleted, createdAt)  
* **CropType** (**cropTypeID (PK)**, cropName, category)  
* **Product** (**productID (PK)**, farmerID (FK), cropTypeID (FK), unitPrice, availableQuantity, qualityGrade, isDeleted, updatedAt)  
* **FarmerCooperative** (**farmerCoopID (PK)**, farmerID (FK), primaryCoopID (FK), joinedDate, status(active, inactive, suspended))

##### **Transaction Entities** {#transaction-entities}

* **BuyerOrder** (**orderID (PK)**, managedBy (FK) \- *userAdmin FACCS*, buyerName, buyerCompany, buyerContact, cropTypeID (FK), requestedQuantity , urgencyLevel, orderDate, status(pending, assigned, consolidated, delivered, cancelled), notes)  
* **CoopAssignment**(**assignmentID (PK)**, orderID (FK), primaryCoopID (FK), assignedBy (FK) \- userAdmin FACCS, assignedDate, quantityRequired, status(pending, matched, ready, cancelled))  
* **FarmerFulfillment**(**fulfillmentID (PK)**, assignmentID (FK), farmerID (FK), assignedBy (FK) \- *coopOfficer*, quantityCommitted, status(assigned, confirmed, ready, delivered, cancelled), notes)  
* **DeliveryRecord**(**deliveryID (PK)**, orderID (FK), managedBy (FK), consolidationDate, deliveryDate, totalTransactionAmount, commissionRateFederation, commissionRateCoop, status(pending, delivered, cancelled), notes)

##### **FarmLedger Accounting Entities** {#farmledger-accounting-entities}

* **FarmerAccount** (**farmerAccountID (PK),** farmerID(FK), primaryCoopID (FK), createdDate, status(active, inactive, suspended))  
* **SalesRecord** (**salesRecordID (PK)**, farmerAccountID (FK), deliveryID (FK), grossAmount, commissionAmount, netAmount, transactionDate, remarks)  
* **FeeRecord** (**feeRecordID (PK)**, farmerAccountID (FK), salesRecordID(FK), feeType(federationFee, coopFee, capitalContribution, capitalRetention), rate, amount, status(recorded, waived))  
* **LoanRecord** (**loanRecordID(PK),** farmerAccountID (FK), loanAmount, purpose, releaseDate, dueDate, amountRepaid, outstandingBalance, status (active, partial, paid, overdue), approvedBy(FK) \- *user*)  
* **PrintedStatement** (**printedStatementID (PK)**, farmerAccountID (FK),  periodStart, periodEnd, generatedBy (FK) \- *user*, generatedDate, totalGrossSales, totalCommission, totalShareCapital, totalLoans, netBalance)

##### **Commission Calculation Model** {#commission-calculation-model}

To ensure deterministic and consistent financial recording, ASAC follows the formula-based computation below:  
Let: *T \= totalTransactionAmount*  
*RF \= commissionRateFederation*  
*RC \= commissionRateCoop*  
Then: *FederationFee \= T × RF*  
*CooperativeFee \= T × RC*  
*NetAmount \= T − (FederationFee \+ CooperativeFee)*  
If a portion of the CooperativeFee is allocated to Share Capital:  
*ShareCapitalContribution \= CooperativeFee × capitalContributionRate*  
All calculated values are stored in the *SalesRecord* and *FeeRecord* tables to preserve financial auditability.

##### **Proportional Allocation of Delivery Amount** {#proportional-allocation-of-delivery-amount}

When a DeliveryRecord is fulfilled by multiple farmers, the totalTransactionAmount is distributed proportionally based on each farmer’s committed quantity:  
Let: *Qi \= quantityCommitted by a specific FarmerFulfillment*  
*QT \= totalFulfilledQuantity (sum of all quantityCommitted under the same DeliveryRecord)*  
*T \= totalTransactionAmount*  
Then: *GrossAmount per farmer \= (Qi / QT) × T*  
This computed GrossAmount becomes the *grossAmount* stored in each corresponding SalesRecord before commission deductions are applied.

##### **Relationships:**   {#relationships:}

1. **User — Role** **relationship**: *has*  
   User (0,N) — (1,1) Role  

- Each User has exactly one Role. A Role may be assigned to many Users.  

2. **User — PrimaryCooperative** **relationship**: *acts\_as*

   User (0,1) — (1,1) PrimaryCooperative

* Each User may act as one Primary Cooperative officer account. Each cooperative has exactly one officer user.  

3. **User — Farmer relationship**: *acts\_as*

   User (0,1) — (0,1) Farmer

* Each User may act as one Farmer account for view-only ledger access.  

4. **Farmer — Product relationship:** *lists*

   Farmer (0,N) — (1,1) Product

* A Farmer may list many available crop products. Each Product belongs to one Farmer.  

5. **Product — CropType relationship**: *categorized\_as*

   Product (1,1) — (0,N) CropType

* Each Product is classified under one CropType. A CropType may be referenced in many Products.  

6. **BuyerOrder — CoopAssignment relationship**: *assigned\_to*

   BuyerOrder (1,N) — (1,1) CoopAssignment

* A BuyerOrder may be assigned to one or more cooperatives. Each CoopAssignment belongs to one BuyerOrder.  

7. **CoopAssignment — PrimaryCooperative relationship**: *handled\_by*

   CoopAssignment (0,N) — (1,1) PrimaryCooperative

* Each CoopAssignment is handled by one cooperative. A cooperative may handle many assignments.  

8. **CoopAssignment — FarmerFulfillment relationship**: *fulfilled\_by*

   CoopAssignment (1,1) — (0,N) FarmerFulfillment

* A CoopAssignment may be fulfilled by zero or more farmers (until matched). Each FarmerFulfillment belongs to one assignment.  

9. **Farmer — FarmerFulfillment relationship:** *fulfills*

   Farmer (0,N) — (1,1) FarmerFulfillment

* A farmer may fulfill many assignments over time. Each FarmerFulfillment refers to one Farmer.  

10. **BuyerOrder — DeliveryRecord relationship:** *produces*

    BuyerOrder (1,1) — (1,N) DeliveryRecord

* One BuyerOrder may produce one or more DeliveryRecords (to support partial or staged deliveries). Each DeliveryRecord belongs to exactly one BuyerOrder.  

11. **Farmer — FarmerAccount relationship:** *has\_ledger*

    Farmer (1,N) — (1,1) FarmerAccount

* Each Farmer may have multiple FarmerAccounts, one per cooperative they belong to. Each account belongs to one farmer.  

12. **PrimaryCooperative — FarmerAccount relationship:** *holds*

    PrimaryCooperative (0,N) — (1,1) FarmerAccount

* A cooperative holds the ledger accounts of all its farmer-members.  

13. **FarmerAccount — SalesRecord relationship:** *records*

    FarmerAccount (1,1) — (0,N) SalesRecord

* A farmer account accumulates many sales records over time from both external and internal transactions.  

14. **Farmer — FarmerCooperative relationship:** *member\_of*

    Farmer (1,N) — (1,1) FarmerCooperative

* A farmer must be a member of at least one cooperative. Each membership record belongs to one farmer.  

15. **PrimaryCooperative — FarmerCooperative relationship:** *has\_member*

    PrimaryCooperative (0,N) — (1,1) FarmerCooperative

* A cooperative may have many farmer-members. Each membership record belongs to one cooperative.  

16. **SalesRecord — FeeRecord relationship:** *generates*

    SalesRecord (1,N) — (1,1) FeeRecord

* Each SalesRecord generates multiple FeeRecords one per commission component (Federation fee, Coop fee, Share Capital contribution, Share Capital retention).  

17. **DeliveryRecord— SalesRecord relationship**: *generated\_from*

    DeliveryRecord (1,1) — (1,N) SalesRecord

* Each SalesRecord is generated from one DeliveryRecord. One DeliveryRecord may generate many SalesRecords, one per fulfilling farmer.  
* A SalesRecord is generated only when a DeliveryRecord status changes from "pending" to "delivered". The generation must occur within a single transaction to ensure atomic financial recording.  

18. **FarmerAccount — LoanRecord relationship:** *borrows*

    FarmerAccount (1,1) — (0,N) LoanRecord

* A farmer may have multiple loan records over time. Each LoanRecord belongs to one FarmerAccount.  

19. **FarmerAccount — PrintedStatement relationship:** *produces*

    FarmerAccount (0,N) — (1,1) PrintedStatement

* A farmer account may have many printed balance statements generated over time. Each is a read-only snapshot.

#### **5\. Justification / Benefits:**  {#5.-justification-/-benefits:}

ASAC directly benefits FACCS, its 18 primary cooperatives, and every farmer-member in the cooperative network. The system was designed to digitalize what FACCS and its cooperatives already do, not to change how they operate, but to give their existing processes a structured, auditable digital record for the first time.

At the federation level, ASAC solves FACCS's complete absence of centralized order records. For the first time, every buyer request, cooperative assignment, and delivery confirmation will be logged in one system. FACCS Admin can see the status of all orders across all 18 cooperatives in real time, without calling each cooperative individually. This directly addresses the confirmed inefficiency of informal, verbal coordination between FACCS and its member cooperatives.

At the cooperative level, the Order Fulfillment Matching feature formalizes each cooperative's existing farmer-matching process. Officers who currently rely on memory and handwritten notes to find the right farmer for each buyer request will instead have a searchable, filterable registry of available farmers and their crop listings. This reduces the time spent on matching, eliminates errors, and creates a permanent record of which farmer fulfilled which order.

FarmLedger solves the most critical gap confirmed during the interview: the complete absence of farmer-level financial records. Every external transaction managed through FACCS automatically updates the farmer's ledger. Sales income is recorded, the commission is split and allocated, and the farmer's Share Capital grows as a permanent investment with every deal. Cooperative officers can add loan records and generate a Printable Farmer Balance Sheet on demand.

The Share Capital Tracking feature gives farmers visibility into their permanent investment in the cooperative for the first time. As share capital accumulates over time, it forms the basis for annual dividend calculations \- meaning farmers benefit not just from their net sales earnings, but from the cooperative membership itself. This strengthens farmer loyalty and gives cooperative officers a credible, data-driven basis for dividend distribution.

The Printable Farmer Balance Sheet is the most immediate and tangible output for both farmers and cooperative officers. Farmers can physically bring this document to cooperative meetings, FACCS inspections, and loan applications \- requiring no accounting knowledge or digital access. For cooperative officers, reduces audit preparation time from estimated 3-4 hours per cooperative to under 15 minutes via automated ledger generation. This was the specific requirement stated by FACCS management during the February 13, 2026 on-site interview.

Altogether, ASAC transforms the informal, paper-based processes of both FACCS and its cooperatives into a structured, accountable, and farmer-serving digital system \- without requiring farmers or buyers to use technology, without building a public marketplace, and without imposing per-farmer costs. Every feature was designed in direct response to what the client confirmed they actually needed.

1. ## **Business Rules (Per transaction/processes)** {#business-rules-(per-transaction/processes)}

1. A farmer may belong to more than one primary cooperative at the same time.  
1. FACCS manages all external buyer orders. Internal cooperative transactions are handled independently by each primary cooperative..  
1. Buyers contact FACCS to initiate external orders. FACCS Admin logs the request on their behalf.  
1. The 10% total commission on external transactions is split between FACCS and the primary cooperative. Exact rates to be confirmed with FACCS. (TBC)  
1. A portion of each cooperative's commission share goes to the farmer's Share Capital broken down as a capital contribution rate and a retention rate. Exact rates TBC.  
1. Farmers and buyers are never direct system users. All data entry is performed by FACCS Admin or Coop Officers on their behalf.  
1. Each primary cooperative officer manages only their own cooperative's data. No cross-cooperative data access.  
1. FACCS Admin has read-only access to all cooperative data. FACCS cannot edit individual cooperative or farmer records.  
1. Share capital is a permanent investment. It accumulates with every transaction and is never withdrawn as cash. It may only be converted to dividends at year end, subject to a rate to be confirmed.
