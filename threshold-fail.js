import http from 'k6/http';
import { sleep, check } from 'k6';

// FAIL гаралтыг үзүүлэх зорилгоор санаатайгаар хатуу тавьсан threshold (quality gate).
export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<50'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://test.k6.io');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
