# GetInsured Project Build and Pega Integration Guide

This document explains how the `F:\InsureHub` project was created, what was installed, how it connects to Pega, which APIs are used, and what fixes were needed to make the Pega Change Address case render correctly.

It is written for mixed audiences. A non-technical reader can understand the purpose and sequence. A developer can use it as a rebuild and troubleshooting guide.

## 1. Plain English Summary

GetInsured is a mock insurance customer portal built with React and TypeScript. A customer logs in using their real Pega operator credentials. After login, the app uses the logged-in operator ID as the customer ID.

Example:

- User logs in as `CUST847562`.
- The portal treats `CUST847562` as the customer identifier.
- Dashboard, policies, claims, and service requests are loaded using Pega data views with `CustomerID=CUST847562`.
- When the customer starts Change Address, the portal creates a real Pega case of type `IH-Insure-Work-ChangeAddress`.
- Pega returns Constellation UI metadata.
- The React SDK renders the Pega case UI inside the portal.

The project is not a Pega mashup-first portal. It uses a React app shell plus Pega DX/Constellation runtime APIs.

## 2. Skills Used

These Codex skills were used as the project guide rails.

| Skill | Path | Used For |
| --- | --- | --- |
| `pega-constellation` | `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md` | React SDK setup, Constellation rendering, component map issues, PCore/PConnect runtime behavior. |
| `pega-constellation-bpm` | `C:\Users\ramma\.codex\skills\pega-constellation-bpm\SKILL.md` | Case workflow behavior, assignment rendering, local action/case UI rules, production-safe BPM choices. |
| `pega-dx-apis` | `C:\Users\ramma\.codex\skills\pega-dx-apis\SKILL.md` | DX API endpoint shape, case/data view/assignment API usage, request/response behavior. |

Reference project used:

| Reference | Path / URL | Purpose |
| --- | --- | --- |
| Prior working app | `C:\Users\ramma\Downloads\insurance-quote-app` | Compared SDK setup, component map, Pega render behavior, theme requirements, and local project patterns. |
| External reference | `https://github.com/shzolly/react-sdk-lab` | Used only as a general SDK-R reference. It was SDK-R 24.2 based, so this project used the 25.1 SDK line instead. |

## 3. Project Goal

Create a React TypeScript insurance portal named GetInsured with:

- Pega operator login.
- Dashboard.
- Policies tab.
- Claims tab.
- Services tab.
- Mock fallback data before Pega is configured.
- Real Pega data view reads when Pega config exists.
- Real Pega Change Address case creation and UI rendering.
- Pega Infinity 25 SDK package line.

## 4. Technology Stack

Main app stack:

- Vite
- React 18
- TypeScript
- Material UI
- React Router
- lucide-react icons
- Pega React SDK components
- Pega Constellation JS
- Pega DX Component Builder SDK

Important installed packages from `package.json`:

| Package | Version | Purpose |
| --- | --- | --- |
| `@pega/react-sdk-components` | `~25.1.11` | React components that render Pega Constellation metadata. |
| `@pega/constellationjs` | `~25.1.2` | Pega Constellation runtime/bootstrap assets. |
| `@pega/dx-component-builder-sdk` | `~25.1.14` | DX component builder scripts for future custom components. |
| `@pega/pcore-pconnect-typedefs` | `^4.1.0` | Type support for PCore/PConnect concepts. |
| `@pega/auth` | `^0.2.27` | SDK auth helpers such as `sdkSetAuthHeader`. |
| `@mui/material` | `^5.16.7` | Portal shell UI. |
| `@mui/styles` | `^6.5.0` | Needed because Pega SDK 25.1 uses `@mui/styles/makeStyles`. |
| `react-router` | `^7.8.1` | Page routing for Dashboard, Policies, Claims, Services. |
| `lucide-react` | `^0.479.0` | Portal icons. |

## 5. Important Project Files

