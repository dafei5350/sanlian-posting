<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  NCollapse,
  NCollapseItem,
  NAlert,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NRadioGroup,
  NRadioButton,
  NSelect,
  NSpace,
  NUpload,
  NModal,
} from "naive-ui";

const route = useRoute();
const router = useRouter();
function onBack(params) {
  router.go(-1)
}
function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const list = []
const apiObj = reactive({ ...route.params})
const imgList = localStorage.getItem('imgList') ? JSON.parse(localStorage.getItem('imgList')) : []
function getRandomElements(arr, count) {
  const result = [];
  const tempArray = [...arr]; // 创建一个 arr 的副本，以避免修改原始数组
  for (let i = 0; i < count; i++) {
    if (tempArray.length === 0) {
      break;
    }
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    const element = tempArray.splice(randomIndex, 1)[0];
    result.push(element);
  }
  return result;
}
for (let index = 0; index < route.params.apiNumber; index++) {
  const imgNum = Number(apiObj.imgNum[1]) > 0 ? getRandomInRange(Number(apiObj.imgNum[0]), Number(apiObj.imgNum[1])) : 0;
  const element = {
    content: index > 0 ? route.params.textareaValue + index : route.params.textareaValue,
    imgNum: imgNum,
    image: imgNum > 0 ? getRandomElements(imgList, imgNum) : [],
    type: route.params.selectValue,
    typeTitle: route.params.selectTitle,
    phoneModel: "HTML5版",
    location: "",
    copyPersonnel: "",
  };
  list.push(element);
}

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

const apiList = reactive(list)
const showModalRef = ref(false)
const previewImageUrl = ref('')
const previewFileTitle = ref('');
const previewSize = ref('');
async function downloadImage(url) {
    try {
      const imageData = await window.electron.ipcRenderer.invoke('download-image', url);
      const blob = new Blob([imageData]);
      return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Failed to download image:', error);
      }
  }
const imgLook = async (options) => {
  console.log(options);
  const url = options.url;
  previewImageUrl.value = await downloadImage(url);
  showModalRef.value = true;
  previewFileTitle.value = options.file.name;
  previewSize.value = options.file.size + 'MB';
};
async function createThumbnailUrl(file) {
  console.log('缩略图', file);
  if (!file) return void 0;
  return await downloadImage(file.url);
}
const isStart = ref(false)
const requestCount = ref(0)
const onStartApi = () => {
  isStart.value = true
  const apiNumber = apiObj.apiNumber;
  const apiTime = apiObj.apiTime;

  let intervalId = null;
  console.log(apiNumber, apiTime, requestCount.value);
  intervalId = setInterval(async () => {
    if (requestCount.value < apiNumber) {
      let token = apiObj.token;
      let obj = {
        content: apiList[requestCount.value].content,
        image: apiList[requestCount.value].image.filter(item => item.id).map(item => item.id).join(','),
        type: apiList[requestCount.value].type,
        phoneModel: 'HTML5版',
        location: '',
        copyPersonnel: '',
      };
      let requestMain = await window.electron.ipcRenderer.invoke('posting-main', obj, token);
      if (requestMain.rtn === 0) {
        console.log(requestCount.value, requestMain);
      }
      requestCount.value += 1;
    } else {
      clearInterval(intervalId);
      isStart.value = false;
    }
  }, apiTime * 1000);
}
const onCancel = () => {
  isStart.value = false
  clearInterval(intervalId)
}
const onSelectUpdate = (val, event,  idx) => {
  apiList[idx].typeTitle = event.label
  apiList[idx].type = val
}
</script>

