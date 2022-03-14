import {
  getTsType,
  isAscending,
  getDefineParam,
  getParamString,
  getSchemaName,
  isMatchWholeWord,
} from "./utils";
import {
  SERVICE_BEGINNING,
  SERVICE_NEEDED_FUNCTIONS,
  DEPRECATED_WARM_MESSAGE,
} from "./strings";
import { getJsdoc } from "./utilities/jsdoc";

function generateApis(apis, types, config) {
  let code = SERVICE_BEGINNING;
  try {
    const apisCode = apis
      .sort(({ serviceName }, { serviceName: _serviceName }) =>
        isAscending(serviceName, _serviceName)
      )
      .reduce(
        (
          prev,
          {
            contentType,
            summary,
            deprecated,
            serviceName,
            queryParamsTypeName,
            pathParams,
            requestBody,
            headerParams,
            isQueryParamsNullable,
            isHeaderParamsNullable,
            responses,
            method,
            endPoint,
            pathParamsRefString,
            additionalAxiosConfig,
            security,
          }
        ) => {
          return (
            prev +
            `
${getJsdoc({
  description: summary,
  deprecated: deprecated ? DEPRECATED_WARM_MESSAGE : undefined,
})}export function ${serviceName} (
          ${
            /** Request Body */
            requestBody
              ? `${getDefineParam("requestBody", true, requestBody)},`
              : queryParamsTypeName
              ? `${getParamString(
                  "requestBody",
                  !isQueryParamsNullable,
                  queryParamsTypeName
                )},`
              : "requestBody:{},"
          }configOverride?:AxiosRequestConfig
){
  ${
    deprecated
      ? `
  if (__DEV__) {
    console.warn(
      "${serviceName}",
      "${DEPRECATED_WARM_MESSAGE}",
    );
  }`
      : ""
  }
  return request.${method}<ResponseData<${
              responses ? getTsType(responses) : "any"
            }>>(
    objectToString(${serviceName}.key, requestBody, "${method}"),
    ${method === "post" || method === "POST" ? "requestBody," : ""}
    overrideConfig(${additionalAxiosConfig},
      configOverride,
    )
  )
}

/** Key is end point string without base url */
${serviceName}.key = "${endPoint}";
`
          );
        },
        ""
      );

    code +=
      types.reduce((prev, { name: _name }) => {
        const name = getSchemaName(_name);

        if (!isMatchWholeWord(apisCode, name)) {
          return prev;
        }

        return prev + ` ${name},`;
      }, "import {") + `}  from "../interface/${config.name}"\n`;

    code += SERVICE_NEEDED_FUNCTIONS;
    code += apisCode;
    return code;
  } catch (error) {
    console.error(error);
    return "";
  }
}

export { generateApis };
