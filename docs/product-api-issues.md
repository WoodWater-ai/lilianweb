# 商品接口问题单

## 1. 商品新增/编辑接口与文档不一致：`skus` 提交会直接报服务端异常

1. 接口
   - `POST /v1/admin/product/add`
   - `POST /v1/admin/product/update`

2. 文档预期
   - `ProductAddRequest` / `ProductUpdateRequest` 支持提交 `skus`
   - `SkuRequest` 字段包括：
     - `skuCode`
     - `specValues`，JSON 字符串
     - `points`
     - `stock`
     - `sort`
     - `id`（更新时可选）

3. 实际行为
   - 不带 `skus`：成功
   - 带 `specs` 不带 `skus`：成功
   - 一旦带 `skus`：返回服务端异常

4. 复现请求

```bash
curl -sS -b /tmp/prezzie-cookie.txt \
  -X POST "http://1os5080hd573.vicp.fun/v1/admin/product/add" \
  -H "Content-Type: application/json" \
  -d '{
    "spuId":"SPU_TEST_MIN_3",
    "name":"FrontendAddWithSkus",
    "imageUrl":"https://x.com/p.jpg",
    "pointsRequired":123,
    "stock":7,
    "status":0,
    "skus":[
      {
        "skuCode":"SKU_TEST_MIN_3",
        "specValues":"[]",
        "points":123,
        "stock":7,
        "sort":0
      }
    ]
  }'
```

5. 实际返回

```json
{
  "success": false,
  "errCode": "B010000",
  "errMessage": "服务端异常",
  "data": null
}
```

## 2. 商品更新接口同样存在 `skus` 提交异常

1. 复现请求

```bash
curl -sS -b /tmp/prezzie-cookie.txt \
  -X POST "http://1os5080hd573.vicp.fun/v1/admin/product/update" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"2038142616826761218",
    "name":"TestProductA",
    "imageUrl":"https://x.com/p.jpg",
    "pointsRequired":100,
    "stock":50,
    "status":1,
    "skus":[
      {
        "id":2038142616843538433,
        "skuCode":"SKU20260329000001001",
        "specValues":"[]",
        "points":100,
        "stock":50,
        "sort":0
      }
    ]
  }'
```

2. 实际返回

```json
{
  "success": false,
  "errCode": "B010000",
  "errMessage": "服务端异常",
  "data": null
}
```

3. 对照说明
   - 同一商品更新时，仅提交基础字段可成功
   - 提交 `specs` 可成功
   - 提交 `skus` 失败

## 3. 创建/更新后，后端返回的 SKU 数据与商品主数据不一致

1. 现象
   - 新建成功后，商品主表字段正常：
     - `pointsRequired`
     - `stock`
   - 但返回的默认 `skus[0]` 却是：
     - `points: 0`
     - `stock: 0`

2. 示例返回

```json
{
  "name":"UIFixProduct",
  "pointsRequired":88,
  "stock":12,
  "specs":[
    {
      "specName":"颜色",
      "specValues":"[\"红色\",\"蓝色\"]",
      "sort":0
    }
  ],
  "skus":[
    {
      "skuCode":"SKU_UI_FIX_TEST_1001",
      "specValues":"[]",
      "points":0,
      "stock":0,
      "sort":0
    }
  ]
}
```

3. 影响
   - 前端无法判断应以商品级库存/积分为准，还是以 SKU 为准
   - 多规格和单规格的展示逻辑容易混乱

4. 需后端确认
   - 单规格商品是否应该始终生成一个与商品主表一致的默认 SKU
   - 如果生成默认 SKU，是否应同步 `points` / `stock`
   - `specs` 存在但 `skus.specValues = []` 是否符合设计

## 4. 商品服务稳定性问题

1. 现象
   - 在连续调试商品接口后，商品相关接口出现 `Empty reply from server`

2. 示例

```bash
curl -i -sS "http://1os5080hd573.vicp.fun/v1/admin/product/category/tree"
curl -i -sS -b /tmp/prezzie-cookie.txt \
  -X POST "http://1os5080hd573.vicp.fun/v1/admin/product/list" \
  -H "Content-Type: application/json" \
  -d '{"pageNum":1,"pageSize":1}'
```

