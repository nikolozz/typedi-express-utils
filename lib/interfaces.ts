export type RequestMethods = 'get' | 'post' | 'put' | 'delete' | 'patch';
export type ClassType = new (...args: any) => any;

export interface Route {
  requestMethod: RequestMethods;
  path: string;
  method: string;
}

export enum ParametersType {
  Param,
  Body,
  Req,
  Res,
}

export type ParamsType = {
  type: ParametersType;
  name?: string;
};
