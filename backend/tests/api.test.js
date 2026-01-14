/**
 * SnowAtlas Backend API Tests
 * 使用 Jest 和 Supertest 进行API自动化测试
 *
 * 运行测试:
 * npm test              - 运行所有测试并生成覆盖率报告
 * npm run test:watch    - 监视模式运行测试
 * npm run test:api      - 只运行API测试
 */

const request = require('supertest');
const app = require('../server');
const { pool } = require('../db');

describe('SnowAtlas Backend API Tests', () => {
  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  // ========================================
  // 健康检查测试
  // ========================================
  describe('GET /health', () => {
    test('应该返回服务器健康状态', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  // ========================================
  // 雪场相关接口测试
  // ========================================
  describe('Resorts API', () => {

    describe('GET /api/resorts', () => {
      test('应该返回所有雪场', async () => {
        const response = await request(app).get('/api/resorts');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('count');
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      test('每个雪场应该包含必要字段', async () => {
        const response = await request(app).get('/api/resorts');
        const resort = response.body.data[0];

        expect(resort).toHaveProperty('id');
        expect(resort).toHaveProperty('name');
        expect(resort.name).toHaveProperty('en');
        expect(resort.name).toHaveProperty('zh');
        expect(resort).toHaveProperty('country');
        expect(resort).toHaveProperty('countryCode');
        expect(resort).toHaveProperty('coordinates');
        expect(resort.coordinates).toHaveProperty('lat');
        expect(resort.coordinates).toHaveProperty('lon');
        expect(resort).toHaveProperty('elevation');
        expect(resort.elevation).toHaveProperty('base');
        expect(resort.elevation).toHaveProperty('summit');
      });
    });

    describe('GET /api/resorts/nearby', () => {
      test('应该返回附近的雪场', async () => {
        const response = await request(app).get('/api/resorts/nearby');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('count');
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      test('应该支持limit参数', async () => {
        const limit = 3;
        const response = await request(app).get(`/api/resorts/nearby?limit=${limit}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeLessThanOrEqual(limit);
      });

      test('附近的雪场应该包含距离信息', async () => {
        const response = await request(app).get('/api/resorts/nearby');

        if (response.body.data.length > 0) {
          const resort = response.body.data[0];
          expect(resort).toHaveProperty('distance');
        }
      });
    });

    describe('GET /api/resorts/:id', () => {
      test('应该返回指定ID的雪场', async () => {
        const resortId = 'niseko';
        const response = await request(app).get(`/api/resorts/${resortId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.id).toBe(resortId);
      });

      test('不存在的雪场应该返回404', async () => {
        const response = await request(app).get('/api/resorts/nonexistent-resort');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Resort not found');
      });

      test('应该返回完整的雪场信息', async () => {
        const response = await request(app).get('/api/resorts/whistler-blackcomb');
        const resort = response.body.data;

        expect(resort.name.en).toBe('Whistler Blackcomb');
        expect(resort.country).toBe('Canada');
        expect(resort.countryCode).toBe('CA');
      });
    });

    describe('GET /api/resorts/country/:countryCode', () => {
      test('应该返回指定国家的所有雪场', async () => {
        const countryCode = 'JP';
        const response = await request(app).get(`/api/resorts/country/${countryCode}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('count');
        expect(response.body).toHaveProperty('data');

        // 验证所有返回的雪场都属于该国家
        response.body.data.forEach(resort => {
          expect(resort.countryCode).toBe(countryCode);
        });
      });

      test('应该支持多个国家代码', async () => {
        const countries = ['US', 'CA', 'FR', 'JP', 'CN'];

        for (const code of countries) {
          const response = await request(app).get(`/api/resorts/country/${code}`);
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
        }
      });

      test('没有雪场的国家应该返回空数组', async () => {
        const response = await request(app).get('/api/resorts/country/XX');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(0);
        expect(response.body.data).toEqual([]);
      });
    });
  });

  // ========================================
  // 天气相关接口测试
  // ========================================
  describe('Weather API', () => {

    describe('GET /api/weather/:resortId', () => {
      test('应该返回雪场的天气数据', async () => {
        const resortId = 'niseko';
        const response = await request(app).get(`/api/weather/${resortId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
      });

      test('天气数据应该包含必要字段', async () => {
        const response = await request(app).get('/api/weather/niseko');
        const data = response.body.data;

        // 验证resort信息
        expect(data).toHaveProperty('resort');
        expect(data.resort).toHaveProperty('id');
        expect(data.resort).toHaveProperty('name');
        expect(data.resort).toHaveProperty('coordinates');

        // 验证weather信息
        expect(data).toHaveProperty('weather');
        expect(data.weather).toHaveProperty('current');
        expect(data.weather).toHaveProperty('forecast');
        expect(data.weather).toHaveProperty('historical');

        // 验证snowConditions信息
        expect(data).toHaveProperty('snowConditions');
      });

      test('当前天气应该包含完整数据', async () => {
        const response = await request(app).get('/api/weather/niseko');
        const current = response.body.data.weather.current;

        expect(current).toHaveProperty('temp');
        expect(current).toHaveProperty('feels_like');
        expect(current).toHaveProperty('humidity');
        expect(current).toHaveProperty('wind_speed');
        expect(current).toHaveProperty('weather');
        expect(current.weather).toHaveProperty('main');
        expect(current.weather).toHaveProperty('description');
        expect(current).toHaveProperty('timestamp');
      });

      test('预报数据应该有7天', async () => {
        const response = await request(app).get('/api/weather/niseko');
        const forecast = response.body.data.weather.forecast;

        expect(Array.isArray(forecast)).toBe(true);
        expect(forecast.length).toBe(7);
      });

      test('每天的预报应该包含必要字段', async () => {
        const response = await request(app).get('/api/weather/niseko');
        const day = response.body.data.weather.forecast[0];

        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('temp');
        expect(day.temp).toHaveProperty('min');
        expect(day.temp).toHaveProperty('max');
        expect(day.temp).toHaveProperty('day');
        expect(day).toHaveProperty('weather');
        expect(day).toHaveProperty('snow');
        expect(day).toHaveProperty('pop');
      });

      test('雪况汇总应该包含完整信息', async () => {
        const response = await request(app).get('/api/weather/niseko');
        const snow = response.body.data.snowConditions;

        expect(snow).toHaveProperty('totalSnowForecast');
        expect(snow).toHaveProperty('snowyDays');
        expect(snow).toHaveProperty('avgTemp');
        expect(snow).toHaveProperty('quality');
        expect(snow).toHaveProperty('lastUpdate');

        // 验证雪质类型
        expect(['powder', 'good', 'wet', 'slushy', 'unknown']).toContain(snow.quality);
      });

      test('不存在的雪场应该返回404', async () => {
        const response = await request(app).get('/api/weather/nonexistent-resort');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('POST /api/weather/batch', () => {
      test('应该批量返回多个雪场的天气', async () => {
        const resortIds = ['niseko', 'whistler-blackcomb', 'chamonix'];
        const response = await request(app)
          .post('/api/weather/batch')
          .send({ resortIds });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('count');
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      test('每个雪场应该包含天气和雪况数据', async () => {
        const resortIds = ['niseko', 'vail'];
        const response = await request(app)
          .post('/api/weather/batch')
          .send({ resortIds });

        const resortData = response.body.data[0];
        expect(resortData).toHaveProperty('resortId');
        expect(resortData).toHaveProperty('name');
        expect(resortData).toHaveProperty('weather');
        expect(resortData).toHaveProperty('snowConditions');
      });

      test('空数组应该返回400错误', async () => {
        const response = await request(app)
          .post('/api/weather/batch')
          .send({ resortIds: [] });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
      });

      test('缺少resortIds字段应该返回400错误', async () => {
        const response = await request(app)
          .post('/api/weather/batch')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
      });

      test('超过10个雪场应该返回400错误', async () => {
        const resortIds = [
          'niseko', 'hakuba', 'whistler-blackcomb', 'vail',
          'aspen-snowmass', 'park-city', 'chamonix', 'zermatt',
          'st-anton', 'val-thorens', 'cortina'
        ];
        const response = await request(app)
          .post('/api/weather/batch')
          .send({ resortIds });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toContain('10');
      });

      test('应该正确处理部分无效的雪场ID', async () => {
        const resortIds = ['niseko', 'invalid-id', 'vail'];
        const response = await request(app)
          .post('/api/weather/batch')
          .send({ resortIds });

        expect(response.status).toBe(200);
        // 只返回有效的雪场数据
        expect(response.body.data.length).toBeLessThan(resortIds.length);
      });
    });
  });

  // ========================================
  // 错误处理测试
  // ========================================
  describe('Error Handling', () => {

    test('不存在的路由应该返回404', async () => {
      const response = await request(app).get('/api/nonexistent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    test('错误响应应该包含合适的字段', async () => {
      const response = await request(app).get('/api/resorts/nonexistent');

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  // ========================================
  // CORS测试
  // ========================================
  describe('CORS', () => {

    test('应该支持CORS', async () => {
      const response = await request(app)
        .get('/api/resorts')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  // ========================================
  // 数据完整性测试
  // ========================================
  describe('Data Integrity', () => {

    test('所有雪场ID应该唯一', async () => {
      const response = await request(app).get('/api/resorts');
      const ids = response.body.data.map(r => r.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    test('所有雪场应该有有效的坐标', async () => {
      const response = await request(app).get('/api/resorts');

      response.body.data.forEach(resort => {
        expect(resort.coordinates.lat).toBeGreaterThanOrEqual(-90);
        expect(resort.coordinates.lat).toBeLessThanOrEqual(90);
        expect(resort.coordinates.lon).toBeGreaterThanOrEqual(-180);
        expect(resort.coordinates.lon).toBeLessThanOrEqual(180);
      });
    });

    test('所有雪场的海拔应该合理', async () => {
      const response = await request(app).get('/api/resorts');

      response.body.data.forEach(resort => {
        expect(resort.elevation.base).toBeGreaterThan(0);
        expect(resort.elevation.summit).toBeGreaterThan(resort.elevation.base);
        expect(resort.elevation.summit).toBeLessThan(9000); // 最高山峰约8800m
      });
    });
  });

  // ========================================
  // 性能测试
  // ========================================
  describe('Performance', () => {

    test('获取所有雪场应该在合理时间内完成', async () => {
      const startTime = Date.now();
      await request(app).get('/api/resorts');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    test('获取天气数据应该在合理时间内完成', async () => {
      const startTime = Date.now();
      await request(app).get('/api/weather/niseko');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
    }, 10000); // 设置更长的超时时间
  });
});

// ========================================
// 集成测试
// ========================================
describe('Integration Tests', () => {

  test('完整用户流程: 获取附近雪场 -> 查看详情 -> 获取天气', async () => {
    // 步骤1: 获取附近雪场
    const nearbyResponse = await request(app).get('/api/resorts/nearby?limit=1');
    expect(nearbyResponse.status).toBe(200);

    const resortId = nearbyResponse.body.data[0].id;

    // 步骤2: 查看雪场详情
    const detailResponse = await request(app).get(`/api/resorts/${resortId}`);
    expect(detailResponse.status).toBe(200);

    // 步骤3: 获取天气
    const weatherResponse = await request(app).get(`/api/weather/${resortId}`);
    expect(weatherResponse.status).toBe(200);
    expect(weatherResponse.body.data.resort.id).toBe(resortId);
  });

  test('监控列表流程: 选择多个雪场 -> 批量获取天气', async () => {
    // 步骤1: 获取日本的雪场
    const jpResponse = await request(app).get('/api/resorts/country/JP');
    expect(jpResponse.status).toBe(200);

    // 步骤2: 选择前两个加入监控列表
    const resortIds = jpResponse.body.data.slice(0, 2).map(r => r.id);

    // 步骤3: 批量获取天气
    const weatherResponse = await request(app)
      .post('/api/weather/batch')
      .send({ resortIds });

    expect(weatherResponse.status).toBe(200);
    expect(weatherResponse.body.data.length).toBeGreaterThan(0);
  });
});
