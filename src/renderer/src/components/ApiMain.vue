<script setup>
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5'
import { 
  NInput, 
  NIcon, 
  NForm, 
  NFormItem, 
  NRadioGroup, 
  NRadioButton,
  NSelect,
  NDivider,
  NGrid,
  NFormItemGi,
  NInputNumber,
  NInputGroupLabel,
  NInputGroup,
  NUpload,
  NUploadDragger,
  NText,
  useMessage,
  NAvatar,
  NAlert,
  NP,
  NModal,
  NSlider,
  NSpace,
  NTransfer,
  } from 'naive-ui'
  import { ref, reactive, watch, h} from 'vue'
  import { useRouter } from 'vue-router'
  import { v4 as uuidv4 } from 'uuid'; 
  const model = ref({
        token: localStorage.getItem('token') || null,
        apiNumber: 1,
        apiTime: 2,
        selectValue: '001',
        selectTitle: '隐患排查',
        textareaValue: null,
        radioValue: false,
      })
  const userInfo = reactive({})
  const router = useRouter();
  const selectOption = [
          {
            label: "隐患排查",
            value: "001" 
          },
          {
            label: "法制宣传",
            value: "002"
          },
          {
            label: "巡逻防控",
            value: "003"
          },
          {
            label: "志愿服务",
            value: "004"
          }
        ]
  const rules = reactive({
    token: {
        required: true,
        trigger: ["focus", "input"],
        message: "请输入AccessToken"
      },
      textareaValue: {
        required: true,
        trigger: ["focus", "input"],
        message: "请输入申报内容"
      },
  })
  const message = window.$message;
  const onSelectUpdate = (val, event) => {
    model.value.selectTitle = event.label
  }
  const onRadioVal = (value) => {
    model.value.textareaValue = value
  }

  const getUserInfo = async (e) => {
    if (!model.value.token) message.error("请输入AccessToken");
    try {
      const data = await window.electron.ipcRenderer.invoke('get-user-info', model.value.token);
      console.log(data);
      if (data.message === 'OK') {
        message.success('获取用户信息成功');
        data.data.imageAvater = 'http://data.lfxjpt.cn:8082/wsplatform/service/analysis/v1/attachment/user/icon/' + data.data.uid;
        Object.assign(userInfo, data.data)
        localStorage.setItem('token', model.value.token);
        localStorage.setItem('userInfo', JSON.stringify(data.data));
      } else {
        message.error('AccessToken无效，获取失败');
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function downloadImage(url) {
    try {
      const imageData = await window.electron.ipcRenderer.invoke('download-image', url);
      const blob = new Blob([imageData]);
      return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Failed to download image:', error);
      }
  }

  const previewFileList = reactive([]);
  const customRequest = async ({file, onFinish, onProgress}) => {
    // console.log(file);
    // console.log(onProgress);
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('sjlx', '9999');
    const serializableData = {};
    formData.forEach((value, key) => {
      if (value instanceof file.constructor) {
        serializableData[key] = {
          path: value.path,
          name: value.name,
          type: value.type,
          size: value.size,
        };
      } else {
        serializableData[key] = value;
      }
    });
    try {
      // window.electron.ipcRenderer.on('upload-progress', (event, progress) => {
      //   console.log(`上传进度: ${progress}%, ${file.file.name} , ${event}`);
      // });
      // window.electron.ipcRenderer.on('upload-success', (event, data) => {
      //   console.log('上传成功', data);
      // });
      // window.electron.ipcRenderer.on('upload-error', (event, error) => {
      //   console.error('上传失败', error);
      // });
      const response = await window.electron.ipcRenderer.invoke('upload-file', serializableData);

      if (response.rtn === 0) {
        message.success('上传成功');
        let tempData = {
          id: response.data.id,
          url: response.data.path,
          localID: file.id,
          size: (file.file.size / 1024 / 1024).toFixed(2),
          name: file.file.name,
          path: file.file.path,
          type: file.file.type,
        }
        previewFileList.push(tempData);
        window.api.db.put({
          _id: uuidv4(),
          id: response.data.id,
          url: response.data.path,
          localID: file.id,
          size: (file.file.size / 1024 / 1024).toFixed(2),
          name: file.file.name,
          path: file.file.path,
          type: file.file.type,
          date: new Date().toISOString()
        }).then((response) => {
          console.log(response);
        }).catch((error) => {
          console.error(error);
        });
        onFinish()
      } else {
        message.error('上传失败');
      }

    } catch (error) {
      console.error(error);
    }
  };
  const beforeUpload = (file) => {
    const files = file.file.file;
    const isJpgOrPng = files.type === 'image/jpeg'|| files.type === 'image/jpg' || files.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 文件!');
    }
    const isLt20M = files.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error('图片大小不能超过 20MB!');
    }
    return isJpgOrPng && isLt20M;
  };
  const delImg = (options) => {
    previewFileList.splice(options.index, 1);
  };
  const showModalRef = ref(false)
  const previewImageUrl = ref('')
  const previewFileTitle = ref('');
  const previewSize = ref('');
  const imgLook = (options) => {
    // 通过shell打开图片
    // const imagePath = options.file.path;
    // window.api.shell.openPath(imagePath).catch(error => {
    //   console.error('Failed to open image:', error);
    // });

    // 获取网络图片
    const id = options.id;
    const url = previewFileList.find(item => item.localID === id).url;
    previewImageUrl.value = url;
    showModalRef.value = true;
    previewFileTitle.value = options.file.name;
    previewSize.value = (options.file.size / 1024 / 1024).toFixed(2) + 'MB';
  };
  async function createThumbnailUrl (file, fileInfo) {
    if (!file) return void 0;
    const id = fileInfo.id;
    const url =  await previewFileList.find(item => item.localID === id).url;
    return new Promise((resolve) => resolve(url));
  }

  const imgNum = ref([0, 0]);
  const hasImgNum = ref(false);
  const imgNumMax = ref(previewFileList.length ?? 0);
  const imgMarks = ref({
    0: '0'
  });
  watch(previewFileList, (val) => {
    imgNumMax.value = val.length;
  });
  watch(imgNumMax, (val) => {
    imgMarks.value = {
      0: '0',
      [val]: val
    };
  });
  const onGenerate = () => {
    if (!model.value.token) {
      message.error('请输入AccessToken');
      return;
    }
    if (!model.value.textareaValue) {
      message.error('请输入申报内容');
      return;
    }
    if (!model.value.apiNumber) {
      message.error('请输入发送次数');
      return;
    }
    if (model.value.apiTime === null) {
      message.error('请输入请求间隔');
      return;
    }
    const imgNumStep = imgNum.value[0] > imgNum.value[1] ? [imgNum.value[1], imgNum.value[0]] : [imgNum.value[0], imgNum.value[1]];
    const apiObj = {
      token: model.value.token,
      selectValue: model.value.selectValue,
      selectTitle: model.value.selectTitle,
      textareaValue: model.value.textareaValue,
      apiNumber: model.value.apiNumber,
      apiTime: model.value.apiTime,
      imgNum: imgNumStep,
    }  
    localStorage.setItem('imgList', JSON.stringify(previewFileList));
    router.push({ name: 'ApiList', params: { ...apiObj } });
  }
  const ws = new WebSocket('ws://localhost:8080');
  ws.onopen = function() {
    console.log('WebSocket connection opened');
  };
  ws.onclose = function() {
  console.log('WebSocket connection closed');
};
  ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data?.headers?.accessToken) {
      console.log("Token =>", data.headers.accessToken);
      if (model.value.token !== data.headers.accessToken){
        model.value.token = data.headers.accessToken;
        message.success('获取用户Token成功');
        getUserInfo();
      }
    }
  };
  function getAllDB() {
    window.api.db.allDocs({ 
      include_docs: true,
      limit: 20,
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
  }
  function delDB(params) {
    window.api.db.destroy().then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
  }
  function goNetMonitor() {
    window.api.shell.openExternal('http://localhost:8002');
  }
  const hasImgShow = ref(false);
  async function goHistoryImg() {
    hasImgShow.value = true;
    historyOptions = await getDocs();
    console.log(historyOptions);
  }
  async function getDocs(limit = 10, skip = 0) {
  const data = await window.api.db.allDocs({
    include_docs: true,
    limit: limit,
    skip: skip
  })

  if (data.rows.length > 0) {
    return data.rows.map((item, idx) => {
      return {
        label: item.doc.name,
        value: item.doc.url,
        url: item.doc.url,
      }
    });
  } else {
    return [];
  }
}

let historyOptions = ref([]);
getDocs().then(result => {
  historyOptions.value = result;
});
const historyVal =  ref([]);
const renderLabel = function({ option }) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        margin: "6px 0"
      }
    },
    {
      default: () => [
        h(NAvatar, {
          src: option.value,
          size: "small",
        }),
        h(
          "div",
          {
            style: {
              display: "flex",
              marginLeft: "6px",
              alignSelf: "center"
            }
          },
          { default: () => option.label }
        )
      ]
    }
  )
}
const goHistory = () => {
  router.push({ name: 'UseHistory' });
}
const transfer = ref(null);
const transferData = ref([]);
const onPositiveClick = () => {
  console.log(historyVal.value);
}
const onHistoryUpdate = (idx) => {
  console.log(idx);
  historyVal.value = idx;
  // historyVal.value = historyVal.value.concat([{
  //   label: historyOptions[idx].name,
  //   value: historyOptions[idx].url,
  // }]);
}
</script>

