# dynamic-dns - Cloudflare Provider

```typescript
// CommonJS
const { CloudflareApi } = require("@vexcited/dynamic-dns");

// ESM
import { CloudflareApi } from "@vexcited/dynamic-dns";
```

## Set-up the Cloudflare Provider

You can use [tokens (more secure) or auth-keys](https://dash.cloudflare.com/profile/api-tokens).

If you're using a `token`, don't forget to give these permissions.
- `dns_records:edit`
- `zone:read`
- `cache_purge:edit` (Optional) => Only if you need to purge all files of a zone from Cloudflare's cache.

### Example

```typescript
// With a login token.
const cloudflare = new CloudflareApi({
  token: "xxxxxxxxxxxxxxxxxx"
});

// With a auth key.
const cloudflare = new CloudflareApi({
  authEmail: "mail@example.com",
  authKey: "xxxxxxxxxxxxxxxxxxxxxxxx"
});
```

## Zones

### List your zones

Adapted from <https://api.cloudflare.com/#zone-list-zones>.
All the optional parameters are available.

> Warning: if you want to add `account.name` or `account.id` parameters, you should use `accountName` and `accountId` instead.

### Example

```typescript
try {
  // All the parameters here are optionnal. So, you can also do listZones({})
  const { zones, resultInfo } = await cloudflare.listZones({
    match: "all", // The zones returned should match with `name` and `accountName`.

    name: "example.com", // Zone's name that should match.
    accountName: "Vexcited", // Zone owner's name that should match.

    per_page: 10, // I want to display 10 results per page.
    direction: "desc", // I also want to have descending results.
    page: 1
  });

  // You can get informations about the current page, zones per page, zones count, ...
  console.log(resultInfo); 

  // You can check if there are zones found.
  if (resultInfo.count <= 0) return;

  // Get the first zone.
  const zone = zones[0];

  // You can extract the zone's informations with the `rawData` property.
  const zoneName = zone.rawData.name; // string
  const zoneNameServers = zone.rawData.name_servers; // string[]
  console.log(zoneName, zoneNameServers);
}
catch (error) {
  // Error handling.
  console.error(error);
}
```

### Get a zone from its ID

If you know the `zone_identifier`, you can simply get the zone like this.

```typescript
try {
  const zoneId = "xxxxxxxxxxxxxxxx";
  const zone = await cloudflare.getZoneFromId(zoneId);

  // You can extract the zone's informations with the `rawData` property.
  const zoneName = zone.rawData.name; // string
  const zoneNameServers = zone.rawData.name_servers; // string[]
  console.log(zoneName, zoneNameServers);
}
catch (error) {
  // Error handling.
  console.error(error);
}
```

## Zone Methods

You can use now your `zone` variable to perform some methods.

### Purge all files from a zone

```typescript
const purged = await zone.purgeAllFiles();
console.log(purged); // returns true if okay.
```

### List DNS records of this zone

Adapated from <https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records>. You can find the list of parameters here available.

Here is an example if I want to get all the DNS records that are proxied by Cloudflare.

```typescript
const { records, resultInfo } = await zone.listDnsRecords({
  match: "all",
  proxied: true
});

// You can get informations about the current page, records per page, records count, ...
console.log(resultInfo);

// You can check if there are records found.
if (resultInfo.count <= 0) return;

// Get the first DNS record.
const record = records[0];

// You can extract the DNS record's informations with the `rawData` property.
const recordName = record.rawData.name; // string
const recordContent = record.rawData.content; // string
const recordType = record.rawData.type // string from CloudflareDnsRecordTypes
console.log(recordName, recordContent, recordType);
```

### Get a record from its ID

If you know the `identifier`, you can simply get the record like this.

```typescript
const recordId = "xxxxxxxxxxxxxxxx";
const record = await zone.getRecordFromId(recordId);

// Now you have your record.
console.log(record.rawData.name);
```

### Create a DNS record

Create a new DNS record inside this zone.
Adapted from <https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record>. You can find the list of parameters here.

`type`, `content` and `name` properties are required.
By the way, for DNS records of type `MX`, `SRV` and `URI`, you **must** include the `priority` property.

```typescript
// Returns the DNS record object is successful.
const createdRecord = await zone.createDnsRecord({
  type: "A",
  content: "127.0.0.1",

  // "local" is "local.example.com", for example.
  // You can write "example.com" is you want to use the root domain. 
  name: "local"
});

console.log(createdRecord.rawData.id);
```

## Record Methods

You can use now your `record` variable to perform some methods.

### Update the record.

Adapted from <https://api.cloudflare.com/#dns-records-for-a-zone-patch-dns-record> You can find the list of parameters here.

Every parameters are optionnal.

```typescript
const updatedRecord = await newRecord.update({
  name: "newExample",
  content: "127.0.0.2"
});
```

By the way, `updatedRecord` is a new `CloudflareDnsRecord` class object. So `newRecord` will keep the old data before updating the record.

### Delete the record

Delete the selected DNS record from the zone.

Always returns `true`. If there's an error, it will throw the error instead of returning `false`.

```typescript
try {
  const isDeleted = await record.delete();
  console.log(isDeleted); // true 
}
catch (error) {
  console.error("Failed", error);
}
```
