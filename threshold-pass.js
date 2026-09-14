import http from 'k6/http';
import { sleep, check } from 'k6';

// Өөрийн baseline хэмжилтэд үндэслэсэн SLO: 5 VU үеийн baseline p95 нь 263.48ms байсан,
// SLO = baseline x 1.5 (дээш бүхэлчилсэн) -> p(95) < 400ms.
export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://test.k6.io');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
