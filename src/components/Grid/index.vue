<template>
  <div :style="style">
    <slot></slot>
  </div>
</template>

<script setup lang="ts" name="Grid">
import {
  ref,
  watch,
  // useSlots,
  computed,
  provide,
  onBeforeMount,
  onMounted,
  onUnmounted,
  onDeactivated,
  onActivated,
  // VNodeArrayChildren,
  VNode
} from "vue";
import type { BreakPoint } from "./interface/index";

type Props = {
  cols?: number | Record<BreakPoint, number>; //  响应式列数，数值 或 响应式断点对象
  collapsed?: boolean; // 是否折叠，默认 false 不折叠
  collapsedRows?: number; // 折叠时显示几行，默认 1 行
  gap?: [number, number] | number; // 间隙
};

const props = withDefaults(defineProps<Props>(), {
  cols: () => ({ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }),
  collapsed: false,
  collapsedRows: 1,
  gap: 0
});
onBeforeMount(() => props.collapsed && findIndex());
onMounted(() => {
  resize({ target: { innerWidth: window.innerWidth } } as unknown as UIEvent);
  window.addEventListener("resize", resize);
});
onActivated(() => {
  resize({ target: { innerWidth: window.innerWidth } } as unknown as UIEvent);
  window.addEventListener("resize", resize);
});
onUnmounted(() => {
  window.removeEventListener("resize", resize);
});
onDeactivated(() => {
  window.removeEventListener("resize", resize);
});

// 监听屏幕变化， 设置响应式断点的值
const resize = (e: UIEvent) => {
  let width = (e.target as Window).innerWidth;
  switch (!!width) {
    case width < 768:
      breakPoint.value = "xs";
      break;
    case width >= 768 && width < 992:
      breakPoint.value = "sm";
      break;
    case width >= 992 && width < 1200:
      breakPoint.value = "md";
      break;
    case width >= 1200 && width < 1920:
      breakPoint.value = "lg";
      break;
    case width >= 1920:
      breakPoint.value = "xl";
      break;
  }
};

// 注入 gap 间距
provide("gap", Array.isArray(props.gap) ? props.gap[0] : props.gap);

// 注入响应式断点的值
let breakPoint = ref<BreakPoint>("xl");
provide("breakPoint", breakPoint);

// 注入要开始隐藏项的下标
const hiddenIndex = ref(-1);
provide("shouldHiddenIndex", hiddenIndex);
const hasHidden = ref(false);
// 注入 cols 当前响应式断点的一行的列数
const gridCols = computed(() => {
  if (typeof props.cols === "object") return props.cols[breakPoint.value] ?? props.cols;
  return props.cols;
});
provide("cols", gridCols);

const items = ref<any>([]); //  gridItems
const addItem = (child: any) => {
  items.value.push(child);
};
const removeItem = (child: any) => {
  let index = items.value.findIndex((item: any) => item.uid === child.uid);
  if (index > -1) {
    items.value.splice(index, 1);
  }
};
provide("addItem", addItem);
provide("removeItem", removeItem);

// 寻找需要开始折叠的字段 index
// const slots = useSlots().default!(); // 默认插槽
// 找到需要隐藏的项下标,  slots 重写改成注入方法给子孙组件进行添加删除。
const findIndex = () => {
  // console.log("slots:::", slots);
  // let fields: VNodeArrayChildren = [];
  // let suffix: VNode | null = null;
  // slots.forEach((slot: any) => {
  //   // suffix 找出了钉到最后一排最后一列的项
  //   if (typeof slot.type === "object" && slot.type.name === "GridItem" && slot.props?.suffix !== undefined) suffix = slot;
  //   // slot children
  //   if (typeof slot.type === "symbol" && Array.isArray(slot.children)) fields.push(...slot.children);
  // });

  let fields: { props: any }[] = items.value.slice(0);
  let suffix: { props: any } | null = null;
  let suffixIndex = fields.findIndex(el => !!el.props.suffix);
  if (suffixIndex != -1) {
    suffix = fields.splice(suffixIndex, 1)[0];
  }
  // console.log(
  //   suffixIndex,
  //   suffix,
  //   fields.map(el => ({ ...el.props }))
  // );
  // 计算 suffix项所占用的列数
  let suffixCols = 0;
  if (suffix) {
    suffixCols =
      ((suffix as VNode).props![breakPoint.value]?.span ?? (suffix as VNode).props?.span ?? 1) +
      ((suffix as VNode).props![breakPoint.value]?.offset ?? (suffix as VNode).props?.offset ?? 0);
  }
  try {
    hasHidden.value = false;
    fields.reduce((prev = 0, current, index) => {
      prev +=
        ((current as VNode)!.props![breakPoint.value]?.span ?? (current as VNode)!.props?.span ?? 1) +
        ((current as VNode)!.props![breakPoint.value]?.offset ?? (current as VNode)!.props?.offset ?? 0);
      // 累计当前项及之前所有项占据的列数 prev, 如果 prev 大于折叠后显示的行数乘以一行的列数 减去 钉住项占用的列数，则此项是需要开始隐藏的项，退出执行。
      if (Number(prev) > props.collapsedRows * gridCols.value - suffixCols) {
        hiddenIndex.value = index;
        hasHidden.value = true;
        throw "find it";
      }
      return prev;
    }, 0);
    if (!hasHidden.value) hiddenIndex.value = -1; // 如果没找到隐藏项下标，重置为 -1
  } catch (e) {
    // console.warn(e);
  }
};

// 断点及子项变化时 执行 findIndex
watch(
  () => [breakPoint.value, ...items.value],
  () => {
    if (props.collapsed) findIndex();
  }
);

// 监听 collapsed，为false不折叠时，隐藏项下标置为-1
watch(
  () => props.collapsed,
  value => {
    if (value) return findIndex();
    hiddenIndex.value = -1;
  }
);

// 设置间距
const gridGap = computed(() => {
  if (typeof props.gap === "number") return `${props.gap}px`;
  if (Array.isArray(props.gap)) return `${props.gap[1]}px ${props.gap[0]}px`;
  return "unset";
});

// 设置 style
const style = computed(() => {
  return {
    display: "grid",
    gridGap: gridGap.value,
    gridTemplateColumns: `repeat(${gridCols.value}, minmax(0, 1fr))` // 网格一行列数为响应式断点列数，宽度区间： 0 - 1列宽
  };
});

defineExpose({ breakPoint, gridCols });
</script>
