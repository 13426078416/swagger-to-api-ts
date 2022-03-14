/**
 * AUTO_GENERATED Do not change this file directly, use config.ts file instead
 *
 * @version 5
 */

/**
 *
 * DatasourceManagement
 *
 * 数据源配置管理
 */

export interface DatasourceManagement {
  /**
   *
   * 创建时间
   * - Format: date-time
   */
  createTime?: string;
  /**
   *
   * 创建人
   */
  createuser?: string;
  del?: boolean;
  /**
   *
   * 项目描述
   */
  description?: string;
  /**
   *
   * 主键
   */
  id?: string;
  /**
   *
   * 项目名称
   */
  productName?: string;
  /**
   *
   * 项目类型
   */
  productType?: string;
  /**
   *
   * 项目状态
   * - Format: int64
   */
  status?: number;
  /**
   *
   * 更新时间
   * - Format: date-time
   */
  updateTime?: string;
  /**
   *
   * 更新人
   */
  updateUser?: string;
}

export interface GetDataSourceDatasourcesQueryParams {
  /**
   *
   * 页码
   * - Format: int32
   */
  pageNum: number;
  /**
   *
   * 页面大小
   * - Format: int32
   */
  pageSize: number;
  /**
   *
   * 数据源名称
   */
  datasourceName?: string;
}

export interface GetSearchQueryParams {
  /**
   *
   * 页码
   * - Format: int32
   */
  pageNum: number;
  /**
   *
   * 页面大小
   * - Format: int32
   */
  pageSize: number;
}

export interface GetTasksQueryParams {
  /**
   *
   * 页码
   * - Format: int32
   */
  pageNum: number;
  /**
   *
   * 页面大小
   * - Format: int32
   */
  pageSize: number;
}

/**
 *
 * IPage«DatasourceManagement»
 *
 */

export interface IPage_DatasourceManagement_ {
  /**
   *
   * - Format: int64
   */
  current?: number;
  /**
   *
   * - Format: int64
   */
  pages?: number;
  records?: DatasourceManagement[];
  searchCount?: boolean;
  /**
   *
   * - Format: int64
   */
  size?: number;
  /**
   *
   * - Format: int64
   */
  total?: number;
}

/**
 *
 * OrderItem
 *
 */

export interface OrderItem {
  asc?: boolean;
  column?: string;
}

/**
 *
 * Page«DatasourceManagement»
 *
 */

export interface Page_DatasourceManagement_ {
  /**
   *
   * - Format: int64
   */
  current?: number;
  orders?: OrderItem[];
  /**
   *
   * - Format: int64
   */
  pages?: number;
  records?: DatasourceManagement[];
  searchCount?: boolean;
  /**
   *
   * - Format: int64
   */
  size?: number;
  /**
   *
   * - Format: int64
   */
  total?: number;
}

export interface PostDataSourceFolderQueryParams {
  /**
   *
   * filePath
   */
  filePath: string;
}

/**
 *
 * R«IPage«DatasourceManagement»»
 *
 * 返回信息
 */

export interface R_IPage_DatasourceManagement_ {
  /**
   *
   * 状态码
   */
  code: string;
  /**
   *
   * 返回消息
   */
  msg: string;
  data?: IPage_DatasourceManagement_;
}

/**
 *
 * R«Page«DatasourceManagement»»
 *
 * 返回信息
 */

export interface R_Page_DatasourceManagement_ {
  /**
   *
   * 状态码
   */
  code: string;
  /**
   *
   * 返回消息
   */
  msg: string;
  data?: Page_DatasourceManagement_;
}

/**
 *
 * R«boolean»
 *
 * 返回信息
 */

export interface R_boolean_ {
  /**
   *
   * 状态码
   */
  code: string;
  /**
   *
   * 返回消息
   */
  msg: string;
  /**
   *
   * 承载数据
   */
  data?: boolean;
}

/**
 *
 * R«int»
 *
 * 返回信息
 */

export interface R_int_ {
  /**
   *
   * 状态码
   */
  code: string;
  /**
   *
   * 返回消息
   */
  msg: string;
  /**
   *
   * 承载数据
   * - Format: int32
   */
  data?: number;
}

/**
 *
 * TaskMark
 *
 * 数据标注
 */

export interface TaskMark {
  /**
   *
   * 创建时间
   * - Format: date-time
   */
  createrTime?: string;
  /**
   *
   * 创建人
   */
  createruser?: string;
  /**
   *
   * 主键
   */
  id?: string;
  /**
   *
   * 标注内容
   */
  markDescription?: string;
  /**
   *
   * 图片长度
   * - Format: int64
   */
  markLong?: number;
  /**
   *
   * 图片宽度
   * - Format: int64
   */
  markWeigth?: number;
  /**
   *
   * 标注结束位置
   * - Format: int64
   */
  offsetEnd?: number;
  /**
   *
   * 标注开始位置
   * - Format: int64
   */
  offsetStart?: number;
  /**
   *
   * 任务id
   */
  taskId?: string;
  /**
   *
   * 标注类型
   */
  type?: string;
  /**
   *
   * 更新时间
   * - Format: date-time
   */
  updateTime?: string;
  /**
   *
   * 更新人
   */
  updateUser?: string;
}
