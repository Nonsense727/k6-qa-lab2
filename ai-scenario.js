import http from 'k6/http';
import { check, group, sleep } from 'k6';

// AI туслахын санал болгосон хэрэглэгчийн зан төлөвийн scenario:
// Нүүр хуудас үзэх -> Хайлт / шүүлт хийх.
// Бай URL-ыг ёс зүйн дүрмийн дагуу зөвшөөрөгдсөн test.k6.io руу зааж тохируулсан.
export const options = {
  stages: [
    { duration: '15s', target: 5 },
    { duration: '30s', target: 15 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  group('1. Нүүр хуудас нээх', function () {
    const resHome = http.get('https://test.k6.io/');
    check(resHome, {
      'нүүр хуудасны статус 200': (r) => r.status === 200,
    });
  });

  sleep(1);

  group('2. Хайлт / бүтээгдэхүүн харах', function () {
    const resSearch = http.get('https://test.k6.io/?tag=pizza');
    check(resSearch, {
      'хайлт амжилттай 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}
