# SnowAtlas Backend API Documentation

完整的后端API接口文档

## 基础信息

- **Base URL**: `http://localhost:5001`
- **API Version**: 1.0.0
- **Content-Type**: `application/json`
- **Authentication**: 无需认证

---

## API端点

### 健康检查

#### GET /health

检查服务器运行状态

**请求**
```http
GET /health
```

**响应**
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T15:00:00.000Z",
  "environment": "development"
}
```

**状态码**
- `200 OK` - 服务器正常运行

---

## 雪场相关接口

### 1. 获取所有雪场

#### GET /api/resorts

返回系统中所有滑雪场的信息

**请求**
```http
GET /api/resorts
```

**响应**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "id": "whistler-blackcomb",
      "name": {
        "en": "Whistler Blackcomb",
        "zh": "惠斯勒黑梳山"
      },
      "country": "Canada",
      "countryCode": "CA",
      "region": {
        "en": "British Columbia",
        "zh": "不列颠哥伦比亚省"
      },
      "coordinates": {
        "lat": 50.1163,
        "lon": -122.9574
      },
      "elevation": {
        "base": 675,
        "summit": 2284
      },
      "popularity": 10,
      "timezone": "America/Vancouver"
    }
    // ... 更多雪场
  ]
}
```

**状态码**
- `200 OK` - 成功返回数据
- `500 Internal Server Error` - 服务器错误

---

### 2. 获取附近雪场

#### GET /api/resorts/nearby

根据用户IP地址返回附近的滑雪场

**请求**
```http
GET /api/resorts/nearby?limit=5
```

**查询参数**
| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| limit | integer | 否 | 5 | 返回的雪场数量 |

**响应**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "vail",
      "name": {
        "en": "Vail Mountain Resort",
        "zh": "韦尔雪山度假村"
      },
      "country": "USA",
      "countryCode": "US",
      "region": {
        "en": "Colorado",
        "zh": "科罗拉多州"
      },
      "coordinates": {
        "lat": 39.6403,
        "lon": -106.3742
      },
      "elevation": {
        "base": 2500,
        "summit": 3527
      },
      "popularity": 10,
      "timezone": "America/Denver",
      "distance": 667
    }
    // ... 更多雪场
  ]
}
```

**说明**
- 根据IP地址的地理位置计算距离
- 如果无法获取位置，则返回最热门的雪场
- 距离在500km内的雪场会按热度排序
- `distance` 字段以公里为单位

**状态码**
- `200 OK` - 成功返回数据
- `500 Internal Server Error` - 服务器错误

---

### 3. 获取指定雪场

#### GET /api/resorts/:id

根据雪场ID返回详细信息

**请求**
```http
GET /api/resorts/niseko
```

**路径参数**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | 是 | 雪场唯一标识符 |

**响应**
```json
{
  "success": true,
  "data": {
    "id": "niseko",
    "name": {
      "en": "Niseko United",
      "zh": "二世谷联合雪场"
    },
    "country": "Japan",
    "countryCode": "JP",
    "region": {
      "en": "Hokkaido",
      "zh": "北海道"
    },
    "coordinates": {
      "lat": 42.8048,
      "lon": 140.6874
    },
    "elevation": {
      "base": 308,
      "summit": 1308
    },
    "popularity": 10,
    "timezone": "Asia/Tokyo"
  }
}
```

**错误响应**
```json
{
  "success": false,
  "message": "Resort not found"
}
```

**状态码**
- `200 OK` - 成功返回数据
- `404 Not Found` - 雪场不存在
- `500 Internal Server Error` - 服务器错误

---

### 4. 按国家获取雪场

#### GET /api/resorts/country/:countryCode

返回指定国家的所有滑雪场

**请求**
```http
GET /api/resorts/country/JP
```

**路径参数**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| countryCode | string | 是 | 两位国家代码（ISO 3166-1 alpha-2） |

**支持的国家代码**
- `CA` - 加拿大
- `US` - 美国
- `FR` - 法国
- `CH` - 瑞士
- `AT` - 奥地利
- `IT` - 意大利
- `JP` - 日本
- `CN` - 中国

**响应**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "niseko",
      "name": {
        "en": "Niseko United",
        "zh": "二世谷联合雪场"
      },
      "country": "Japan",
      "countryCode": "JP"
      // ... 其他字段
    },
    {
      "id": "hakuba",
      "name": {
        "en": "Hakuba Valley",
        "zh": "白马谷"
      },
      "country": "Japan",
      "countryCode": "JP"
      // ... 其他字段
    }
  ]
}
```

**状态码**
- `200 OK` - 成功返回数据（即使没有找到雪场也返回空数组）
- `500 Internal Server Error` - 服务器错误

---

## 天气相关接口

### 5. 获取雪场天气

#### GET /api/weather/:resortId

返回指定雪场的完整天气数据，包括当前天气、7天预报和雪况汇总

**请求**
```http
GET /api/weather/niseko
```

**路径参数**
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| resortId | string | 是 | 雪场唯一标识符 |

**响应**
```json
{
  "success": true,
  "data": {
    "resort": {
      "id": "niseko",
      "name": {
        "en": "Niseko United",
        "zh": "二世谷联合雪场"
      },
      "coordinates": {
        "lat": 42.8048,
        "lon": 140.6874
      }
    },
    "weather": {
      "current": {
        "temp": -2.5,
        "feels_like": -5.8,
        "humidity": 85,
        "wind_speed": 12.5,
        "weather": {
          "id": 601,
          "main": "Snow",
          "description": "light snow",
          "icon": "13d"
        },
        "snow_1h": 1.5,
        "timestamp": 1768317467
      },
      "historical": [],
      "forecast": [
        {
          "date": 1768317467,
          "temp": {
            "min": -5.2,
            "max": 0.8,
            "day": -2.2
          },
          "weather": {
            "id": 600,
            "main": "Snow",
            "description": "light snow",
            "icon": "13d"
          },
          "snow": 12.5,
          "humidity": 88,
          "wind_speed": 15.2,
          "pop": 0.85
        }
        // ... 更多天的预报
      ]
    },
    "snowConditions": {
      "totalSnowForecast": 45.3,
      "snowyDays": 5,
      "avgTemp": -3.2,
      "quality": "powder",
      "lastUpdate": "2026-01-13T15:00:00.000Z"
    }
  }
}
```