| File | Purpose |
| --- | --- |
| `package.json` | Scripts and dependencies. |
| `.env.example` | Safe example of required environment variables. No real secrets should be committed. |
| `.env` | Local runtime configuration. This file is ignored by git and contains real environment values. |
| `sdk-config.json` | Pega SDK/DXCB configuration. |
| `sdk-local-component-map.js` | Local component mappings required by the SDK renderer. |
| `public/constellation` | Local Pega Constellation runtime assets copied from SDK package. |
| `src/config/pegaConfig.ts` | Reads Vite environment variables and builds runtime config. |
| `src/services/authService.ts` | Performs Pega username/password login. |
| `src/services/pegaDxClient.ts` | Low-level Pega DX API v2 client. |
| `src/services/portalDataService.ts` | Loads dashboard/policy/claim data and maps Pega responses into portal models. |
| `src/hooks/useConstellation.ts` | Starts the Pega Constellation runtime after login. |
| `src/lib/constellation.tsx` | Bridges PCore/PConnect to React and starts Change Address case rendering. |
| `src/theme-pega.ts` | Pega SDK-specific theme. |
| `src/services/pegaRenderDiagnostics.ts` | Captures hidden SDK render errors and shows useful diagnostics. |

## 6. Step-by-Step Build History

### Step 1: Created the Vite React TypeScript App

Skill used:

- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

What was done:

- Created a React app under `F:\InsureHub`.
- Used Vite because the app is a modern single-page React app.
- Added TypeScript for safer API models and configuration.
- Added React Router for tab/page navigation.
- Added MUI and lucide icons for portal UI.

Key result:

- The app can run locally with:

```powershell
npm run dev
```

Current local URL:

```text
http://localhost:3502/
```

### Step 2: Added GetInsured Portal Shell

Skill used:

- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

What was built:

- `LoginPage`
- `DashboardPage`
- `PoliciesPage`
- `ClaimsPage`
- `ServicesPage`
- `AppShell`

The portal shows mock data first. This means the app remains usable even when Pega is not configured or a data view is unavailable.

### Step 3: Added Pega Infinity 25 SDK Packages

Skill used:

- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

Packages selected:

```json
"@pega/react-sdk-components": "~25.1.11",
"@pega/dx-component-builder-sdk": "~25.1.14",
"@pega/constellationjs": "~25.1.2",
"@pega/pcore-pconnect-typedefs": "^4.1.0"
```

Why:

- The reference app `react-sdk-lab` was SDK-R 24.2 based.
- This project targets Pega Infinity 25, so the 25.1 package line was used.

### Step 4: Added SDK/DXCB Scaffolding

Skill used:

- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

Files/scripts added:

- `sdk-config.json`
- `src/dxcb.config.json`
- `sdk-local-component-map.js`
- `authenticate`
- `create`
- `buildComponent`
- `publish`
- `list`

Scripts in `package.json`:

```json
"authenticate": "dx-component-builder-sdk authenticate",
"create": "dx-component-builder-sdk create",
"buildComponent": "dx-component-builder-sdk buildComponent",
"publish": "dx-component-builder-sdk publish",
"list": "dx-component-builder-sdk list"
```

Current placeholder custom ruleset:

```text
GetInsuredDX
```

No custom DX component was implemented in v1. The scaffold is ready for later.

### Step 5: Added Environment-Based Pega Configuration

Skills used:

- `pega-dx-apis`: `C:\Users\ramma\.codex\skills\pega-dx-apis\SKILL.md`
- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

Main file:

```text
src/config/pegaConfig.ts
```

The app reads Pega settings from `.env`, for example:

```env
VITE_PEGA_BASE_URL=https://<pega-host>/prweb/PRAuth
VITE_PEGA_APP_ALIAS=insurehub
VITE_PEGA_CLIENT_ID=<login-client-id>
VITE_PEGA_CLIENT_SECRET=<login-client-secret>
VITE_PEGA_GRANT_TYPE=password
VITE_PEGA_TOKEN_URL=https://<pega-host>/prweb/PRRestService/oauth2/v1/token
VITE_PEGA_CHANGE_ADDRESS_CASE_TYPE_ID=IH-Insure-Work-ChangeAddress
VITE_PEGA_DASHBOARD_DATA_VIEW_ID=D_CustomerDashboardList
VITE_PEGA_POLICY_DATA_VIEW_ID=D_CustomerPoliciesList
VITE_PEGA_CLAIMS_DATA_VIEW_ID=D_CustomerClaimsList
```

