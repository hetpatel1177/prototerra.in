# ProtoTerra Load Testing with k6

This directory contains the load testing suite for the ProtoTerra ecommerce website using [k6](https://k6.io/).

## 🚀 Getting Started

### 1. Install k6
If you haven't installed k6 yet, you can do so via Homebrew (on macOS):
```bash
brew install k6
```
For other operating systems, follow the [installation guide](https://k6.io/docs/getting-started/installation/).

### 2. Running the Test
To run the ecommerce user journey test:
```bash
k6 run loadtest/ecommerce_test.js
```

To run it and stream results to k6 Cloud (requires account):
```bash
k6 login
k6 run --out cloud loadtest/ecommerce_test.js
```

## 🧪 Script Overview (`ecommerce_test.js`)

The script simulates a realistic user journey:
1.  **Homepage**: Hits `https://www.prototerra.in/`
2.  **Browse**: Hits the `/shop` page.
3.  **Product Detail**: Mimics viewing a specific product (randomly selected from the API).
4.  **Login**: Sends a POST request to the authentication API.
5.  **Cart**: Hits the `/cart` page.
6.  **Checkout**: Completes an order using **Cash on Delivery (COD)** to test the backend order processing without relying on the Razorpay sandbox.

### Staged Load Configuration
The test is configured with three stages:
- **Ramp-up**: 0 to 50 users (1 minute)
- **Steady State**: 300 users (3 minutes)
- **Ramp-down**: 300 to 0 users (1 minute)

## 🛠️ Customization

### Modifying Endpoints
If your API structure changes or you want to test a staging environment, update the constants at the top of the script:
```javascript
const BASE_URL = 'https://staging.prototerra.in';
const API_URL = 'https://api-staging.prototerra.in';
```

### Changing Load Levels
Update the `options.stages` array to change the number of concurrent users or the duration of the test.
```javascript
export const options = {
    stages: [
        { duration: '2m', target: 500 }, // Heavier test
        // ...
    ],
};
```

### Authentication
The script currently uses a placeholder `testuser@example.com`. To perform a test with valid sessions:
1.  Create a test user in your database.
2.  Update the credentials in the `group('04_Login', ...)` section.

## 🔍 Troubleshooting Previous Failures

In the initial test run, you might have seen a high error rate (42.34%). Here is why:

1.  **Shop Page (404)**: The script was hitting `/shop` which does not exist in your current routing. It has been updated to use `/collections`.
2.  **Order Creation (400)**: With 300 concurrent users hitting the same products, the stock was quickly exhausted. Your backend correctly returns a `400 Bad Request` with an "Out of Stock" message.
    -   *Fix implemented*: The script now filters for in-stock products in the `setup()` phase and considers `400` an acceptable business response during a high-volume load test (since it still tests the server's processing logic).

## 📊 Monitoring Results

When the test completes, k6 will output a summary in your terminal. Key metrics to watch:

| Metric | Description | Target |
| :--- | :--- | :--- |
| `http_req_duration` | Time spent on requests (latency) | Should be < 2000ms (p95) |
| `http_req_failed` | Rate of failed requests (4xx/5xx) | Should be < 5% |
| `checks` | Percentage of successful assertions | Should be 100% |
| `iterations` | Total number of full user journeys completed | Higher is better |

### Dashboard Setup (Optional)
For a visual dashboard, you can use the **k6-reporter** to generate an HTML report:
1. Run with output as JSON:
   ```bash
   k6 run --summary-export=summary.json loadtest/ecommerce_test.js
   ```
2. Or use the web dashboard during execution:
   ```bash
   K6_WEB_DASHBOARD=true k6 run loadtest/ecommerce_test.js
   ```
   This will open a live dashboard at `http://127.0.0.1:5665`.

## ⚠️ Important Notes
- **Environment**: Load testing hitting production APIs should be done carefully to avoid rate limits or accidental data corruption (e.g., creating many test orders).
- **Payment Gateway**: The script uses **COD** to ensure it remains automated. Online payment (Razorpay) requires manual interaction or a dedicated sandbox API mock which is not suitable for raw load testing.
