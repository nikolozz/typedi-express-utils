import 'reflect-metadata';
import Container, { Token } from 'typedi';

export const MetadataTypes = {
  Prefix: Symbol.for('PREFIX'),
  Routes: Symbol.for('ROUTES'),
  Params: Symbol.for('PARAMS'),
};

export const ContainerTypes = {
  Controller: new Token('CONTROLLER'),
};

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

const parametersDecoratorFactory = (
  type: ParametersType,
  name?: string,
): ParameterDecorator => {
  return (target: object, key: string | symbol) => {
    const lateParams =
      Reflect.getMetadata(MetadataTypes.Params, target.constructor) || {};

    const params = {
      [key]: [{ type, name }, ...(lateParams[key] || [])],
    };

    Reflect.defineMetadata(MetadataTypes.Params, params, target.constructor);
  };
};

const methodDecoratorFactory = (
  type: RequestMethods,
  path: string = '/',
): MethodDecorator => {
  return (target: object, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(
      MetadataTypes.Routes,
      [
        ...(Reflect.getMetadata(MetadataTypes.Routes, target.constructor) ||
          []),
        { requestMethod: type, path, method: propertyKey },
      ],
      target.constructor,
    );
  };
};

export const Controller = (path: string = ''): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata(MetadataTypes.Prefix, path, target);

    const restControllers = Container.has(ContainerTypes.Controller)
      ? Container.get<object[]>(ContainerTypes.Controller)
      : [];

    Container.set(ContainerTypes.Controller, restControllers.concat(target));
  };
};

export const Get = (path?: string): MethodDecorator =>
  methodDecoratorFactory('get', path);

export const Post = (path?: string): MethodDecorator =>
  methodDecoratorFactory('post', path);

export const Put = (path?: string): MethodDecorator =>
  methodDecoratorFactory('put', path);

export const Delete = (path?: string): MethodDecorator =>
  methodDecoratorFactory('delete', path);

export const Patch = (path?: string): MethodDecorator =>
  methodDecoratorFactory('patch', path);

export const Param = (name?: string) =>
  parametersDecoratorFactory(ParametersType.Param, name);

export const Body = (name?: string) =>
  parametersDecoratorFactory(ParametersType.Body, name);

export const Req = () => parametersDecoratorFactory(ParametersType.Req);
export const Res = () => parametersDecoratorFactory(ParametersType.Res);