<template>
  <div class="backgorund" v-if="isStart">
    <div class="wheel-and-hamster">
      <div class="wheel"></div>
      <div class="hamster">
        <div class="hamster__body">
          <div class="hamster__head">
            <div class="hamster__ear"></div>
            <div class="hamster__eye"></div>
            <div class="hamster__nose"></div>
          </div>
          <div class="hamster__limb hamster__limb--fr"></div>
          <div class="hamster__limb hamster__limb--fl"></div>
          <div class="hamster__limb hamster__limb--br"></div>
          <div class="hamster__limb hamster__limb--bl"></div>
          <div class="hamster__tail"></div>
        </div>
      </div>
      <div class="spoke"></div>
    </div>
    <div class="schedule">
      <button class="quxiao" @click="onCancel"> 
        <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="33" viewBox="0 0 120 120" height="33" fill="none"><path fill="#08c" d="m60 0c-33.1373 0-60 26.8627-60 60s26.8627 60 60 60 60-26.8627 60-60-26.8627-60-60-60z"></path><path fill="#fff" d="m89.195 34.5144-10.7166 54.0314s-1.4985 3.7472-5.6203 1.9486l-24.7303-18.96-8.9925-4.3462-15.1378-5.0963s-2.3231-.824-2.5481-2.6226c-.2246-1.7986 2.6231-2.7727 2.6231-2.7727l60.1763-23.6062s4.9462-2.1731 4.9462 1.424z"></path><path fill="#d2e5f1" d="m46.2272 87.9392s-.7219-.0675-1.6215-2.9157c-.899-2.8476-5.4704-17.8353-5.4704-17.8353l36.3456-23.0814s2.0986-1.274 2.0236 0c0 0 .3745.2246-.7495 1.2736-1.1241 1.0495-28.5521 25.7044-28.5521 25.7044"></path><path fill="#b5cfe4" d="m57.6099 78.8041-9.7818 8.9184s-.7642.5804-1.6009.2167l1.8727-16.5662"></path></svg></span>
        <span class="text1">已发送 {{ requestCount }} 条</span>
        <span class="text2">取消</span> 
      </button>

    </div>
  </div>
  <n-alert title="提示" type="info">
    当前设定发送请求次数为 {{ apiObj.apiNumber }} 次，每个请求携带的图片数量为 {{ apiObj.imgNum[1] > 0 ? apiObj.imgNum[0] + '~' + apiObj.imgNum[1] : apiObj.imgNum[0] }}随机上传，每次请求时间间隔 {{ apiObj.apiTime }} 秒。如需修改请 <span @click="onBack" class="go-home">返回上一页</span> 重新设置。
  </n-alert>
  <div class="main">
    <n-collapse>
      <n-collapse-item
        v-for="(item, idx) in apiList" 
        :key="idx" 
        :title="`${item.content}`" 
        :name="index"
        >
        <n-space vertical>
          <n-input-group>
            <n-input-group-label>评论内容</n-input-group-label>
            <n-input v-model:value="item.content"/>
          </n-input-group>
          <n-input-group>
            <n-input-group-label>评论类型</n-input-group-label>
            <n-select
              v-model:value="item.type"
              placeholder="请选择类型"
              :options="selectOption"
              :default-value="item.typeTitle"
              @update:value="(value, event) => onSelectUpdate(value, event, idx)"
            />
          </n-input-group>
          <n-upload
            :default-file-list="item.image"
            :create-thumbnail-url="createThumbnailUrl"
            list-type="image-card"
            @preview="imgLook"
          />
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
        </n-space>
        <template #header-extra>
          {{item.typeTitle}}
        </template>
      </n-collapse-item>
    </n-collapse>
  </div>


  <div class="start-div">
    <button class="start" @click="onStartApi">
      <div class="svg-wrapper-1">
        <div class="svg-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
          </svg>
        </div>
      </div>
      <span>开始上传</span>
    </button>
  </div>
</template>
<style scoped>
.main {
  width: 100%;
  margin: 30px 0 250px;

}
.go-home {
  color: red;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline; 
}
.backgorund {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  opacity: .9;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #121212; /* Fallback for browsers that don't support gradients */
  background: linear-gradient(
    135deg,
    #121212 25%,
    #1a1a1a 25%,
    #1a1a1a 50%,
    #121212 50%,
    #121212 75%,
    #1a1a1a 75%,
    #1a1a1a
  );
  background-size: 40px 40px;

  /* Animation */
  animation: move 4s linear infinite;
}

@keyframes move {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 40px;
  }
}
.schedule {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translate(-50%, 0);
}
.quxiao {
  position: relative;
  width: 130px;
  height: 35px;
  border-radius: 30px;
  background-color: white;
  border: 1px #08c solid;  
  overflow: hidden;
  cursor: pointer;
}

.text1 {
  font-size: 15px;
  font-weight: 600;
  margin-left: 22%;
}

