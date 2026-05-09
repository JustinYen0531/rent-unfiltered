# RHIR v0.1 人類可讀規範

版本：v0.1

更新日期：2026-05-10

機器可讀規範：[rhir-v0.1.schema.json](../schemas/rhir-v0.1.schema.json)

欄位草案來源：[RHIR常見欄位草案.md](RHIR常見欄位草案.md)

實作順序參考：[RHIR實作順序與資訊來源分類.md](RHIR實作順序與資訊來源分類.md)

## 一、規範目的

RHIR，Rental Housing Interoperability Resources，是 Rent Unfiltered 透明租屋專案提出的租屋資訊交換格式。

RHIR v0.1 的目的不是直接判斷租屋物件好壞，也不是立即計算風險分數，而是先建立一個簡單、可讀、可交換的資料結構，讓 AI Agent、人工整理者或未來系統能用一致方式記錄租屋資訊。

此版本特別重視三件事：

- 欄位值是什麼。
- 這個欄位是誰提供的。
- 這個欄位揭露到什麼程度。

## 二、設計原則

### 1. 初學者可讀

RHIR v0.1 採用簡單的一層對一層結構，不使用複雜繼承，也不強迫使用者理解大型資料標準。

### 2. 欄位一一對應

此版本盡量對應目前整理出的 RHIR 常見欄位草案，避免過度抽象化。

### 3. 允許缺漏

租屋資訊常常不完整，因此大多數欄位都允許不存在或為 `null`。

### 4. 未揭露不等於沒有

如果平台或房東沒有寫某項資訊，RHIR 不應直接判斷它不存在，而是標記為 `missing` 或 `unknown`。

### 5. 記錄來源與信心程度

每個重要欄位都應記錄來源類型、原文依據與可信度，避免只留下結果而失去脈絡。

## 三、FieldValue 基本單位

RHIR v0.1 建議每個欄位都使用同一種外殼：`FieldValue`。

這代表不要只寫：

```json
"petsAllowed": true
```

而是寫：

```json
"petsAllowed": {
  "value": true,
  "disclosureStatus": "disclosed",
  "sourceType": "platform",
  "sourceText": "寵物友善",
  "confidence": 0.9,
  "updatedAt": "2026-05-10",
  "conflicts": []
}
```

這樣 RHIR 不只是記錄「可不可以養寵物」，也記錄「這個判斷從哪裡來」。

## 四、FieldValue 欄位說明

### value

欄位的實際值。

可以是文字、數字、布林值、陣列、物件或 `null`。

範例：

- `25000`
- `"台北市中山區"`
- `true`
- `["冰箱", "洗衣機", "冷氣"]`
- `null`

### disclosureStatus

資訊揭露狀態。

可用值：

- `disclosed`：已明確揭露。
- `partial`：部分揭露，但不完整。
- `missing`：應該關注，但目前未揭露。
- `inferred`：由系統推估。
- `supplemented`：由公開資料補足。
- `conflict`：不同來源資訊互相衝突。
- `unknown`：目前無法判斷。

### sourceType

資訊來源類型。

可用值：

- `platform`：租屋平台提供。
- `provider`：房東、仲介或代管者提供。
- `publicData`：政府資料或公開資料。
- `systemInference`：系統推估。
- `userReport`：使用者回報。
- `manualInput`：人工輸入。
- `unknown`：來源未知。

### sourceText

原始文字依據。

範例：

- `"電一度5元. 水網路第四台都包"`
- `"押金：2個月"`
- `"產權登記：有"`

若沒有原文依據，可填 `null`。

### confidence

可信度，範圍為 0 到 1。

範例：

- `1`：非常確定。
- `0.8`：高度可信。
- `0.5`：需要人工確認。
- `null`：尚未評估。

### updatedAt

此欄位更新日期。

格式建議使用 `YYYY-MM-DD`。

### conflicts

資訊衝突紀錄。

如果不同來源對同一欄位給出不同說法，應保留衝突資訊，而不是直接覆蓋。

範例：

```json
"deposit": {
  "value": "2個月租金",
  "disclosureStatus": "conflict",
  "sourceType": "provider",
  "sourceText": "押金：2個月",
  "confidence": 0.8,
  "updatedAt": "2026-05-10",
  "conflicts": [
    {
      "sourceType": "platform",
      "sourceText": "押金面議",
      "value": "面議",
      "note": "平台欄位與仲介描述不一致"
    }
  ]
}
```

## 五、RHIR 第一層區塊

RHIR v0.1 第一層包含以下區塊：

- `metadata`
- `listing`
- `property`
- `layoutAndStructure`
- `locationContext`
- `amenities`
- `leaseTerms`
- `cost`
- `management`
- `provider`
- `ownershipLegalStatus`
- `marketingClaims`
- `transparencyLayer`

## 六、各區塊用途

### metadata

記錄 RHIR 文件本身的識別資訊。

常見欄位：

- `rhirRecordId`
- `rhirVersion`
- `createdAt`
- `updatedAt`
- `sourcePlatform`
- `sourceUrl`
- `platformListingId`
- `listingStatus`

### listing

記錄租屋平台刊登資訊與標籤。

常見欄位：

- `title`
- `subtitle`
- `platformTags`
- `listingType`
- `isPromoted`
- `isOwnerPosted`
- `isAgentPosted`

### property

記錄房屋基本資料。

常見欄位：