Important security rule:

- Real client secrets are only in `.env`.
- `.env` is ignored by git.
- `.env.example` contains placeholders only.

### Step 6: Added Pega Login

Skills used:

- `pega-dx-apis`: `C:\Users\ramma\.codex\skills\pega-dx-apis\SKILL.md`
- `pega-constellation-bpm`: `C:\Users\ramma\.codex\skills\pega-constellation-bpm\SKILL.md`

Main files:

- `src/services/authService.ts`
- `src/services/pegaDxClient.ts`

What happens during login:

1. User enters Pega operator ID and password in GetInsured login page.
2. App calls the Pega OAuth token endpoint.
3. Grant type used for login is password credentials.
4. Pega validates the username/password.
5. If Pega returns a token, the user is allowed into the portal.
6. If Pega rejects the credentials, the portal login fails.

Token request shape:

```http
POST /prweb/PRRestService/oauth2/v1/token
Content-Type: application/x-www-form-urlencoded
Accept: application/json
```

Body:

```text
grant_type=password
client_id=<client id>
client_secret=<client secret>
username=<Pega operator ID>
password=<Pega operator password>
```

Plain English:

- The React portal does not maintain its own user database.
- Pega is the authority.
- If the user cannot log in to Pega, they cannot log in to GetInsured.

### Step 7: Used Logged-In Operator ID as Customer ID

Skill used:

- `pega-constellation-bpm`: `C:\Users\ramma\.codex\skills\pega-constellation-bpm\SKILL.md`

Rule agreed:

```text
Logged-in Pega username = CustomerID
```

Example:

```text
Login username: CUST847562
CustomerID sent to data views: CUST847562
```

This is done in `src/App.tsx` after login:

- Login returns the token.
- The typed username becomes `customerId`.
- Dashboard/policy/claim calls use that value.

### Step 8: Added Pega DX API Client

Skill used:

- `pega-dx-apis`: `C:\Users\ramma\.codex\skills\pega-dx-apis\SKILL.md`

Main file:

```text
src/services/pegaDxClient.ts
```

The client supports these DX API v2 calls:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/casetypes` | Read available case types. |
| `POST` | `/cases` | Create a case. |
| `GET` | `/cases/{caseID}` | Read case details. |
| `GET` | `/assignments/{assignmentID}` | Read assignment UI/data. |
| `GET` | `/assignments/{assignmentID}/actions/{actionID}` | Read assignment action metadata. |
| `PATCH` | `/assignments/{assignmentID}/actions/{actionID}` | Submit assignment action. |
| `PATCH` | `/cases/{caseID}/actions/{actionID}` | Submit case action. |
| `POST` | `/data_views/{data_view_ID}` | Run a data view with parameters. |

The base URL is built like this:

With app alias:

```text
https://<pega-host>/prweb/PRAuth/app/insurehub/api/application/v2
```

Without app alias:

```text
https://<pega-host>/prweb/PRAuth/api/application/v2
```

For this project, app alias is:

```text
insurehub
```

### Step 9: Added Dashboard, Policy, and Claim Data Views

Skills used:

- `pega-dx-apis`: `C:\Users\ramma\.codex\skills\pega-dx-apis\SKILL.md`
- `pega-constellation-bpm`: `C:\Users\ramma\.codex\skills\pega-constellation-bpm\SKILL.md`

Data views used:

| Data View | Input Parameter | Used For |
| --- | --- | --- |
| `D_CustomerDashboardList` | `CustomerID` | Customer name, customer since/member since, dashboard summary. |
| `D_CustomerPoliciesList` | `CustomerID` | Policies count and Policies tab rows. |
| `D_CustomerClaimsList` | `CustomerID` | Claims count and Claims tab rows. |

Request shape:

```http
POST /data_views/D_CustomerDashboardList
Content-Type: application/json
Authorization: Bearer <token>
```

Body:

```json
{
  "dataViewParameters": {
    "CustomerID": "CUST847562"
  }
}
```

Important lesson:

- Do not pass extra parameters unless the Pega data view defines them.
- Earlier, passing both `CustomerID` and `OperatorID` caused this error:

```text
Additional parameters other than the user defined parameters are provided for dataview
```

Correct request:

```json
{
  "dataViewParameters": {
    "CustomerID": "CUST847562"
  }
}
```

Incorrect request:

```json
{
  "dataViewParameters": {
    "CustomerID": "CUST847562",
    "OperatorID": "CUST847562"
  }
}
```

### Step 10: Added Mapping from Pega Data View Rows to Portal UI

Skill used:

- `pega-constellation-bpm`: `C:\Users\ramma\.codex\skills\pega-constellation-bpm\SKILL.md`

Main file:

```text
src/services/portalDataService.ts
```

What it does:

- Calls data views.
- Extracts `pxResults`, `results`, `data`, or similar response shapes.
- Reads `pxResultCount` or similar count fields.
- Converts Pega rows into portal-friendly objects.

Examples:

- Policy row becomes `PolicySummary`.
- Claim row becomes `ClaimSummary`.
- Dashboard row becomes `DashboardSummary` and `UserProfile`.

Fallback behavior:

- If a data view fails, the portal keeps mock data instead of breaking the screen.

### Step 11: Created Change Address Case

Skills used:

- `pega-dx-apis`: `C:\Users\ramma\.codex\skills\pega-dx-apis\SKILL.md`
- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`
- `pega-constellation-bpm`: `C:\Users\ramma\.codex\skills\pega-constellation-bpm\SKILL.md`