**响应字段说明**

**current (当前天气)**
| 字段 | 类型 | 说明 |
|------|------|------|
| temp | number | 当前温度（摄氏度） |
| feels_like | number | 体感温度（摄氏度） |
| humidity | number | 相对湿度（%） |
| wind_speed | number | 风速（km/h） |
| weather.main | string | 天气主要类型 |
| weather.description | string | 详细天气描述 |
| snow_1h | number | 过去1小时降雪量（cm） |
| timestamp | number | Unix时间戳（秒） |

**forecast (预报数据)**
| 字段 | 类型 | 说明 |
|------|------|------|
| date | number | Unix时间戳（秒） |
| temp.min | number | 最低温度（摄氏度） |
| temp.max | number | 最高温度（摄氏度） |
| temp.day | number | 平均温度（摄氏度） |
| snow | number | 当日预计降雪量（cm） |
| pop | number | 降水概率（0-1） |

**snowConditions (雪况汇总)**
| 字段 | 类型 | 说明 |
|------|------|------|
| totalSnowForecast | number | 7天预计总降雪量（cm） |
| snowyDays | number | 预计降雪天数 |
| avgTemp | number | 7天平均温度（摄氏度） |
| quality | string | 雪质评估：powder/good/wet/slushy |
| lastUpdate | string | 最后更新时间（ISO 8601） |

**天气类型说明**
- `Clear` - 晴朗
- `Clouds` - 多云
- `Rain` - 雨
- `Snow` - 雪
- `Drizzle` - 毛毛雨
- `Fog` - 雾
- `Thunderstorm` - 雷暴

**错误响应**
```json
{
  "success": false,
  "message": "Resort not found"
}
```

**状态码**
- `200 OK` - 成功返回数据
- `404 Not Found` - 雪场不存在
- `500 Internal Server Error` - 获取天气数据失败

---

### 6. 批量获取天气

#### POST /api/weather/batch

批量获取多个雪场的天气数据

**请求**
```http
POST /api/weather/batch
Content-Type: application/json

{
  "resortIds": ["niseko", "whistler-blackcomb", "chamonix"]
}
```

**请求体**
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| resortIds | array | 是 | 雪场ID数组，最多10个 |

**响应**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "resortId": "niseko",
      "name": {
        "en": "Niseko United",
        "zh": "二世谷联合雪场"
      },
      "weather": {
        "current": { /* ... */ },
        "historical": [],
        "forecast": [ /* ... */ ]
      },
      "snowConditions": {
        "totalSnowForecast": 45.3,
        "snowyDays": 5,
        "avgTemp": -3.2,
        "quality": "powder",
        "lastUpdate": "2026-01-13T15:00:00.000Z"
      }
    }
    // ... 更多雪场
  ]
}
```

**说明**
- 最多可以同时请求10个雪场
- 如果某个雪场ID无效，该雪场将被跳过（不会返回在结果中）
- 返回的数据结构与单个雪场天气接口相同

**错误响应**
```json
{
  "success": false,
  "message": "resortIds must be a non-empty array"
}
```

或

```json
{
  "success": false,
  "message": "Maximum 10 resorts per batch request"
}
```

**状态码**
- `200 OK` - 成功返回数据
- `400 Bad Request` - 请求参数错误
- `500 Internal Server Error` - 服务器错误

---

## 错误处理

所有API错误都遵循以下响应格式：

```json
{
  "success": false,
  "message": "错误描述信息",
  "error": "详细错误信息（仅开发环境）"
}
```

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 数据来源

### 天气数据
- **API**: [Open-Meteo](https://open-meteo.com/)
- **特点**: 免费、无需API密钥、无速率限制
- **数据**: 基于多个气象模型的高质量预报数据

### 地理位置
- **库**: geoip-lite
- **功能**: 根据IP地址确定用户大致位置
- **精度**: 城市级别

---

## 使用示例

### cURL示例

```bash
# 获取所有雪场
curl http://localhost:5001/api/resorts

# 获取附近雪场
curl http://localhost:5001/api/resorts/nearby?limit=3

# 获取指定雪场
curl http://localhost:5001/api/resorts/niseko

# 按国家获取
curl http://localhost:5001/api/resorts/country/JP

# 获取天气
curl http://localhost:5001/api/weather/niseko

# 批量获取天气
curl -X POST http://localhost:5001/api/weather/batch \
  -H "Content-Type: application/json" \
  -d '{"resortIds":["niseko","whistler-blackcomb"]}'
```

### JavaScript示例

```javascript
// 使用 fetch API
const getWeather = async (resortId) => {
  const response = await fetch(`http://localhost:5001/api/weather/${resortId}`);
  const data = await response.json();
  return data;
};

// 批量获取
const getBatchWeather = async (resortIds) => {
  const response = await fetch('http://localhost:5001/api/weather/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resortIds }),
  });
  const data = await response.json();
  return data;
};
```

---

## 更新日志

### v1.0.0 (2026-01-13)
- 初始版本发布
- 实现所有基础API端点
- 集成Open-Meteo天气API
- 支持IP地理定位

---

## 技术支持

如有问题或建议，请在GitHub仓库提交Issue。
