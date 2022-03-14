/**
 * AUTO_GENERATED Do not change this file directly, use config.ts file instead
 *
 * @version 5
 */

import { AxiosRequestConfig } from "axios";
import { ResponseData } from "../interface/public";
import { request, objectToString } from "../request";
import {
  GetDataSourceDatasourcesQueryParams,
  GetTasksQueryParams,
  DatasourceManagement,
  TaskMark,
  R_IPage_DatasourceManagement_,
  R_Page_DatasourceManagement_,
  R_boolean_,
  R_int_,
} from "../interface/mark";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const __DEV__ = process.env.NODE_ENV !== "production";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function overrideConfig(
  config?: AxiosRequestConfig,
  configOverride?: AxiosRequestConfig,
): AxiosRequestConfig {
  return {
    ...config,
    ...configOverride,
    headers: {
      ...config?.headers,
      ...configOverride?.headers,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function template(path: string, obj: { [x: string]: any } = {}) {
  Object.keys(obj).forEach((key) => {
    const re = new RegExp(`{${key}}`, "i");
    path = path.replace(re, obj[key]);
  });

  return path;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// function objToForm(requestBody: object) {
//   const formData = new FormData();

//   Object.entries(requestBody).forEach(([key, value]) => {
//     value && formData.append(key, value);
//   });

//   return formData;
// }

/**
 *
 * 删除标注内容
 */
export function deleteTaskMarkId(requestBody: {}, configOverride?: AxiosRequestConfig) {
  return request.delete<ResponseData<R_boolean_>>(
    objectToString(deleteTaskMarkId.key, requestBody, "delete"),

    overrideConfig(_CONSTANT0, configOverride),
  );
}

/** Key is end point string without base url */
deleteTaskMarkId.key = "/task/mark/{id}";

/**
 *
 * 查询数据源
 */
export function getDataSourceDatasources(
  requestBody: GetDataSourceDatasourcesQueryParams,
  configOverride?: AxiosRequestConfig,
) {
  return request.get<ResponseData<R_Page_DatasourceManagement_>>(
    objectToString(getDataSourceDatasources.key, requestBody, "get"),

    overrideConfig(_CONSTANT0, configOverride),
  );
}

/** Key is end point string without base url */
getDataSourceDatasources.key = "/dataSource/datasources";

/**
 *
 * 高级搜索
 */
export function getSearch(requestBody: DatasourceManagement, configOverride?: AxiosRequestConfig) {
  return request.get<ResponseData<R_Page_DatasourceManagement_>>(
    objectToString(getSearch.key, requestBody, "get"),

    overrideConfig(_CONSTANT0, configOverride),
  );
}

/** Key is end point string without base url */
getSearch.key = "/search";

/**
 *
 * 查询所有任务
 */
export function getTasks(requestBody: GetTasksQueryParams, configOverride?: AxiosRequestConfig) {
  return request.get<ResponseData<R_IPage_DatasourceManagement_>>(
    objectToString(getTasks.key, requestBody, "get"),

    overrideConfig(_CONSTANT0, configOverride),
  );
}

/** Key is end point string without base url */
getTasks.key = "/tasks";

/**
 *
 * 文件夹上传
 */
export function postDataSourceFolder(
  requestBody: {
    /**
     *
     * file
     * - Format: binary
     */
    file: string;
  },
  configOverride?: AxiosRequestConfig,
) {
  return request.post<ResponseData<R_boolean_>>(
    objectToString(postDataSourceFolder.key, requestBody, "post"),
    requestBody,
    overrideConfig(_CONSTANT1, configOverride),
  );
}

/** Key is end point string without base url */
postDataSourceFolder.key = "/dataSource/folder";

/**
 *
 * 添加或编辑数据源
 */
export function postDataSourceManagement(
  requestBody: DatasourceManagement,
  configOverride?: AxiosRequestConfig,
) {
  return request.post<ResponseData<R_boolean_>>(
    objectToString(postDataSourceManagement.key, requestBody, "post"),
    requestBody,
    overrideConfig(_CONSTANT0, configOverride),
  );
}

/** Key is end point string without base url */
postDataSourceManagement.key = "/dataSource/management";

/**
 *
 * 删除数据源
 */
export function postDataSourceManagementId(requestBody: {}, configOverride?: AxiosRequestConfig) {
  return request.post<ResponseData<R_boolean_>>(
    objectToString(postDataSourceManagementId.key, requestBody, "post"),
    requestBody,
    overrideConfig(_CONSTANT0, configOverride),
  );
}

/** Key is end point string without base url */
postDataSourceManagementId.key = "/dataSource/management/{id}";

/**
 *
 * 新建任务
 */
export function postTask(requestBody: DatasourceManagement, configOverride?: AxiosRequestConfig) {
  return request.post<ResponseData<R_boolean_>>(
    objectToString(postTask.key, requestBody, "post"),
    requestBody,
    overrideConfig(_CONSTANT0, configOverride),
  );
}

/** Key is end point string without base url */
postTask.key = "/task";

/**
 *
 * 删除任务
 */
export function postTaskId(requestBody: {}, configOverride?: AxiosRequestConfig) {
  return request.post<ResponseData<R_boolean_>>(
    objectToString(postTaskId.key, requestBody, "post"),
    requestBody,
    overrideConfig(_CONSTANT0, configOverride),
  );
}

/** Key is end point string without base url */
postTaskId.key = "/task/{id}";

/**
 *
 * 添加标注内容
 */
export function postTaskMark(requestBody: TaskMark[], configOverride?: AxiosRequestConfig) {
  return request.post<ResponseData<R_int_>>(
    objectToString(postTaskMark.key, requestBody, "post"),
    requestBody,
    overrideConfig(_CONSTANT0, configOverride),
  );
}

/** Key is end point string without base url */
postTaskMark.key = "/task/mark";
export const _CONSTANT0 = {
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
};
export const _CONSTANT1 = {
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "*/*",
  },
};