Case type:

```text
IH-Insure-Work-ChangeAddress
```

Target URL:

```text
https://<pega-host>/prweb/PRAuth/app/insurehub/api/application/v2/cases?viewType=page&pageName=pyDetails
```

Request:

```json
{
  "caseTypeID": "IH-Insure-Work-ChangeAddress",
  "content": {},
  "processID": "pyStartCase"
}
```

For React SDK rendering, the final runtime call is made through PCore case APIs in `src/lib/constellation.tsx`:

```ts
PCore
  .getBootstrapUtils()
  .getCaseApi()
  .createCase(caseTypeId, PCore.getConstants().APP.APP, PCore.getConstants().PRIMARY, {
    pageName: PCore.getConstants().PY_DETAILS || 'pyDetails',
    renderInline: true,
    viewType: 'page'
  });
```

Plain English:

- The button does not just create a case in the background.
- It asks Pega to create the case and return the UI needed to show the first assignment.
- React SDK then renders that UI.

### Step 12: Fixed Direct Pega URL vs Localhost URL

Skill used:

- `pega-dx-apis`: `C:\Users\ramma\.codex\skills\pega-dx-apis\SKILL.md`

Problem:

- Some calls were going to `http://localhost:3502/prweb/...`.
- The user expected direct Pega URLs.

Fix:

```env
VITE_PEGA_DEV_PROXY=false
```

Result:

Calls now go directly to:

```text
https://<pega-host>/prweb/PRAuth/app/insurehub/api/application/v2/...
```

### Step 13: Fixed CORS and Channel Issues

Skills used:

- `pega-dx-apis`: `C:\Users\ramma\.codex\skills\pega-dx-apis\SKILL.md`
- `pega-constellation-bpm`: `C:\Users\ramma\.codex\skills\pega-constellation-bpm\SKILL.md`

Problems seen:

1. Browser preflight was blocked because the server did not return expected CORS headers.
2. Pega returned:

```text
GetInsured is not a valid channel.
```

Fixes discussed/applied on Pega side:

- Content Security Policy changed to `pxDefaultAllowAll`, matching the prior working app.
- Channel name/configuration was adjusted so Pega accepted requests.

Plain English:

- Postman can work even when browser calls fail.
- Browser calls must satisfy CORS/security rules.
- Pega channel names must match what Pega expects.

### Step 14: Added PCore/PConnect Render Bridge

Skill used:

- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

Main file:

```text
src/lib/constellation.tsx
```

Key responsibilities:

1. Wait for `window.PCore`.
2. Register a React render callback with `PCore.onPCoreReady`.
3. Initialize the SDK component map.
4. Render Pega PConnect metadata into the `pega-root` DOM node.
5. Use `PCore.getBootstrapUtils().getCaseApi().createCase(...)` for Change Address.

