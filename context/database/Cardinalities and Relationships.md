### **Cardinalities and Relationships** {#cardinalities-and-relationships}

1. User — Role         relationship: *has*

User (0,N) — (1,1) Role

* Each User has exactly one Role. A Role may be assigned to many Users.  
2. User — PrimaryCooperative         relationship: *acts\_as*

User (0,1) — (1,1) PrimaryCooperative

* Each User may act as one Primary Cooperative officer account. Each cooperative has exactly one officer user.  
3. User — Farmer         relationship: *acts\_as*

User (0,1) — (0,1) Farmer

* Each User may act as one Farmer account for view-only ledger access.  
4. Farmer — Product         relationship: *lists*

Farmer (0,N) — (1,1) Product

* A Farmer may list many available crop products. Each Product belongs to one Farmer.  
5. Product — CropType         relationship: *categorized\_as*

Product (1,1) — (0,N) CropType

* Each Product is classified under one CropType. A CropType may be referenced in many Products.  
6. BuyerOrder — CoopAssignment         relationship: *assigned\_to*

BuyerOrder (1,N) — (1,1) CoopAssignment

* A BuyerOrder may be assigned to one or more cooperatives. Each CoopAssignment belongs to one BuyerOrder.  
7. CoopAssignment — PrimaryCooperative         relationship: *handled\_by*

CoopAssignment (0,N) — (1,1) PrimaryCooperative

* Each CoopAssignment is handled by one cooperative. A cooperative may handle many assignments.  
8. CoopAssignment — FarmerFulfillment         relationship: *fulfilled\_by*

CoopAssignment (1,1) — (0,N) FarmerFulfillment

* A CoopAssignment may be fulfilled by zero or more farmers (until matched). Each FarmerFulfillment belongs to one assignment.  
9. Farmer — FarmerFulfillment         relationship: *fulfills*

Farmer (0,N) — (1,1) FarmerFulfillment

* A farmer may fulfill many assignments over time. Each FarmerFulfillment refers to one Farmer.  
10. BuyerOrder — DeliveryRecord         relationship: *produces*

BuyerOrder (1,1) — (1,N) DeliveryRecord

* One BuyerOrder may produce one or more DeliveryRecords (to support partial or staged deliveries). Each DeliveryRecord belongs to exactly one BuyerOrder.  
11. Farmer — FarmerAccount         relationship: *has\_ledger*

Farmer (1,N) — (1,1) FarmerAccount

* Each Farmer may have multiple FarmerAccounts, one per cooperative they belong to. Each account belongs to one farmer.  
12. PrimaryCooperative — FarmerAccount         relationship: *holds*

PrimaryCooperative (0,N) — (1,1) FarmerAccount

* A cooperative holds the ledger accounts of all its farmer-members.  
13. FarmerAccount — SalesRecord         relationship: *records*

FarmerAccount (1,1) — (0,N) SalesRecord

* A farmer account accumulates many sales records over time from both external and internal transactions.  
14. Farmer — FarmerCooperative         relationship: *member\_of*

Farmer (1,N) — (1,1) FarmerCooperative

* A farmer must be a member of at least one cooperative. Each membership record belongs to one farmer.  
15. PrimaryCooperative — FarmerCooperative         relationship: *has\_member*

PrimaryCooperative (0,N) — (1,1) FarmerCooperative

* A cooperative may have many farmer-members. Each membership record belongs to one cooperative.  
16. SalesRecord — FeeRecord         relationship: *generates*

SalesRecord (1,N) — (1,1) FeeRecord

* Each SalesRecord generates multiple FeeRecords one per commission component (Federation fee, Coop fee, Share Capital contribution, Share Capital retention).  
17. DeliveryRecord— SalesRecord         relationship: *generated\_from*

DeliveryRecord (1,1) — (1,N) SalesRecord

* Each SalesRecord is generated from one DeliveryRecord. One DeliveryRecord may generate many SalesRecords, one per fulfilling farmer.  
* A SalesRecord is generated only when a DeliveryRecord status changes from "pending" to "delivered". The generation must occur within a single transaction to ensure atomic financial recording.  
18. FarmerAccount — LoanRecord         relationship: *borrows*

FarmerAccount (1,1) — (0,N) LoanRecord

* A farmer may have multiple loan records over time. Each LoanRecord belongs to one FarmerAccount.  
19. FarmerAccount — PrintedStatement         relationship: *produces*

FarmerAccount (0,N) — (1,1) PrintedStatement

* A farmer account may have many printed balance statements generated over time. Each is a read-only snapshot.