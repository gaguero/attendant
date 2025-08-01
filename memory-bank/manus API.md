Mews PMS integration guide for concierge platforms
This guide summarises key points about Mews PMS (Property Management System) APIs from the latest official documentation. It is intended for developers building a concierge or guest‑facing platform that needs to read and write data in Mews. The examples below are based on documentation available on 31 July 2025 from Mews’s GitBook guides, the OpenAPI specifications and community posts.

1 Overview of Mews PMS and the API suite
Mews PMS is a cloud‑based hospitality platform used to manage property operations, bookings and guest services. It exposes several open APIs that let partners integrate external applications with the PMS. When building a concierge platform you will mostly use two APIs:

Connector API – The general‑purpose operations API. It lets integrations work with data inside Mews Operations (e.g., customer profiles, reservations, accounting items, payments, orders, availability blocks). The API is available through https://api.mews.com in production or https://api.mews‑demo.com for testing
mews-systems.gitbook.io
. Mews provide a Swagger/OpenAPI definition (/swagger/connector/swagger.json), which documents all endpoints.

Distributor (Booking‑Engine) API – The API used by Mews’s booking engine to retrieve availability and pricing and to create reservation groups. It is accessible at https://app.mews.com/api/distributor/v1/… and is documented via the distributor Swagger spec
app.mews.com
. Use this API when you need to show real‑time room or service availability to guests or to build a booking interface.

Other APIs
Channel Manager API – used to connect to online travel agencies (OTAs). It is not usually necessary for a concierge platform.

Payments API – provided separately and not covered here.

Mews strongly encourages partners to register their integration and go through a certification process before accessing production data. Community posts emphasise that production access requires an enterprise‑tier subscription and certification
community.mews.com
.

2 Environments, authentication and rate limits
2.1 Environment setup
Mews operates multiple environments:

Environment	Base URL	WebSocket	Notes
Demo (gross pricing)	https://api.mews‑demo.com	wss://ws.mews‑demo.com	Public sandbox with test tokens. Do not use real customer data here
mews-systems.gitbook.io
. Demo login: https://app.mews‑demo.com with email connector-api-demo@mews.com and password connector-API-2024
mews-systems.gitbook.io
.
Demo (net pricing)	same API endpoints as above but different tokens	Used when net prices are required for integration testing.	
Production	https://api.mews.com	wss://ws.mews.com	Only accessible with certified ClientToken and AccessToken. Production tokens are unique per integration and property and are not published
mews-systems.gitbook.io
.

To call any API, you must send a POST request with a JSON body containing authentication values:

ClientToken – identifies the application/integration. This is assigned by Mews when you register your integration.

AccessToken – identifies the property (or chain) that you are accessing. For multi‑property integrations there is a concept of portfolio tokens; consult the “multi‑property” concept page for details.

Client – short string identifying the client application and its version (e.g., "ConciergePlatform 1.0.0"). This helps Mews track usage.

These values must be included in the request body rather than in HTTP headers. Mews emphasises that both tokens are secrets and should never be exposed on the client side
mews-systems.gitbook.io
.

2.2 Demo tokens
Mews publish a set of tokens for the demo environment. For example, the gross pricing demo includes a ClientToken starting with E0D439EE… and an AccessToken starting with C66EF7B…
mews-systems.gitbook.io
. Multiple sets are provided; choose any pair for your tests. Demo tokens have reduced request limits.

2.3 Rate limits
Production – 3000 requests per AccessToken within 15 minutes and a secondary limit of 1500 requests per endpoint in the same period【512633939213633†L314-L398】.

Demo – 500 requests per token and 250 per endpoint within 15 minutes
mews-systems.gitbook.io
.

Using the pagination mechanism increases limits tenfold (e.g., retrieving 30 000 items per 15 minutes)【512633939213633†L314-L398】. Exceeding limits returns HTTP 429 with a Retry‑After header. Heavy requests can time‑out, returning HTTP 408; Mews advises splitting large queries into smaller batches
mews-systems.gitbook.io
.