.text2 {
  position: absolute;
  top: 20%;
  left: -50px;
  font-weight: 700;
  font-size: 14px;
  color: white;
}

.icon {
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 0.5s;
}

.icon::before {
  position: absolute;
  left: -100px;
  top: 0;
  z-index: -1;
  content: '';
  width: 130px;
  height: 33px;
  border-radius: 30px;
  background-color: #08c;
}

.quxiao:hover .icon {
  transform: translateX(96px);
  transition: transform 0.5s;
}

.quxiao:hover .text2 {
  transform: translateX(100px);
  transition: transform 0.6s;
}

.quxiao:active {
  transform: scale(1.03);
  background-color: #08c;
}

@keyframes fly-1 {
  from {
    transform: translateY(0.1em);
  }

  to {
    transform: translateY(-0.1em);
  }
}


.start-div {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translate(-50%, 0);
}
.start {
  font-family: inherit;
  font-size: 18px;
  background: linear-gradient(to bottom, #4dc7d9 0%,#66a6ff 100%);
  color: white;
  padding: 0.8em 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 25px;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  cursor: pointer;
}

.start:hover {
  transform: translateY(-3px);
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.3);
}

.start:active {
  transform: scale(0.95);
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.start span {
  display: block;
  margin-left: 0.4em;
  transition: all 0.3s;
}

.start svg {
  width: 18px;
  height: 18px;
  fill: white;
  transition: all 0.3s;
}

.start .svg-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  margin-right: 0.5em;
  transition: all 0.3s;
}

.start:hover .svg-wrapper {
  background-color: rgba(255, 255, 255, 0.5);
}

.start:hover svg {
  transform: rotate(45deg);
}
/* 动画 */
.wheel-and-hamster {
  --dur: 1s;
  position: relative;
  width: 12em;
  height: 12em;
  font-size: 14px;
}

.wheel,
.hamster,
.hamster div,
.spoke {
  position: absolute;
}

.wheel,
.spoke {
  border-radius: 50%;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.wheel {
  background: radial-gradient(100% 100% at center,hsla(0,0%,60%,0) 47.8%,hsl(0,0%,60%) 48%);
  z-index: 2;
}

.hamster {
  animation: hamster var(--dur) ease-in-out infinite;
  top: 50%;
  left: calc(50% - 3.5em);
  width: 7em;
  height: 3.75em;
  transform: rotate(4deg) translate(-0.8em,1.85em);
  transform-origin: 50% 0;
  z-index: 1;
}

.hamster__head {
  animation: hamsterHead var(--dur) ease-in-out infinite;
  background: hsl(30,90%,55%);
  border-radius: 70% 30% 0 100% / 40% 25% 25% 60%;
  box-shadow: 0 -0.25em 0 hsl(30,90%,80%) inset,
		0.75em -1.55em 0 hsl(30,90%,90%) inset;
  top: 0;
  left: -2em;
  width: 2.75em;
  height: 2.5em;
  transform-origin: 100% 50%;
}

.hamster__ear {
  animation: hamsterEar var(--dur) ease-in-out infinite;
  background: hsl(0,90%,85%);
  border-radius: 50%;
  box-shadow: -0.25em 0 hsl(30,90%,55%) inset;
  top: -0.25em;
  right: -0.25em;
  width: 0.75em;
  height: 0.75em;
  transform-origin: 50% 75%;
}

.hamster__eye {
  animation: hamsterEye var(--dur) linear infinite;
  background-color: hsl(0,0%,0%);
  border-radius: 50%;
  top: 0.375em;
  left: 1.25em;
  width: 0.5em;
  height: 0.5em;
}

.hamster__nose {
  background: hsl(0,90%,75%);
  border-radius: 35% 65% 85% 15% / 70% 50% 50% 30%;
  top: 0.75em;
  left: 0;
  width: 0.2em;
  height: 0.25em;
}

.hamster__body {
  animation: hamsterBody var(--dur) ease-in-out infinite;
  background: hsl(30,90%,90%);
  border-radius: 50% 30% 50% 30% / 15% 60% 40% 40%;
  box-shadow: 0.1em 0.75em 0 hsl(30,90%,55%) inset,
		0.15em -0.5em 0 hsl(30,90%,80%) inset;
  top: 0.25em;
  left: 2em;
  width: 4.5em;
  height: 3em;
  transform-origin: 17% 50%;
  transform-style: preserve-3d;
}

.hamster__limb--fr,
.hamster__limb--fl {
  clip-path: polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);
  top: 2em;
  left: 0.5em;
  width: 1em;
  height: 1.5em;
  transform-origin: 50% 0;
}