Important APIs used:

| API | Purpose |
| --- | --- |
| `PCore.onPCoreReady(callback)` | Runs when the Pega runtime is ready. |
| `getSdkComponentMap(localSdkComponentMap)` | Loads Pega SDK and local component map. |
| `createPConnectComponent()` | Converts PConnect metadata into React components. |
| `PCore.getStore()` | Gives SDK components access to Pega Redux/runtime state. |
| `PCore.getBootstrapUtils().loadRootComponent(...)` | Loads the root Pega component tree into a target DOM element. |
| `PCore.getInitialiser().initCoreContainers()` | Initializes Pega containers after root load. |
| `PCore.getBootstrapUtils().getCaseApi().createCase(...)` | Creates and renders a Pega case. |
| `PCore.getCoexistenceManager().getEventUtils().publishConstellationLoadedEvent()` | Notifies Constellation that rendering loaded. |

PConnect concepts used:

| PConnect Concept | Purpose |
| --- | --- |
| `getPConnect()` | Gives each rendered component access to its Pega metadata/context. |
| `getConfigProps()` | Reads resolved component configuration. |
| `getChildren()` | Reads child metadata/components. |
| `getActionsApi()` | Used internally by SDK components for assignment/action behavior. |
| `getCaseInfo()` | Used internally by SDK components for case metadata. |

### Step 15: Added Local SDK Component Map Fixes

Skill used:

- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

Main file:

```text
sdk-local-component-map.js
```

Current mappings:

```js
import RootContainer from './src/components/PegaRootContainer';
import HybridViewContainer from '@pega/react-sdk-components/lib/components/infra/Containers/ViewContainer/ViewContainer';
import TextContent from '@pega/react-sdk-components/lib/components/field/TextContent';

const localSdkComponentMap = {
  HybridViewContainer,
  RootContainer,
  Text: TextContent
};
```

Why this was needed:

- Pega returned metadata with `HybridViewContainer`.
- SDK component map had `ViewContainer`, but not `HybridViewContainer`.
- Prior working app mapped `Text` to `TextContent`; this project needed that too.

Without these mappings:

- Pega case creation succeeds.
- Assignment metadata loads.
- UI rendering fails with generic:

```text
Failed to display content. Contact the application administrator.
```

### Step 16: Added Custom PegaRootContainer

Skill used:

- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

Main file:

```text
src/components/PegaRootContainer.tsx
```

Why:

- SDK `RootContainer` showed messages such as:

```text
RootContainer: Has children. Trying to show ModalManager with children, etc.
RootContainer: Should be ModalManager, etc.
```

Fix:

- Custom root renders children directly.
- It also adds a `ModalViewContainer` so modal actions can still work.

Plain English:

- Pega’s root is like a frame for the case UI.
- The stock frame was not happy with our hybrid root shape.
- We added a small adapter frame so the case content appears in the portal.

### Step 17: Added Pega Render Diagnostics

Skill used:

- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

Main file:

```text
src/services/pegaRenderDiagnostics.ts
```

Why:

Pega SDK often shows only:

```text
Failed to display content. Contact the application administrator.
```

That message hides the real JavaScript error.

The diagnostic captures console errors like:

- Missing component mapping.
- `theme.spacing is not a function`.
- Missing theme extension.
- Component render errors.

It then displays the real error in the portal.

This helped identify and fix:

- Missing `Text` mapping.
- MUI theme mismatch.
- Missing `actionButtons.secondary`.

### Step 18: Fixed MUI Theme Problems for Pega SDK 25.1

Skill used:

- `pega-constellation`: `C:\Users\ramma\.codex\skills\pega-constellation\SKILL.md`

Problems:

1. `CaseView` crashed with:

```text
theme.spacing is not a function
```

2. `ActionButtons` crashed with:

```text
Cannot read properties of undefined (reading 'secondary')
```

Cause:

- Portal uses MUI 5.
- Pega SDK 25.1 brings MUI 6 components.
- Pega SDK components use `@mui/styles/makeStyles`.
- The SDK expects extra Pega theme keys, not just a basic MUI theme.

Fixes:

