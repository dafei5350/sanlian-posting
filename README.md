
# SanLian-Posting

郑州三联平台批量上传器，简化工作流程批量发布工作帖子。

需先登入三联平台，软件会自动监听相关请求并获取Token，你也可以使用相关抓包工具获取Token。




## 截图

![App Screenshot](/resources/demo1.jpeg)
![App Screenshot](/resources/demo2.jpeg)
![App Screenshot](/resources/demo3.jpeg)


## 开发

要部署这个项目，请运行

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## API 参考

#### 图片上传

```http
  GET http://data.lfxjpt.cn:8082/wsplatform/service/analysis/v1/attachment/upload
```

| 参数 | 类型     | 描述                |
| :-------- | :------- | :------------------------- |
| `file` | `file` |**必选**  图片 |
| `sjlx` | `string` |**必选**  固定值9999 |

#### 返回示例
```
{
    "messge": "附件上传成功",
    "data": {
        "path": "http://117.160.27.16:8081//group1/default/20240523/13/39/5/e219fd1c490a4a9ea267f5213d0e19a2.jpg",
        "id": "-9143120496422682624"
    },
    "id": "-9143120496422682624",
    "rtn": 0
}
```

#### 获取用户信息

```http
  GET http://data.lfxjpt.cn:8082/wsplatform/service/manager/user/info
```

| 参数 | 类型     | 描述                       |
| :-------- | :------- | :-------------------------------- |
| `accessToken`      | `string` | **必选** token |

#### 获取用户信息

```http
  POST http://data.lfxjpt.cn:8082/wsplatform/service/analysis/v1/wl/add
```

| 参数 | 类型     | 描述                       |
| :-------- | :------- | :-------------------------------- |
| `accessToken`      | `string` | **必选** 拦截到的token |
| `type`      | `string` | **必选** 001 |
| `content`      | `string` | **必选** 文字内容 |
| `image`      | `string` | **必选** 图片上传后的ID，以逗号分割 |
| `phoneModel`      | `string` | **必选** HTML5版 |
| `location`      | `string` | **必选** 为空 |
| `copyPersonnel`      | `string` | **必选** 为空 |

#### 返回示例
```
{
    "data": {
        "_id": null,
        "id": "-914318xxxxxx97952",
        "sourceId": null,
        "title": null,
        "content": "多图片请求",
        "keyword": [],
        "businessType": "A",
        "type": "001",
        "type_like": null,
        "type_mc": "隐患排查",
        "image": [
            "-914318xxxxxx97952",
        ],
        "video": [],
        "file": [],
        "replyNum": 0,
        "collectionNum": 0,
        "thumbNum": 0,
        "relevanceType": null,
        "relevanceId": null,
        "publisher": "741868xxxxxx0552064",
        "publisher_mc": "xxx",
        "publisherDept": "07xxxxxx6006",
        "publisherDept_mc": "郑东新区xxxxxxxxxx社区",
        "region": "410174561",
        "executor": null,
        "approveFlow": null,
        "copyPersonnel": [],
        "startTime": null,
        "endTime": null,
        "reminderTime": null,
        "finishTime": null,
        "finishStatus": null,
        "viewPermission": "3",
        "isShare": "1",
        "isRecommend": "1",
        "isTop": "1",
        "lng": null,
        "lat": null,
        "location": "",
        "phoneModel": "HTML5版",
        "createTime": 171xxxxx989
    },
    "message": "ok!",
    "rtn": "0"
}
```
