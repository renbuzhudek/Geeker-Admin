import { VNode, ComponentPublicInstance } from "vue";
import { BreakPoint, Responsive } from "@/components/Grid/interface";
import { TableColumnCtx } from "element-plus/es/components/table/src/table-column/defaults";
import { ProTableProps } from "@/components/ProTable/index.vue";
import ProTable from "@/components/ProTable/index.vue";
/** 枚举项类型 */
export interface EnumProps {
  label?: string; // 选项框显示的文字
  value?: string | number | boolean | any[]; // 选项框值
  disabled?: boolean; // 是否禁用此选项
  tagType?: string; // 当 tag 为 true 时，此选择会指定 table-column 内容区 tag 标签的显示类型
  children?: EnumProps[]; // 为树形选择时，可以通过 children 属性指定子选项
  [key: string]: any;
}
/** 表格特殊列类型 */
export type TypeProps = "index" | "selection" | "expand";
/** 搜索输入框组件类型 */
export type SearchType =
  | "input"
  | "input-number"
  | "select"
  | "select-v2"
  | "tree-select"
  | "cascader"
  | "date-picker"
  | "time-picker"
  | "time-select"
  | "switch"
  | "slider";
/** 搜索输入框组件渲染函数 render 的参数类型 */
export type SearchRenderScope = {
  searchParam: { [key: string]: any };
  placeholder: string;
  clearable: boolean;
  options: EnumProps[];
  data: EnumProps[];
};
/** 搜索框配置 */
export type SearchProps = {
  el?: SearchType; // 当前项搜索框的类型
  props?: any; // 搜索项参数，根据 element plus 官方文档来传递，该属性所有值会透传到组件
  key?: string; // 当搜索项 key 不为 prop 属性时，可通过 key 指定
  order?: number; // 搜索项排序（从大到小）
  span?: number; // 搜索项所占用的列数，默认为1列
  offset?: number; // 搜索字段左侧偏移列数
  defaultValue?: string | number | boolean | any[]; // 搜索项默认值
  render?: (scope: SearchRenderScope) => VNode; // 自定义搜索内容渲染（tsx语法）
} & Partial<Record<BreakPoint, Responsive>>;

export type FieldNamesProps = {
  label: string;
  value: string;
  children?: string;
};
/** 对应 table-column 自定义列的内容 作用域参数 scope */
export type RenderScope<T> = {
  row: T;
  $index: number;
  column: TableColumnCtx<T>;
  [key: string]: any;
};
/** 对应 table-column 自定义表头的内容， 作用域参数 */
export type HeaderRenderScope<T> = {
  $index: number;
  column: TableColumnCtx<T>;
  [key: string]: any;
};

export interface ColumnProps<T = any> extends Partial<Omit<TableColumnCtx<T>, "children" | "renderCell" | "renderHeader">> {
  tag?: boolean; // 是否是标签展示
  isShow?: boolean; // 是否显示在表格当中
  search?: SearchProps | undefined; // 搜索项配置
  enum?: EnumProps[] | ((params?: any) => Promise<any>); // 枚举类型（字典） 支持异步获取
  isFilterEnum?: boolean; // 当前单元格值是否根据 enum 格式化（示例：enum 只作为搜索项数据）
  fieldNames?: FieldNamesProps; // 指定 label && value && children 的 key 值
  headerRender?: (scope: HeaderRenderScope<T>) => VNode; // 自定义表头内容渲染（tsx语法）
  render?: (scope: RenderScope<T>) => VNode | string; // 自定义单元格内容渲染（tsx语法）
  _children?: ColumnProps<T>[]; // 多级表头
}

export type ProTableInstance = Omit<InstanceType<typeof ProTable>, keyof ComponentPublicInstance | keyof ProTableProps>;