1. In `src/lib/constellation.tsx`, the Pega subtree uses SDK-compatible theme providers:

```ts
import CssBaseline from '@pega/react-sdk-components/node_modules/@mui/material/CssBaseline';
import { ThemeProvider } from '@pega/react-sdk-components/node_modules/@mui/material/styles';
import { ThemeProvider as StylesThemeProvider } from '@mui/styles';
```

2. The Pega render tree is wrapped with both providers:

```tsx
<StylesThemeProvider theme={pegaTheme}>
  <ThemeProvider theme={pegaTheme}>
    <CssBaseline />
    <PegaConnect {...props} />
  </ThemeProvider>
</StylesThemeProvider>
```

3. `src/theme-pega.ts` includes Pega-specific theme extensions:

```ts
actionButtons: {
  primary: {
    backgroundColor: '#0a6f8f',
    color: '#ffffff'
  },
  secondary: {
    backgroundColor: '#e8f1dd',
    color: '#26391a'
  }
},
embedded: {
  resolutionTextColor: '#4d5f68'
}
```

Plain English:

- The portal has its own visual theme.
- Pega rendered case screens need a Pega-compatible theme.
- We keep those separate so the portal UI and Pega UI can both work.

## 7. Authentication Design

### Login Authentication

Used for:

- Validating the real Pega operator username and password.
- Getting a token tied to the logged-in user.

Grant type:

```text
password
```

Source file:

```text
src/services/authService.ts
```

Method:

```ts
loginWithPega(username, password)
```

Result:

```ts
{
  user: {
    name: username,
    email: username,
    memberSince: 'Pega'
  },
  token: {
    accessToken,
    expiresAt,
    tokenType
  }
}
```

### API Authentication

Current behavior:

- For portal data and case actions, the app primarily uses the token obtained during login.
- That token is also given to Pega SDK auth using:

```ts
sdkSetAuthHeader(authHeader);
```

Why:

- User specifically requested that the same login access token be used for DX API calls.
- This keeps case creation and assignment rendering in the logged-in user context.

Config also supports separate API client credentials through:

```env
VITE_PEGA_API_CLIENT_ID=
VITE_PEGA_API_CLIENT_SECRET=
VITE_PEGA_API_GRANT_TYPE=client_credentials
```

But for Change Address rendering, the active path uses the user login token.

## 8. API Usage Detail

### OAuth Token API

Used by:

- `authenticateWithPassword`
- `authenticate`

Endpoint:

```text
POST /prweb/PRRestService/oauth2/v1/token
```

Login body:

```text
grant_type=password
client_id=<client id>
client_secret=<client secret>
username=<Pega operator>
password=<Pega password>
```

Client credentials body:

```text
grant_type=client_credentials
client_id=<client id>
client_secret=<client secret>
```

### Data View API

Used by:

- Dashboard
- Policies
- Claims

Endpoint format:

```text
POST /api/application/v2/data_views/{data_view_ID}
```

Example:

```text
POST /api/application/v2/data_views/D_CustomerDashboardList
```

Body:

```json
{
  "dataViewParameters": {
    "CustomerID": "CUST847562"
  }
}
```

### Create Case API

Used by:

- Service requests.
- Change Address flow.

Endpoint:

```text
POST /api/application/v2/cases?viewType=page&pageName=pyDetails
```

Body for Change Address:

```json
{
  "caseTypeID": "IH-Insure-Work-ChangeAddress",
  "content": {},
  "processID": "pyStartCase"
}
```

### Assignment API

Used by:

- Pega SDK internally after the case is created.

Endpoint shape:

```text
GET /api/application/v2/assignments/{assignmentID}?viewType=page&pageName=pyDetails
```

Plain English:

- Case creation starts the Pega work.
- Assignment APIs retrieve the current user task and the screen metadata needed to perform it.

### Assignment Action API

Used by:

- Pega SDK internally when user submits/cancels/buttons in the rendered assignment.

Endpoint shape:

```text
GET /api/application/v2/assignments/{assignmentID}/actions/{actionID}
PATCH /api/application/v2/assignments/{assignmentID}/actions/{actionID}
```

Plain English:

- `GET` gets the form/action details.
- `PATCH` submits the completed form/action.