2.4 Time zone and serialization
All date/time values are transmitted in UTC using ISO 8601 format (e.g., "2024‑08‑15T14:00:00Z"). When filtering by time ranges, always specify StartUtc and EndUtc. The API will reject ambiguous time formats.

3 Using the Connector API
The Connector API is wide‑ranging. It groups operations into categories such as accounts, bills, payments, orders, spaces, services, availability blocks, etc. Each operation is accessed via a POST call to /api/connector/v1/... on the base URL. Below are examples of operations relevant to a concierge platform. Use the OpenAPI specification to explore additional endpoints.

3.1 Accounts and customer profiles
Get all account notes – /api/connector/v1/accountNotes/getAll. Returns notes attached to customer or company accounts (e.g., preferences, allergies). A request includes AccountIds, optional date ranges and other filters. A typical request body contains ClientToken, AccessToken, Client, arrays of AccountIds or AccountNoteIds, optional UpdatedUtc range and Limitation for pagination. The response returns an array of account notes with attributes like Id, AccountId, Content, AccountType and Classifications
app.mews.com
.

Update or create customers – the API includes endpoints such as /customers/add and /customers/update. These operations accept customer details (name, email, phone, address, nationality, etc.) and return the created or updated customer ID. Use them to allow guests to edit their profile from the concierge platform.

3.2 Reservations and availability blocks
Mews uses the concept of availability blocks to group reservations and to control public availability. For example:

Add availability blocks – /api/connector/v1/availabilityBlocks/add adds blocks specifying service (room type), rate and date range. Fields include ServiceId, RateId, FirstTimeUnitStartUtc, LastTimeUnitStartUtc, ReleasedUtc or RollingReleaseOffset, optional Name and ExternalIdentifier. The response returns detailed block records, including Id, EnterpriseId, ServiceId, RateId, Budget and State
app.mews.com
. When a block contains active reservations it cannot be deleted; use /availabilityBlocks/delete to remove blocks.

Get or delete availability blocks – Endpoints /availabilityBlocks/getAll and /availabilityBlocks/delete let you list or remove blocks. Filtering options include service IDs, date ranges, states and external identifiers.

For standard reservations there are separate endpoints (not fully shown in the snippet) such as /reservations/add and /reservations/update. These let you create or modify bookings, assign spaces (rooms), set arrival/departure dates and manage reservation states (e.g., confirmed, optional, cancelled). Use the services and rates endpoints to obtain valid service and rate identifiers before creating reservations.

3.3 Services and products
Hotels may sell additional services (e.g., parking, spa) or products (e.g., minibar items). Use:

Get services – /services/getAll returns services set up in the property including categories, service type (accommodation or additional), default pricing and availability parameters.

Add service orders – /orders/add creates orders of services or products for a reservation or customer account. The request includes the ServiceId, CustomerId/ReservationId, quantity and the date/time consumed. The API returns the created order item ID.

Get accounting items – /accountingItems/getAll fetches all accounting items (order items and payment items). Filtering by ConsumedUtc, ClosedUtc, UpdatedUtc, ItemIds and States is supported. Setting Extent.OrderItems=true includes order items in the response, while Extent.PaymentItems=true includes payment items
app.mews.com
. The response example shows order items with Id, AccountId, OrderId, BillId, Amount (currency, net and gross values and tax breakdown), ConsumedUtc and other fields
app.mews.com
.

3.4 Billing and payments
Close bill – /bills/close closes an open bill and optionally sets the taxed date, due date or owner data. The request body contains BillId, EnterpriseId, Type (e.g., Invoice), BillCounterId, Options, TaxedUtc and other fields. The response returns a BillPdfFile for generating the invoice
app.mews.com
.