.hamster__limb--fr {
  animation: hamsterFRLimb var(--dur) linear infinite;
  background: linear-gradient(hsl(30,90%,80%) 80%,hsl(0,90%,75%) 80%);
  transform: rotate(15deg) translateZ(-1px);
}

.hamster__limb--fl {
  animation: hamsterFLLimb var(--dur) linear infinite;
  background: linear-gradient(hsl(30,90%,90%) 80%,hsl(0,90%,85%) 80%);
  transform: rotate(15deg);
}

.hamster__limb--br,
.hamster__limb--bl {
  border-radius: 0.75em 0.75em 0 0;
  clip-path: polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);
  top: 1em;
  left: 2.8em;
  width: 1.5em;
  height: 2.5em;
  transform-origin: 50% 30%;
}

.hamster__limb--br {
  animation: hamsterBRLimb var(--dur) linear infinite;
  background: linear-gradient(hsl(30,90%,80%) 90%,hsl(0,90%,75%) 90%);
  transform: rotate(-25deg) translateZ(-1px);
}

.hamster__limb--bl {
  animation: hamsterBLLimb var(--dur) linear infinite;
  background: linear-gradient(hsl(30,90%,90%) 90%,hsl(0,90%,85%) 90%);
  transform: rotate(-25deg);
}

.hamster__tail {
  animation: hamsterTail var(--dur) linear infinite;
  background: hsl(0,90%,85%);
  border-radius: 0.25em 50% 50% 0.25em;
  box-shadow: 0 -0.2em 0 hsl(0,90%,75%) inset;
  top: 1.5em;
  right: -0.5em;
  width: 1em;
  height: 0.5em;
  transform: rotate(30deg) translateZ(-1px);
  transform-origin: 0.25em 0.25em;
}

.spoke {
  animation: spoke var(--dur) linear infinite;
  background: radial-gradient(100% 100% at center,hsl(0,0%,60%) 4.8%,hsla(0,0%,60%,0) 5%),
		linear-gradient(hsla(0,0%,55%,0) 46.9%,hsl(0,0%,65%) 47% 52.9%,hsla(0,0%,65%,0) 53%) 50% 50% / 99% 99% no-repeat;
}

/* Animations */
@keyframes hamster {
  from, to {
    transform: rotate(4deg) translate(-0.8em,1.85em);
  }

  50% {
    transform: rotate(0) translate(-0.8em,1.85em);
  }
}

@keyframes hamsterHead {
  from, 25%, 50%, 75%, to {
    transform: rotate(0);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(8deg);
  }
}

@keyframes hamsterEye {
  from, 90%, to {
    transform: scaleY(1);
  }

  95% {
    transform: scaleY(0);
  }
}

@keyframes hamsterEar {
  from, 25%, 50%, 75%, to {
    transform: rotate(0);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(12deg);
  }
}

@keyframes hamsterBody {
  from, 25%, 50%, 75%, to {
    transform: rotate(0);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(-2deg);
  }
}

@keyframes hamsterFRLimb {
  from, 25%, 50%, 75%, to {
    transform: rotate(50deg) translateZ(-1px);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(-30deg) translateZ(-1px);
  }
}

@keyframes hamsterFLLimb {
  from, 25%, 50%, 75%, to {
    transform: rotate(-30deg);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(50deg);
  }
}

@keyframes hamsterBRLimb {
  from, 25%, 50%, 75%, to {
    transform: rotate(-60deg) translateZ(-1px);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(20deg) translateZ(-1px);
  }
}

@keyframes hamsterBLLimb {
  from, 25%, 50%, 75%, to {
    transform: rotate(20deg);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(-60deg);
  }
}

@keyframes hamsterTail {
  from, 25%, 50%, 75%, to {
    transform: rotate(30deg) translateZ(-1px);
  }

  12.5%, 37.5%, 62.5%, 87.5% {
    transform: rotate(10deg) translateZ(-1px);
  }
}

@keyframes spoke {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(-1turn);
  }
}
</style>