## 9. PCore and PConnect Usage Detail

### PCore

PCore is the main Pega runtime object loaded in the browser. It is available as:

```ts
window.PCore
```

APIs used in this project:

| API | File | Purpose |
| --- | --- | --- |
| `PCore.onPCoreReady(...)` | `src/lib/constellation.tsx` | Wait until Pega runtime is ready. |
| `PCore.getStore()` | `src/lib/constellation.tsx` | Provide SDK state store to React components. |
| `PCore.getBootstrapUtils().loadRootComponent(...)` | `src/lib/constellation.tsx` | Create Pega root UI container. |
| `PCore.getInitialiser().initCoreContainers()` | `src/lib/constellation.tsx` | Initialize Pega container runtime. |
| `PCore.getBootstrapUtils().getCaseApi().createCase(...)` | `src/lib/constellation.tsx` | Create and render Change Address case. |
| `PCore.getConstants()` | `src/lib/constellation.tsx`, `src/App.tsx` | Use official runtime constants like `APP`, `PRIMARY`, `PY_DETAILS`. |
| `PCore.getPubSubUtils().subscribe(...)` | `src/App.tsx` | Listen for cancel/finish/case-created events. |
| `PCore.getPubSubUtils().unsubscribe(...)` | `src/App.tsx` | Clean up event subscriptions. |
| `PCore.getCoexistenceManager().getEventUtils().publishConstellationLoadedEvent()` | `src/lib/constellation.tsx` | Notify Pega runtime that Constellation loaded. |

### PConnect

PConnect is the per-component Pega connection object. Each rendered field/view/assignment has a PConnect context.

Where it is used:

```text
src/lib/constellation.tsx
```

Key call:

```ts
createPConnectComponent()
```

This turns Pega metadata into React components.

The SDK internally uses PConnect APIs such as:

| PConnect API | Purpose |
| --- | --- |
| `getConfigProps()` | Get resolved component config. |
| `getRawMetadata()` | Get original Pega metadata. |
| `getChildren()` | Read child components. |
| `getActionsApi()` | Perform actions like submit/open local action. |
| `getCaseInfo()` | Read current case information. |
| `getValue(...)` | Read values from Pega context. |

Plain English:

- PCore is the Pega engine.
- PConnect is the connection from each Pega-rendered React component back to that engine.

## 10. Final Current Flow

### Login Flow

1. User opens `http://localhost:3502/`.
2. User enters Pega operator ID and password.
3. App calls OAuth token endpoint.
4. Pega validates credentials.
5. App stores access token in React state.
6. App treats username as `CustomerID`.
7. User lands on Dashboard.

### Dashboard Load Flow

1. App reads logged-in username.
2. App builds:

```json
{
  "dataViewParameters": {
    "CustomerID": "<logged-in username>"
  }
}
```

3. App calls:

```text
D_CustomerDashboardList
D_CustomerPoliciesList
D_CustomerClaimsList
```

4. App maps response rows into dashboard, policies, and claims.
5. If Pega data fails, mock data remains visible.

### Change Address Flow

1. User opens Services tab.
2. User clicks Change Address.
3. App checks that PCore is ready.
4. App sets Pega SDK auth header:

```ts
sdkSetAuthHeader(`Bearer ${accessToken}`)
```

5. App loads Pega hybrid root into:

```html
<div id="pega-root" class="pega-workarea"></div>
```

6. App calls:

```ts
PCore.getBootstrapUtils().getCaseApi().createCase(...)
```

7. Pega creates `IH-Insure-Work-ChangeAddress`.
8. Pega returns case/assignment metadata.
9. React SDK renders the Pega assignment UI.

## 11. Troubleshooting Log

### Problem: Login allowed any username/password

Cause:

- Early mock login path was too permissive.

Fix:

- Login now calls Pega OAuth password grant.
- Bad Pega credentials are rejected.

### Problem: App said OAuth not configured after server restart

Cause:

- Vite only reads `.env` at startup.
- If the dev server starts without `.env` values or from wrong directory, config is missing.

Fix:

- Ensure `.env` exists in `F:\InsureHub`.
- Restart Vite after `.env` changes.