Get bills – /bills/getAll retrieves bills with filters like customer ID, company ID or date ranges. Use Extent.Payments or Extent.OrderItems to include related payments and order items. Bills show details such as bill number, creation and due dates, total amounts and payment status.

Payments – Endpoints exist for creating payments, retrieving payment methods and credit‑card transactions. Payments can be applied to bills or to customer accounts.

3.5 Spaces (rooms) and categories
Get space categories – /spaceCategories/getAll lists types of spaces (e.g., double room, suite) with capacity, default occupancy and features (e.g., bed type). Use this to populate room type choices in your interface.

Get spaces – /spaces/getAll returns individual rooms/spaces along with category, occupancy status and features. Filtering by service ID, building or floor is supported.

3.6 Tasks and housekeeping
Mews manages housekeeping tasks using service orders and space status. The API allows you to:

Get or update space status – /spaces/update can mark a room as clean, dirty or out of order. Use this to reflect housekeeping progress in your concierge platform.

Add service orders – as described above, service orders can be used to schedule housekeeping or maintenance tasks. Each order contains TaskCategoryId and Notes fields to describe the task.

Because the API structure continues to evolve, consult the latest Connector API specification for a complete list of endpoints and fields.

4 Using the Distributor (Booking‑Engine) API
The Distributor API exposes operations used by the Mews booking engine. It is particularly useful when your concierge platform needs to display real‑time availability, pricing or promotions to guests.

4.1 Key endpoints
Endpoint	Purpose	Parameters (simplified)	Response highlights
/api/distributor/v1/hotels/getAvailability	Get hotel availability for a date range	AvailabilityParameters structure containing Client, EnterpriseId, StartUtc, EndUtc, optional occupancy and currency parameters
app.mews.com
Returns Availability schema with dates and counts of available units per category
/api/distributor/v1/services/getAvailability	Get availability for a specific service (e.g., parking or spa)	ServiceAvailabilityParameters containing Client, EnterpriseId, ServiceId, StartUtc, EndUtc, optional CategoryIds and LanguageCode
app.mews.com
Response includes TimeUnitStartsUtc and CategoryAvailabilities arrays showing number of available units per time unit【520045377278945†L100-L189】
/api/distributor/v1/reservations/getPricing	Calculate pricing for one or more room units for a date range	ReservationPricingParameters (enterprise ID, service ID, start/end, number of adults/children, promotion codes). Returns ReservationPricing with breakdown of nightly rates and taxes
app.mews.com
.	
/api/distributor/v1/reservations/price	Calculate final price for a specific reservation scenario	ReservationPriceParameters similar to above; returns ReservationPriceResult
app.mews.com
.	
/api/distributor/v1/products/getPrices	Get prices for ancillary products	ProductPricingParameters with product IDs and date ranges; returns ProductPricesResult
app.mews.com
/api/distributor/v1/services/getPricing	Get pricing for additional services	ServicePricingParameters; returns ServicePricingResult
app.mews.com
/api/distributor/v1/services/getPromotions	Retrieve active promotions for services	ServicePromotionParameters with service IDs and date ranges
app.mews.com
Returns details of promotions such as name, conditions and discount percentages
/api/distributor/v1/reservationGroups/get and /api/distributor/v1/reservationGroups/add	Retrieve or create reservation groups (collections of reservations)	ReservationGroupParameters or CreateReservationGroupParameters
app.mews.com
Response returns ReservationGroup object with reservations and pricing details

4.2 Authentication and usage
The Distributor API uses the same authentication model as the Connector API: include Client, ClientToken and AccessToken in the request body. Additional fields are specific to the booking engine, such as EnterpriseId, ServiceId, CategoryIds, StartUtc, EndUtc, number of persons and LanguageCode. Always specify date ranges in UTC and choose the desired currency. The API returns structured pricing and availability information that can be rendered in your concierge platform.

5 Best practices and integration tips
Register and certify your integration – Production access requires that you register as a partner and go through Mews’s certification process
community.mews.com
. Contact the Mews Partner Success team early in your project.

