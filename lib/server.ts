import express, { Router, Request, Response } from 'express';
import Container from 'typedi';
import bodyParser from 'body-parser';
import { ContainerTypes, controllers, MetadataTypes } from './constants';
import { ClassType, ParametersType, ParamsType, Route } from './interfaces';

export class TypediExpressServer {
  private readonly app = express();

  constructor(private container: typeof Container) {}

  build() {
    this.registerControllers();

    return this.app;
  }

  private registerControllers() {
    controllers.forEach((controller) => {
      const restControllers = this.container.has(ContainerTypes.Controller)
        ? this.container.get<object[]>(ContainerTypes.Controller)
        : [];

      this.container.set(
        ContainerTypes.Controller,
        restControllers.concat(controller as object),
      );
    });

    this.container
      .get<ClassType[]>(ContainerTypes.Controller)
      .forEach((Controller) => {
        const instance = this.container.get(Controller);
        const router = Router();

        const prefix: string = Reflect.getMetadata(
          MetadataTypes.Prefix,
          Controller,
        );
        const routes: Route[] = Reflect.getMetadata(
          MetadataTypes.Routes,
          Controller,
        );
        const controllerParams = Reflect.getMetadata(
          MetadataTypes.Params,
          Controller,
        );

        routes.forEach((route) => {
          const params: ParamsType[] = controllerParams[route.method];

          router[route.requestMethod](
            '/' + route.path,
            async (req: Request, res: Response) => {
              const paramsMapping = this.extractParams(params, req, res);
              const result = await instance[route.method](...paramsMapping);

              res.send(result);
            },
          );
        });

        this.app.use(bodyParser.json());
        this.app.use('/' + prefix, router);
      });
  }

  private extractParams(params: ParamsType[], req: Request, res: Response) {
    return params.map((key) => {
      switch (key.type) {
        case ParametersType.Param:
          return key.name ? req.params[key.name] : req.params;
        case ParametersType.Req:
          return req;
        case ParametersType.Res:
          return res;
        case ParametersType.Body:
          return req.body;
        default:
          throw new Error('Unexpected metadata type');
      }
    });
  }
}