### Problem: Data view validation failed with extra parameter

Cause:

- Request sent `CustomerID` and `OperatorID`.
- Pega data view only expected `CustomerID`.

Fix:

- Data view requests now send only configured customer parameter.

### Problem: Page type data view not supported

Cause:

- Original data page was page type.
- DX data views API expects supported data view structure.

Fix:

- Created list data views:

```text
D_CustomerDashboardList
D_CustomerPoliciesList
D_CustomerClaimsList
```

### Problem: Calls went to localhost paths

Cause:

- Vite dev proxy mode was active.

Fix:

```env
VITE_PEGA_DEV_PROXY=false
```

### Problem: Browser CORS issue

Cause:

- Pega server/browser preflight policy did not allow the local app origin/headers.

Fix:

- Pega CSP/CORS settings were adjusted to match prior working app behavior.

### Problem: Invalid channel

Error:

```text
GetInsured is not a valid channel.
```

Cause:

- Pega channel configuration did not match the request.

Fix:

- Adjusted channel/context configuration on Pega side.

### Problem: Generic "Failed to display content"

Cause:

- React SDK swallowed real runtime errors behind a generic message.

Fix:

- Added `pegaRenderDiagnostics.ts` to surface actual errors.

### Problem: Missing component mapping

Cause:

- SDK local component map did not include `HybridViewContainer` and `Text`.

Fix:

- Added these mappings in `sdk-local-component-map.js`.

### Problem: `theme.spacing is not a function`

Cause:

- Pega SDK 25.1 components use SDK/MUI styling assumptions.
- Portal MUI theme alone was not enough.

Fix:

- Wrapped Pega subtree with both Material and Styles theme providers.
- Used Pega SDK-compatible theme creation.

### Problem: `Cannot read properties of undefined (reading 'secondary')`

Cause:

- Pega SDK `ActionButtons` expected `theme.actionButtons.secondary`.

Fix:

- Added `actionButtons.primary`, `actionButtons.secondary`, and `embedded.resolutionTextColor` to `src/theme-pega.ts`.

## 12. How to Run the Project

From:

```powershell
cd F:\InsureHub
```

Install dependencies:

```powershell
npm install
```

Run dev server:

```powershell
npm run dev
```

Open:

```text
http://localhost:3502/
```

Build:

```powershell
npm run build
```

If Pega config changes:

1. Update `.env`.
2. Stop Vite.
3. Start Vite again.
4. Hard refresh browser.

## 13. Important Rules for Future Work

1. Keep `.env` secrets out of git.
2. Use logged-in username as `CustomerID`.
3. Do not add extra data view parameters unless Pega data view defines them.
4. Use page list data views for portal lists.
5. Use direct Pega URLs when `VITE_PEGA_DEV_PROXY=false`.
6. Keep the Pega SDK render theme separate from the portal MUI theme.
7. Keep `sdk-local-component-map.js` mappings for `HybridViewContainer`, `RootContainer`, and `Text`.
8. Use the diagnostic alert instead of guessing when Pega shows generic render failure.
9. Use PCore case API for rendered Change Address flow.
10. Use DX API client for raw data view and non-rendered case/data operations.

## 14. Recommended Next Workflow: Address Change

Now that Change Address renders:

1. Confirm the first assignment fields render correctly.
2. Confirm any required fields are visible.
3. Enter test data.
4. Submit the assignment.
5. Watch Network tab for:

```text
PATCH /assignments/{assignmentID}/actions/{actionID}
```

6. Confirm case advances in Pega.
7. If it fails, capture the diagnostic message and the failing network response.

## 15. Summary for Non-IT Readers

The GetInsured portal is like a shop window for customers. React draws the shop window: login, dashboard, policies, claims, and services.

Pega is the business engine behind the counter. It checks who the customer is, stores policy/claim data, and runs service workflows like Change Address.

When the customer clicks Change Address:

1. React says, "Pega, please start a Change Address case."
2. Pega creates the case.
3. Pega sends back the screen definition.
4. React SDK displays that Pega screen inside GetInsured.
5. The customer completes the Pega task without leaving the GetInsured portal.

That is the core integration pattern for this project.