- `city`
- `district`
- `address`
- `communityName`
- `propertyType`
- `rentalType`
- `legalUse`
- `buildingAge`
- `areaPing`
- `floor`
- `totalFloors`
- `isTopFloor`
- `ownershipRegistered`

### layoutAndStructure

記錄格局、朝向、隔間與空間條件。

常見欄位：

- `layoutText`
- `bedrooms`
- `livingRooms`
- `bathrooms`
- `balconies`
- `kitchens`
- `orientation`
- `partitionMaterial`
- `hasBalcony`
- `hasIndependentEntrance`
- `hasWetDryBathroom`
- `hasExteriorWindow`
- `ventilationDisclosure`
- `lightingDisclosure`

### locationContext

記錄交通、生活機能與教育環境。

常見欄位：

- `nearestMrtStation`
- `nearestMrtDistanceMeters`
- `nearestBusStop`
- `nearestBusStopDistanceMeters`
- `nearbyRestaurantsCount`
- `nearbyShoppingCentersCount`
- `nearbyConvenienceStores`
- `nearbyMedicalFacilities`
- `nearbyParks`
- `nearbyElementarySchools`
- `nearbyJuniorHighSchools`
- `nearbyUniversities`

### amenities

記錄設備、家具與服務。

常見欄位：

- `refrigerator`
- `washingMachine`
- `television`
- `airConditioner`
- `waterHeater`
- `gasStove`
- `naturalGas`
- `oven`
- `cableTv`
- `internet`
- `elevator`
- `parkingSpace`
- `bed`
- `wardrobe`
- `sofa`
- `desk`
- `chair`
- `garbageCollectionService`
- `readyToMoveIn`

### leaseTerms

記錄租期、入住條件與租屋守則。

常見欄位：

- `minimumLeaseTerm`
- `shortTermRentalAllowed`
- `moveInDate`
- `canCook`
- `petsAllowed`
- `smokingAllowed`
- `genderRequirement`
- `identityRequirement`
- `requiresWorkProof`
- `landlordLivesTogether`
- `taxRegistrationAllowed`
- `householdRegistrationAllowed`
- `earlyTerminationClause`
- `repairResponsibility`
- `depositRefundTerms`

### cost

記錄所有金錢相關條件。

常見欄位：

- `monthlyRent`
- `deposit`
- `depositMonths`
- `managementFee`
- `waterFee`
- `electricityFee`
- `gasFee`
- `internetFee`
- `cableTvFee`
- `cleaningFee`
- `garbageCollectionFee`
- `petDeposit`
- `brokerServiceFee`
- `parkingFee`
- `otherFees`

### management

記錄社區管理與公共服務。

常見欄位：

- `managementType`
- `hasSecurityGuard`
- `hasTwentyFourHourManagement`
- `managementFeeDescription`
- `garbageDisposalMethod`
- `parkingManagement`

### provider

記錄資訊提供者或租屋服務提供者身份。

常見欄位：

- `providerType`
- `agentName`
- `landlordName`
- `brokerCompany`
- `franchiseStore`
- `brokerLicenseNumber`
- `salespersonLicenseNumber`
- `chargesServiceFee`
- `phone`
- `lineContact`
- `isVerified`

### ownershipLegalStatus

記錄產權與法定狀態。

常見欄位：

- `ownershipRegistered`
- `legalUse`
- `usagePermitInfo`
- `registeredBuildingArea`
- `isVerifiable`
- `suspectedIllegalAddition`
- `suspectedIndustrialResidentialUse`

### marketingClaims

記錄廣告描述與主張。

注意：此區文字不直接視為客觀事實。

常見欄位：

- `rawDescription`
- `highlightClaims`
- `transportClaims`
- `safetyClaims`
- `schoolDistrictClaims`
- `decorationClaims`
- `moveInClaims`

### transparencyLayer

記錄整份 RHIR 的資訊透明度摘要。

常見欄位：

- `disclosedFieldCount`
- `partialFieldCount`
- `missingFieldCount`
- `conflictFieldCount`
- `supplementedFieldCount`
- `inferredFieldCount`
- `unknownFieldCount`
- `fieldsNeedingUserQuestion`
- `notes`

## 七、v0.1 不包含的內容

RHIR v0.1 暫時不包含：

- Risk Index 計算。
- 資料庫設計。
- 591 爬蟲。
- 政府資料串接。
- AI Agent 實作。
- 權重模型。
- 法律判斷。

此版本只處理資料如何被保存、交換與比較。

## 八、給 AI Agent 的填寫原則

AI Agent 填寫 RHIR 時應遵守：

- 不要把未揭露資訊推論成不存在。
- 不要把廣告文案直接當作客觀事實。
- 若資訊來自原文，應保留 `sourceText`。
- 若不同來源有衝突，應使用 `conflict`，不要覆蓋。
- 若資訊需要人工確認，應降低 `confidence`。
- 若資訊只是系統推估，應使用 `systemInference`。
- 若資訊來自公開資料，應使用 `publicData`。

## 九、更新紀錄

### v0.1 - 2026-05-10

- 建立 RHIR v0.1 人類可讀規範。
- 定義 FieldValue 基本單位。
- 定義揭露狀態 disclosureStatus。
- 定義來源類型 sourceType。
- 建立 RHIR 第一層區塊。
- 對應目前 RHIR 常見欄位草案。
- 補上機器可讀 JSON Schema 連結。