<template>
  <div class="main">
    <n-form
      label-placement="left"
      :label-width="80"
      :rules="rules"
      :model="model"
      >
      <n-form-item label="AccessToken" path="token">
        <n-input-group>
          <n-input placeholder="请输入AccessToken"  v-model:value="model.token" />
          <n-input-group-label @click="getUserInfo" class="cursor">获取用户信息</n-input-group-label>
        </n-input-group>
      </n-form-item>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="10" label="发送次数" path="inputValue">
          <n-input-number v-model:value="model.apiNumber" :min="1" placeholder="请输入次数" />
        </n-form-item-gi>
        <n-form-item-gi :span="14" label="请求间隔" path="inputValue">
          <n-input-group>
            <n-input-number v-model:value="model.apiTime" :style="{ width: '100%' }" :min="0" placeholder="请输入请求间隔时间"/>
            <n-input-group-label>秒</n-input-group-label>
          </n-input-group>
        </n-form-item-gi>
      </n-grid>
      <div style="width: 100%; height: 18px;"></div>
      <n-space vertical></n-space>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi label="类型" :span="10">
        <n-select
          v-model:value="model.selectValue"
          placeholder="请选择类型"
          :options="selectOption"
          :default-value="model.selectTitle"
          @update:value="onSelectUpdate"
        /> 
        </n-form-item-gi>

        <n-form-item-gi :span="14" label="图片数量" path="inputValue">
          <n-slider 
            v-model:value="imgNum" 
            :show-tooltip="previewFileList.length > 0"
            range 
            :marks="imgMarks" 
            :min="0" 
            :max="imgNumMax"
            :disabled="hasImgNum"/>
        </n-form-item-gi>
      </n-grid>
      
      <n-form-item label="快速输入" >
        <n-radio-group
          @update:value="onRadioVal"
          v-model:value="model.radioValue"
          size="large"
          name="radiogroup2">
          <n-radio-button value="一切正常">
            一切正常
          </n-radio-button>
          <n-radio-button value="发现问题">
            发现问题
          </n-radio-button>
          <n-radio-button value="处理完毕">
            处理完毕
          </n-radio-button>
          <n-radio-button value="任务完成">
            任务完成
          </n-radio-button>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="文本内容" path="textareaValue">
        <n-input
          v-model:value="model.textareaValue"
          placeholder="请输入内容"
          type="textarea"
          :autosize="{
            minRows: 3,
            maxRows: 5
          }"
        />
      </n-form-item>
      <n-form-item>
        <n-upload
          multiple 
          directory-dnd
          :custom-request="customRequest"
          list-type="image"
          :default-file-list="previewFileList"
          
          :on-before-upload="beforeUpload"
          :on-remove="delImg"
          :on-preview="imgLook"
     
        >
          <n-upload-dragger>
            <div style="margin-bottom: 12px">
              <n-icon size="48" :depth="3">
                <archive-icon />
              </n-icon>
            </div>
            <n-text style="font-size: 16px">
              点击或者拖动文件到该区域来上传
            </n-text>
            <p />
            <n-p depth="3" style="margin: 18px 0 0 0">
              图片最大不能超过20M，图片独立上传，不会随表单提交
            </n-p>
          </n-upload-dragger>
        </n-upload>
      </n-form-item>
    </n-form>
    <div class="userinfo">
      <div class="card">
        <div class="profileImage">
          <n-avatar
            round
            :size="100"
            :src="userInfo.imageAvater"
            v-if="userInfo.imageAvater"
          />
          <svg v-else viewBox="0 0 128 128"><circle r="60" fill="transparent" cy="64" cx="64"></circle><circle r="48" fill="transparent" cy="64" cx="64"></circle><path fill="#191919" d="m64 14a32 32 0 0 1 32 32v41a6 6 0 0 1 -6 6h-52a6 6 0 0 1 -6-6v-41a32 32 0 0 1 32-32z"></path><path opacity="1" fill="#191919" d="m62.73 22h2.54a23.73 23.73 0 0 1 23.73 23.73v42.82a4.45 4.45 0 0 1 -4.45 4.45h-41.1a4.45 4.45 0 0 1 -4.45-4.45v-42.82a23.73 23.73 0 0 1 23.73-23.73z"></path><circle r="7" fill="#fbc0aa" cy="65" cx="89"></circle><path fill="#4bc190" d="m64 124a59.67 59.67 0 0 0 34.69-11.06l-3.32-9.3a10 10 0 0 0 -9.37-6.64h-43.95a10 10 0 0 0 -9.42 6.64l-3.32 9.3a59.67 59.67 0 0 0 34.69 11.06z"></path><path opacity=".3" fill="#356cb6" d="m45 110 5.55 2.92-2.55 8.92a60.14 60.14 0 0 0 9 1.74v-27.08l-12.38 10.25a2 2 0 0 0 .38 3.25z"></path><path opacity=".3" fill="#356cb6" d="m71 96.5v27.09a60.14 60.14 0 0 0 9-1.74l-2.54-8.93 5.54-2.92a2 2 0 0 0 .41-3.25z"></path><path fill="#fff" d="m57 123.68a58.54 58.54 0 0 0 14 0v-25.68h-14z"></path><path stroke-width="14" stroke-linejoin="round" stroke-linecap="round" stroke="#fbc0aa" fill="none" d="m64 88.75v9.75"></path><circle r="7" fill="#fbc0aa" cy="65" cx="39"></circle><path fill="#ffd8ca" d="m64 91a25 25 0 0 1 -25-25v-16.48a25 25 0 1 1 50 0v16.48a25 25 0 0 1 -25 25z"></path><path fill="#191919" d="m91.49 51.12v-4.72c0-14.95-11.71-27.61-26.66-28a27.51 27.51 0 0 0 -28.32 27.42v5.33a2 2 0 0 0 2 2h6.81a8 8 0 0 0 6.5-3.33l4.94-6.88a18.45 18.45 0 0 1 1.37 1.63 22.84 22.84 0 0 0 17.87 8.58h13.45a2 2 0 0 0 2.04-2.03z"></path><path style="fill:none;stroke-linecap:round;stroke:#fff;stroke-miterlimit:10;stroke-width:2;opacity:.1" d="m62.76 36.94c4.24 8.74 10.71 10.21 16.09 10.21h5"></path><path style="fill:none;stroke-linecap:round;stroke:#fff;stroke-miterlimit:10;stroke-width:2;opacity:.1" d="m71 35c2.52 5.22 6.39 6.09 9.6 6.09h3"></path><circle r="3" fill="#515570" cy="62.28" cx="76"></circle><circle r="3" fill="#515570" cy="62.28" cx="52"></circle><ellipse ry="2.98" rx="4.58" opacity=".1" fill="#f85565" cy="69.67" cx="50.42"></ellipse><ellipse ry="2.98" rx="4.58" opacity=".1" fill="#f85565" cy="69.67" cx="77.58"></ellipse><g stroke-linejoin="round" stroke-linecap="round" fill="none"><path stroke-width="4" stroke="#fbc0aa" d="m64 67v4"></path><path stroke-width="2" stroke="#515570" opacity=".2" d="m55 56h-9.25"></path><path stroke-width="2" stroke="#515570" opacity=".2" d="m82 56h-9.25"></path></g><path opacity=".4" fill="#f85565" d="m64 84c5 0 7-3 7-3h-14s2 3 7 3z"></path><path fill="#f85565" d="m65.07 78.93-.55.55a.73.73 0 0 1 -1 0l-.55-.55c-1.14-1.14-2.93-.93-4.27.47l-1.7 1.6h14l-1.66-1.6c-1.34-1.4-3.13-1.61-4.27-.47z"></path></svg>
        </div>
        <div class="textContainer">
          <p class="name">{{ userInfo.realname }}</p>
          <p class="profile">{{ userInfo.name }}</p>
        </div>
      </div>
    </div>
    <div class="confirm">
      <button class="button" @click="delDB">删除数据</button>
      <button class="button" @click="getAllDB">查看数据</button>
      <button class="button" @click="goHistoryImg">历史图片</button>
      <button class="button" @click="goHistory">历史数据</button>
      <button class="button" @click="goNetMonitor">请求监听</button>
      <button class="button" @click="onGenerate">模拟生成</button>
    </div>
  </div>
  <n-modal
    v-model:show="showModalRef"
    preset="card"
    style="width: 600px"
    :title="previewFileTitle"
  >
      <template #header-extra>
        {{ previewSize }} 
      </template>
      <img :src="previewImageUrl" style="width: 100%" />
  </n-modal>
  <n-modal
    v-model:show="hasImgShow"
    :mask-closable="false"
    preset="dialog"
    title="历史图片"
    positive-text="确认"
    negative-text="取消"
    @positive-click="onPositiveClick"
    @negative-click="onNegativeClick"
    style="width: 700px !important; max-width: 700px !important"
  >
    <n-transfer 
      ref="transfer"
      source-filterable
      v-model:value="historyVal" 
      :options="historyOptions" 
      :on-update:value="onHistoryUpdate"
      :render-target-label="renderLabel"
      />
  </n-modal>
