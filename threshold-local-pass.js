import http from 'k6/http';
import { sleep, check } from 'k6';

// Stable PASS against local server (no internet jitter).
export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<100'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('http://localhost:3101/');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