3. 实际结果

```bash
curl: (52) Empty reply from server
```

4. 说明
   - 这不是业务校验失败
   - 更像服务异常、网关中断或应用崩溃

## 5. 分类接口当前同样存在服务异常

1. 现象
   - 分类管理联调时，分类相关接口直接返回 `Empty reply from server`
   - 前端无法完成分类树加载、新增、编辑、删除的真实验收

2. 复现接口
   - `GET /v1/admin/product/category/tree`
   - `GET /v1/admin/product/category/list`
   - `GET /actuator/health`

3. 复现示例

```bash
curl -i -sS "http://1os5080hd573.vicp.fun/v1/admin/product/category/tree"
curl -i -sS "http://1os5080hd573.vicp.fun/v1/admin/product/category/list"
curl -i -sS "http://1os5080hd573.vicp.fun/actuator/health"
```

4. 实际结果

```bash
curl: (52) Empty reply from server
```

5. 说明
   - 这不是业务参数错误
   - 连健康检查也无法正常返回，优先怀疑服务端实例、网关或网络层异常

## 6. 礼包与卡密接口当前也存在服务异常

1. 现象
   - 礼包列表、卡密列表接口均出现 `Empty reply from server`
   - 当前无法完成礼包管理、卡密管理的真实联调验收

2. 复现接口
   - `GET /v1/admin/gift/list?pageNum=1&pageSize=1`
   - `GET /v1/admin/card/list?pageNum=1&pageSize=2`

3. 复现示例

```bash
curl -i -sS "http://1os5080hd573.vicp.fun/v1/admin/gift/list?pageNum=1&pageSize=1"
curl -i -sS "http://1os5080hd573.vicp.fun/v1/admin/card/list?pageNum=1&pageSize=2"
```

4. 实际结果

```bash
curl: (52) Empty reply from server
```

5. 说明
   - 这不是前端字段映射问题导致的业务失败
   - 是接口层没有正常返回 HTTP 响应体

## 7. 公告接口当前也存在服务异常

1. 现象
   - 公告列表接口直接返回 `Empty reply from server`
   - 当前无法完成公告管理的真实联调验收

2. 复现接口
   - `GET /v1/admin/announcement/list?pageNum=1&pageSize=2`

3. 复现示例

```bash
curl -i -sS "http://1os5080hd573.vicp.fun/v1/admin/announcement/list?pageNum=1&pageSize=2"
```

4. 实际结果

```bash
curl: (52) Empty reply from server
```

5. 说明
   - 这不是前端参数校验导致的业务失败
   - 是公告接口本身没有正常返回 HTTP 响应体

## 8. 订单接口当前也存在服务异常

1. 现象
   - 订单列表接口直接返回 `Empty reply from server`
   - 当前无法完成订单管理的真实联调验收

2. 复现接口
   - `GET /v1/admin/order/list?pageNum=1&pageSize=2`

3. 复现示例

```bash
curl -i -sS "http://1os5080hd573.vicp.fun/v1/admin/order/list?pageNum=1&pageSize=2"
```

4. 实际结果

```bash
curl: (52) Empty reply from server
```

5. 说明
   - 这不是前端字段映射问题导致的业务失败
   - 是订单接口本身没有正常返回 HTTP 响应体

## 9. 建议后端确认的最终口径

1. `product add/update` 是否真的支持提交 `skus`
2. 如果支持：
   - 正确请求示例是什么
   - `id`、`skuCode`、`specValues` 的必填规则是什么
3. 如果当前版本暂不支持：
   - 请同步修正文档
4. 单规格商品的 `pointsRequired/stock` 与默认 `sku.points/stock` 的关系要明确
5. 商品接口偶发 `Empty reply from server` 需要排查服务稳定性
6. 分类接口当前 `tree/list` 与健康检查均异常，需要先恢复服务后再继续联调
7. 礼包、卡密接口当前也有 `Empty reply from server`，需要先确认服务整体可用性
8. 公告接口当前也有 `Empty reply from server`，需要确认是否同属于同一组服务异常
9. 订单接口当前也有 `Empty reply from server`，需要确认是否同属于同一组服务异常