</template>
<style scoped>
.n-dialog.n-modal {
  width: 700px !important;
  max-width: 700px !important;
}
.element {
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
}

.element::-webkit-scrollbar {
  /* WebKit */
  display: none;
}
.main {
  width: 100%;
  display: flex;
}

.cursor {
  cursor: pointer;
}
.confirm {
  position: fixed;
  bottom: 50px;
  right: 20px;
  display: flex;
  flex-direction: column;
}
.button {
  margin-top: 20px;
  position: relative;
  padding: 8px 26px;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  color: #000;
  background-color: #fff;
  border: none;
  border-radius: 50px;
  overflow: hidden;
  z-index: 1;
  transition: all 0.3s ease-in-out;
  box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;
  cursor: pointer;
}

.button:hover {
  transform: scale(1.05);
  color: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.button:active {
  transform: scale(0.9);
}

.button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, #007bff, #00bfff);
  transition: all 0.4s ease-in-out;
  z-index: -1;
  border-radius: 50px;
}

.button:hover::before {
  left: 0;
}

.userinfo {
  width: 20%;
  display: flex;
  justify-content: end;
}
/* .card {
  width: 90%;
  height: 210px;
  background: rgb(39, 39, 39);
  border-radius: 12px;
  box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.123);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  transition-duration: .5s;
} */

.profileImage {
  margin-top: 20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  box-shadow: rgba(60, 64, 67, 0.3) 0 1px 2px 0, rgba(60, 64, 67, 0.15) 0 1px 3px 1px;
}

.textContainer {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 0.9em;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.profile {
  font-size: 0.84em;
  color: rgb(194, 194, 194);
  letter-spacing: 0.2px;
}
</style>