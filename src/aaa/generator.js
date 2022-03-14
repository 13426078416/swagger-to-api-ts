import {
  getPathParams,
  generateServiceName,
  getHeaderParams,
  getParametersInfo,
  getRefName,
  toPascalCase,
} from "./utils";
import { generateApis } from "./generateApis";
import { generateTypes } from "./generateTypes";
import { generateConstants } from "./generateConstants";
import { generateHook } from "./generateHook";

function generator(input, config) {
  const apis = [];
  const types = [];
  let constantsCounter = 0;
  const constants = [];

  function getConstantName(value) {
    const constant = constants.find((_constant) => _constant.value === value);
    if (constant) {
      return constant.name;
    }

    const name = `_CONSTANT${constantsCounter++}`;

    constants.push({
      name,
      value,
    });

    return name;
  }

  try {
    Object.entries(input.paths).forEach(([endPoint, value]) => {
      const parametersExtended = value.parameters;
      Object.entries(value).forEach(([method, options]) => {
        if (method === "parameters") {
          return;
        }

        const { operationId, security } = options;

        const allParameters =
          parametersExtended || options.parameters
            ? [...(parametersExtended || []), ...(options.parameters || [])]
            : undefined;

        const parameters = (allParameters || []).map((parameter) => {
          const { $ref } = parameter;
          if ($ref) {
            const name = $ref.replace("#/components/parameters/", "");
            return {
              ...input.components.parameters[name],
              $ref,
              schema: { $ref },
            };
          }
          return parameter;
        });

        const serviceName = generateServiceName(
          endPoint,
          method,
          operationId,
          config
        );

        const pathParams = getPathParams(parameters);

        const {
          exist: queryParams,
          isNullable: isQueryParamsNullable,
          params: queryParameters,
        } = getParametersInfo(parameters, "query");
        let queryParamsTypeName = `${toPascalCase(serviceName)}QueryParams`;

        queryParamsTypeName = queryParams && queryParamsTypeName;

        if (queryParamsTypeName) {
          types.push({
            tags: options.tags,
            name: queryParamsTypeName,
            schema: {
              type: "object",
              nullable: isQueryParamsNullable,
              properties: queryParameters.reduce(
                (prev, { name, schema, $ref, required, description }) => {
                  return {
                    ...prev,
                    [name]: {
                      ...($ref ? { $ref } : schema),
                      nullable: !required,
                      description,
                    },
                  };
                },
                {}
              ),
            },
          });
        }

        const { params: headerParams, hasNullable: hasNullableHeaderParams } =
          getHeaderParams(parameters, config);

        const requestBody = getBodyContent(options.requestBody);

        const contentType = Object.keys(
          (options.requestBody && options.requestBody.content) ||
            (options.requestBody &&
              options.requestBody.$ref &&
              input.components &&
              input.components.requestBodies[
                getRefName(options.requestBody.$ref)
              ].content) || {
              "application/json": null,
            }
        )[0];

        const accept = Object.keys(
          options.responses[200].content || {
            "application/json": null,
          }
        )[0];

        const responses = getBodyContent(options.responses[200]);

        let pathParamsRefString = pathParams.reduce(
          (prev, { name }) => `${prev}${name},`,
          ""
        );
        pathParamsRefString = pathParamsRefString
          ? `{${pathParamsRefString}}`
          : undefined;

        const additionalAxiosConfig = headerParams
          ? `{
              headers:{
                ...${getConstantName(`{
                  "Content-Type": "${contentType}",
                  Accept: "${accept}",

                }`)},
                ...headerParams,
              },
            }`
          : getConstantName(`{
              headers: {
                "Content-Type": "${contentType}",
                Accept: "${accept}",
              },
            }`);

        apis.push({
          tags: options.tags,
          contentType,
          summary: options.summary,
          deprecated: options.deprecated,
          serviceName,
          queryParamsTypeName,
          pathParams,
          requestBody,
          headerParams,
          isQueryParamsNullable,
          isHeaderParamsNullable: hasNullableHeaderParams,
          responses,
          pathParamsRefString,
          endPoint,
          method: method,
          security: security
            ? getConstantName(JSON.stringify(security))
            : "undefined",
          additionalAxiosConfig,
          queryParameters,
        });
      });
    });

    if (input.components.schemas) {
      types.push(
        ...Object.entries(input.components.schemas).map(([name, schema]) => {
          return {
            name,
            schema,
          };
        })
      );
    }

    if (input.components.parameters) {
      types.push(
        ...Object.entries(input.components.parameters).map(([key, value]) => ({
          ...value,
          name: key,
        }))
      );
    }

    if (input.components.requestBodies) {
      types.push(
        ...Object.entries(input.components.requestBodies)
          .map(([name, _requestBody]) => {
            return {
              name: `RequestBody${name}`,
              schema: Object.values(_requestBody.content || {})[0].schema,
              description: _requestBody.description,
            };
          })
          .filter((v) => v.schema)
      );
    }

    let code = generateApis(apis, types, config);
    code += generateConstants(constants);
    const type = generateTypes(types, config);
    const hooks = config.reactHooks ? generateHook(apis, types, config) : "";

    return { code, hooks, type };
  } catch (error) {
    console.error({ error });
    return { code: "", hooks: "", type: "" };
  }
}

function getBodyContent(responses) {
  if (!responses) {
    return responses;
  }

  return responses.content
    ? Object.values(responses.content)[0].schema
    : responses.$ref
    ? {
        $ref: responses.$ref,
      }
    : undefined;
}

export { generator };
