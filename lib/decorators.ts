import 'reflect-metadata';
import { controllers, MetadataTypes } from './constants';
import { ParametersType, RequestMethods } from './interfaces';

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
    controllers.add(target);

    Reflect.defineMetadata(MetadataTypes.Prefix, path, target);
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
