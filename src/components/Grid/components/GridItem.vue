<template>
  <div v-show="isShow" :style="style">
    <slot></slot>
  </div>
</template>
<script setup lang="ts" name="GridItem">
import { computed, inject, Ref, ref, useAttrs, watch, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { BreakPoint, Responsive } from "../interface/index";

type Props = {
  offset?: number; // 栅格左侧的间隔格数,兜底值为0
  span?: number; // 栅格占据的列数，兜底值为1
  suffix?: boolean; // 是否钉到最后一排最后一列
  xs?: Responsive; // <768px 响应式栅格属性对象
  sm?: Responsive; // 768 <= sm < 992
  md?: Responsive; // 992<= md < 1200
  lg?: Responsive; // 1200 <= lg < 1920
  xl?: Responsive; // 1920 <= xl
};

const props = withDefaults(defineProps<Props>(), {
  offset: 0,
  span: 1,
  suffix: false,
  xs: undefined,
  sm: undefined,
  md: undefined,
  lg: undefined,
  xl: undefined
});
const instance = getCurrentInstance()!;
onMounted(() => {
  addItem({ props, uid: instance.uid });
});
onUnmounted(() => {
  removeItem({ props, uid: instance.uid });
});

const attrs = useAttrs() as { index: string };
const isShow = ref(true); // 是否显示此网格项
const noop: (a: any) => void = () => {};
const addItem = inject("addItem", noop);
const removeItem = inject("removeItem", noop);
// 注入断点
const breakPoint = inject<Ref<BreakPoint>>("breakPoint", ref("xl"));
const shouldHiddenIndex = inject<Ref<number>>("shouldHiddenIndex", ref(-1)); // 注入隐藏项的下标
// 同时监听隐藏项的下标和响应式断点
watch(
  () => [shouldHiddenIndex.value, breakPoint.value],
  n => {
    // 如果当前项的 index 不等于0
    if (!!attrs.index) {
      // 如果隐藏项的下标不等于 -1， 并且当前项下标大于等于隐藏项的下标，那么不显示当前项
      isShow.value = !(n[0] !== -1 && parseInt(attrs.index) >= Number(n[0]));
    }
  },
  { immediate: true }
);

const gap = inject("gap", 0); // 注入 gap 间隙
const cols = inject("cols", ref(4)); // 注入当前断点处的一行的列数
const style = computed(() => {
  let span = props[breakPoint.value]?.span ?? props.span; // 栅格占据的列数，兜底值为1
  let offset = props[breakPoint.value]?.offset ?? props.offset; // 栅格左侧的间隔格数,兜底值为0
  if (props.suffix) {
    //  如果钉到最后一排最后一列
    return {
      gridColumnStart: cols.value - span - offset + 1, //  从第几列开始：总列数 - 占据的列数 - 栅格左侧的间隔格数 + 1
      gridColumnEnd: `span ${span + offset}`, // 跨越的列数为：占据列数 + 栅格左侧的间隔格数
      marginLeft: offset !== 0 ? `calc(((100% + ${gap}px) / ${span + offset}) * ${offset})` : "unset" // 左外边距,挤占offset部分的列宽，使得内容区只占span列宽
    };
  } else {
    return {
      gridColumn: `span ${span + offset > cols.value ? cols.value : span + offset}/span ${
        span + offset > cols.value ? cols.value : span + offset
      }`, // gridColumn : span n / span n, 开始和结束都是设置为跨越 n 列，是一个接一个的排列，跨越的列数 n = span + offset, 最大为当前断点处的列数值.
      marginLeft: offset !== 0 ? `calc(((100% + ${gap}px) / ${span + offset}) * ${offset})` : "unset" // 左外边距
    };
  }
});
/**
 * 说明 marginLeft 左外边距计算公式：
 * marginLeft的值与 offset 关联，效果参考 <el-col :span="6" :offset="6"></el-col>：
 * 此项左侧偏移6列，宽度是跨越6列，而偏移量是通过设置 margin-left得到: 6/24 = 25%，所以实际占据12列，其中左外边距占6列，内容区占6列。
 *
 *而对于grid布局要得到同样的效果， marginLeft = offset/(span + offset), 也就是说左外边距 = 偏移量除以跨越的总列数，
 由于项目的总宽度是包含外边距的，因此内容区被左外边距挤占了 offset 的部分，宽度只剩下原本的 span 部分的列宽。

 假设 span = 2 offset = 1
 那么 marginLeft = 100%/(2+1)*1 = 1/3，也就是说左外边距是1/3,内容区就是 2/3,得到原本需要的效果就是左边偏移1列内容区占据2列。
 */
</script>
