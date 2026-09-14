import http from 'k6/http';
import { sleep, check } from 'k6';

// Локал baseline p95 (11.8ms) x 1.5 ≈ 18ms-ээр гаргасан SLO-той тогтвортой PASS шалгалт.
export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<18'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('http://localhost:3101/');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
