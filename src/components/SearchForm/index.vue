<template>
  <div v-if="columns.length" class="card table-search">
    <el-form ref="formRef" :model="searchParam">
      <Grid ref="gridRef" :collapsed="collapsed" :gap="[20, 0]" :cols="props.searchCol" :collapsed-rows="props.collapsedRows">
        <GridItem v-for="(item, index) in columns" :key="item.prop" v-bind="getResponsive(item)" :index="index">
          <el-form-item :label="`${item.label} :`">
            <SearchFormItem :column="item" :search-param="searchParam" />
          </el-form-item>
        </GridItem>
        <GridItem :offset="0" :span="1" suffix>
          <div class="operation">
            <el-button type="primary" :icon="Search" @click="search"> 搜索 </el-button>
            <el-button :icon="Delete" @click="reset"> 重置 </el-button>
            <el-button v-if="showCollapse" type="primary" link class="search-isOpen" @click="collapsed = !collapsed">
              {{ collapsed ? "展开" : "合并" }}
              <el-icon class="el-icon--right">
                <component :is="collapsed ? ArrowDown : ArrowUp"></component>
              </el-icon>
            </el-button>
          </div>
        </GridItem>
      </Grid>
    </el-form>
  </div>
</template>
<script setup lang="ts" name="SearchForm">
import { computed, ref } from "vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { BreakPoint } from "@/components/Grid/interface";
import { Delete, Search, ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import SearchFormItem from "./components/SearchFormItem.vue";
import Grid from "@/components/Grid/index.vue";
import GridItem from "@/components/Grid/components/GridItem.vue";

interface ProTableProps {
  columns?: ColumnProps[]; // 搜索配置列
  searchParam?: { [key: string]: any }; // 搜索数据对象
  searchCol: number | Record<BreakPoint, number>; // 网格响应式断点显示列的配置对象或数值
  collapsedRows?: number; // 折叠时显示几行，默认 1 行
  search: (params: any) => void; // 搜索方法
  reset: (params: any) => void; // 重置方法
}

// 默认值
const props = withDefaults(defineProps<ProTableProps>(), {
  columns: () => [],
  searchParam: () => ({}),
  searchCol: () => ({ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }),
  collapsedRows: 1
});

// 获取响应式设置
const getResponsive = (item: ColumnProps) => {
  return {
    span: item.search?.span,
    offset: item.search?.offset ?? 0,
    xs: item.search?.xs,
    sm: item.search?.sm,
    md: item.search?.md,
    lg: item.search?.lg,
    xl: item.search?.xl
  };
};

// 是否默认折叠搜索项
const collapsed = ref(true);

// 获取响应式断点
const gridRef = ref();
const breakPoint = computed<BreakPoint>(() => gridRef.value?.breakPoint);
// 响应式断点列数
const gridCols = computed<number>(() => gridRef.value?.gridCols);

// 判断是否显示 展开/合并 按钮  累加表单所有搜索项占用列数值，大于等于配置的响应式断点列数值，说明超过一行，则显示。
const showCollapse = computed(() => {
  // 计算 suffix项所占用的列数 span + offset
  let suffixCols = 1;
  let show = false;
  props.columns.reduce((prev, current) => {
    prev +=
      (current.search![breakPoint.value]?.span ?? current.search?.span ?? 1) +
      (current.search![breakPoint.value]?.offset ?? current.search?.offset ?? 0);
    // if (typeof props.searchCol !== "number") {
    //   if (prev >= props.searchCol[breakPoint.value]) show = true;
    // } else {
    //   if (prev >= props.searchCol) show = true;
    // }
    if (prev > props.collapsedRows * gridCols.value - suffixCols) show = true;
    return prev;
  }, 0);
  return show;
});

/**
 * 如果默认不折叠 collapsed = false， findIndex 没有执行 hasHidden 也还是 false .
 * 假设此时增加查询项或缩小宽度导致表单超出要显示的行数， hasHidden 依然等于 false， 而 showCollapse 需要为true, 因此不能取 gridRef.value.hasHidden
 */
</script>
