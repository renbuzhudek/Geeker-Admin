<template>
  <component
    :is="realInputType"
    v-bind="{ ...handleProps }"
    :data="props.inputType === 'tree-select' ? columnEnum : []"
    :options="['cascader', 'select-v2'].includes(props.inputType!) ? columnEnum : []"
  >
    <template v-if="props.inputType === 'cascader'" #default="{ data }">
      <span>{{ data[fieldNames.label] }}</span>
    </template>
    <template v-if="props.inputType === 'select'">
      <component
        :is="`el-option`"
        v-for="(col, index) in columnEnum"
        :key="index"
        :label="col[fieldNames.label]"
        :value="col[fieldNames.value]"
      ></component>
    </template>
    <slot v-else></slot>
  </component>
</template>

<script setup lang="ts" name="InputItem">
// 此组件为element-plus透传表单组件，通过属性 inputType 指定要渲染的表单组件
import { computed, useAttrs } from "vue";
import type { SearchType, FieldNamesProps } from "@/components/ProTable/interface";
// 设置为false，需要显示绑定 $attrs，在 data和options 属性上面，避免被覆盖
defineOptions({
  inheritAttrs: false
});
interface InputItemProps {
  inputType: SearchType; // 表单组件类型
  props?: FieldNamesProps; //  设置选项的 label && value && children 的 key 值，额外支持了 select 和 select-v2 组件
}

const props = defineProps<InputItemProps>();

const attrs = useAttrs() as { props?: Record<string, any>; options?: any[]; data?: any[] };

const inputTypeMap: Record<SearchType, string> = {
  input: "el-input",
  "input-number": "el-input-number",
  select: "el-select",
  "select-v2": "el-select-v2",
  "tree-select": "el-tree-select",
  cascader: "el-cascader",
  "date-picker": "el-date-picker",
  "time-picker": "el-time-picker",
  "time-select": "el-time-select",
  switch: "el-switch",
  slider: "el-slider"
};
const realInputType = computed(() => inputTypeMap[props.inputType] || props.inputType);

// 判断 fieldNames 设置 label && value && children 的 key 值
const fieldNames = computed(() => {
  return {
    label: props.props?.label ?? "label",
    value: props.props?.value ?? "value",
    children: props.props?.children ?? "children"
  };
});

// 接收 options (el 为 select-v2 需单独处理 enumData) 原因是 select-v2  不支持 props 属性指定 label,value,children字段
const columnEnum = computed(() => {
  let enumData = attrs.options || attrs.data || [];
  if (props.inputType === "select-v2" && props.props) {
    enumData = enumData.map((item: { [key: string]: any }) => {
      return { ...item, label: item[fieldNames.value.label], value: item[fieldNames.value.value] };
    });
  }
  return enumData;
});

// 处理透传的 props (inputType 为 tree-select、cascader 的时候需要给下默认 label && value && children)
const handleProps = computed(() => {
  const { label, value, children } = fieldNames.value;
  let sProps = attrs as any;
  if (props.inputType === "tree-select") {
    // 不能传入 value 字段否则会出错,自动转给 nodeKey。
    sProps = { ...sProps, props: { ...sProps.props, label, children }, nodeKey: sProps.nodeKey || sProps["node-key"] || value };
  }
  if (props.inputType === "cascader") {
    sProps = { ...sProps, props: { ...sProps.props, label, value, children } };
  }
  return sProps;
});
</script>