Use the demo environment first – The demo environment allows you to test against realistic data without affecting real operations. Use the published demo tokens and do not create real reservations or customers there
mews-systems.gitbook.io
.

Paginate large requests – Use the Limitation object with Cursor and Count when retrieving large datasets. Pagination increases the allowed request quota tenfold and prevents timeouts【512633939213633†L314-L398】.

Handle errors gracefully – The API returns detailed error codes for client errors (400), authentication problems (401), business logic violations (403), timeouts (408) and rate‑limit errors (429). Include retry logic and user‑friendly error messages. For unexpected errors (500) consult Mews support or raise an issue in their GitHub repository
app.mews.com
.

Respect data privacy – Do not store tokens in client‑side code. Use secure server‑side components to call the API. Comply with GDPR and local regulations when handling personal data.

Use webhooks/websockets for real‑time updates – Mews’s Connector API includes WebSocket endpoints (e.g., wss://ws.mews.com) that push real‑time events such as reservation changes or new orders. Leveraging websockets allows your concierge platform to update the UI without polling.

Stay up to date – Mews evolves quickly. Always refer to the latest GitBook documentation and the Swagger definitions for updates. Monitor the changelog and subscribe to Mews’s developer communications for breaking changes.

6 Conclusion
Mews PMS provides a robust set of APIs enabling deep integration with hotel operations. For a concierge platform, the Connector API supplies access to customers, reservations, billing and service orders, while the Distributor API handles availability and pricing used in booking flows. By following the authentication model, environment guidelines and best practices outlined above, developers can build reliable integrations that enhance the guest experience and streamline hotel operations.

Environments
Mews supports two main environments: Demo and Production. Demo can be used for integration development and testing. Production is for live customer sites.

Pricing environments
Enterprises can be configured for Gross Tax or Net Tax. In the Production environment this will depend on the individual enterprise. For development and test purposes, we have set up two versions of the Demo environment, one for Gross Tax and one for Net Tax.

Gross Pricing Environments: These are environments in which taxes are included in the pricing that is offered to the end customer, such as used by Germany, UK and Australia.

Net Pricing Environments: These are environments in which taxes are excluded from the pricing that is offered to the end customer, such as used in the USA.

Demo environments
Security Policy
IMPORTANT! The demo environments are completely public and NO REAL DATA should be used for any reason. Failure to comply with these guidelines can result in immediate suspension of the connection or denial of certification.

Platform addresses
These addresses should be used for testing and development of client applications:

PlatformAddress - https://api.mews-demo.com

WebSocketAddress - wss://ws.mews-demo.com

Mews system credentials
These login credentials can be used to access Mews Operations (for both Gross and Net Pricing Environments):

Mews Web Application Address - https://app.mews-demo.com

Email - connector-api-demo@mews.com

Password - connector-API-2024

API tokens (Gross Pricing Environment)
The credentials below will connect with a demo enterprise configured for Gross pricing. This demo enterprise is based in the United Kingdom legal and tax environment. It accepts GBP, EUR and USD currencies (any of them may be used). Refer to Taxations for proper usage of the relevant Tax rate codes. Use any of the four sets of tokens.

Integration: Are you ready to integrate with Mews?

ClientToken - E0D439EE522F44368DC78E1BFB03710C-D24FB11DBE31D4621C4817E028D9E1D

AccessToken - C66EF7B239D24632943D115EDE9CB810-EA00F8FD8294692C940F6B5A8F9453D

Integration: Connector API Test Client 2

ClientToken - E916C341431C4D28A866AD200152DBD3-A046EB5583FFBE94DE1172237763712

AccessToken - CC150C355D6A4048A220AD20015483AB-B6D09C0C84B09538077CB8FFBB907B4

Integration: Connector API Test Client 3

ClientToken - 2CC71B0660F345019882AD200155B4FE-4A1FC9080A4DD2A404734003674F77E

AccessToken - 5F56B9903A834F199E28AD20015E58CA-5C6A1A00550634911534AD6A098E8B7

Integration: Connector API Test Client 4

ClientToken - 07AB1F14B55C49B8BDD6AD200158423B-273A4497AFF5E20566D7199DB3DC2BA

AccessToken - 39E301DD5A1C4A569087AD20015F60DD-50DC28896E9090CCA0995C9BBD90351

API tokens (Net Pricing Environment)
The credentials below will connect with a demo enterprise configured for Net pricing. This demo enterprise is based in the United States - Washington DC legal and tax environment. It accepts GBP, EUR and USD currencies (any of them may be used). Refer to Taxations for proper usage of the relevant Tax rate codes. Use any of the four sets of tokens.

Integration: Are you ready to integrate with Mews?

ClientToken - E0D439EE522F44368DC78E1BFB03710C-D24FB11DBE31D4621C4817E028D9E1D

AccessToken - 4D6C7ABE0E6A4681B0AFB16900AE5D86-DF50CBC89E1D4FF5859DDF021649ED5

Integration: Connector API Test Client 2

ClientToken - E916C341431C4D28A866AD200152DBD3-A046EB5583FFBE94DE1172237763712

AccessToken - 1AEFA58C55E74D65BDC7AD2001564C12-66633E0B736F523379B9E5966165A55

Integration: Connector API Test Client 3

ClientToken - 2CC71B0660F345019882AD200155B4FE-4A1FC9080A4DD2A404734003674F77E

AccessToken - 682C235379B64D909941AD2001577525-BFC60A026081F1350FAA99CAB9F7510

Integration: Connector API Test Client 4

ClientToken - 07AB1F14B55C49B8BDD6AD200158423B-273A4497AFF5E20566D7199DB3DC2BA

AccessToken - BFD4298010F54B069F3DAD20015D53EA-D5561FADFBA4EFC8EA4C179C6BC461F

Request limits
500 requests per AccessToken within 15 minutes

250 requests per endpoint per AccessToken within 15 minutes

Pagination: All requests utilizing Pagination have their limits increased by 10 times.

Production environment
Security Policy
IMPORTANT! To protect the live data of each enterprise, please store your production tokens securely and do not share them publicly.

Addresses
PlatformAddress - https://api.mews.com

WebSocketAddress - wss://ws.mews.com

Mews Web Application Address - https://app.mews.com

API tokens
ClientToken - Unique to your application, serving as the identifier of the API client. This token will be provided to you by our integration team upon successful certification.

AccessToken - Unique token per enterprise. Can be provided to you by the enterprise admin.

Request limits
3000 requests per AccessToken within 15 minutes

1500 requests per endpoint per AccessToken within 15 minutes

Pagination: All requests utilizing Pagination have their limits increased by 10 times.

Taxations
Each enterprise operates within a specific Tax environment, which defines the applicable Taxations. The tax rates are represented by Tax rate codes accepted within that environment. Instead of using numeric tax rates like 0.1, use Tax rate codes such as AT-S to accurately represent and calculate the correct taxation for each accounting item in Mews.

To obtain the applicable codes:

Download the enterprise information using Get configuration to identify the Tax Environment.

Filter for the applicable Tax rate codes from the tax environment information retrieved via Get all tax environments.

Be sure to note the validity intervals, and monitor any government announcements for changes to tax rates. If changes occur, re-retrieve the enterprise and tax environment information to identify the new tax rate codes.

IP address allowlisting
Allowlisting (formerly called 'whitelisting') is a common security measure which can be applied to a system to allow only specified external systems to talk to it. This has traditionally been achieved using IP address-based firewall rules. However, this approach does not work with modern cloud based architectures, which use dynamic and shared IP addresses, proxy servers and elastic resources. For this reason, we do not support the use of IP address allowlists for our APIs and we cannot supply a list of IP addresses for our APIs.