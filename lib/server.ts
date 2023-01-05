import {
  ClassType,
  ContainerTypes,
  MetadataTypes,
  ParametersType,
  Route,
} from './decorators';
import express, { Router, Request, Response } from 'express';
import Container from 'typedi';
import bodyParser from 'body-parser';

export class TypediExpressServer {
  private readonly app = express();

  constructor(private container: typeof Container) {}

  build() {
    this.registerControllers();

    return this.app;
  }

  private registerControllers() {
    this.container
      .get<ClassType[]>(ContainerTypes.Controller)
      .forEach((Controller) => {
        const instance = Container.get(Controller);
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
          const params: { type: ParametersType; name?: string }[] =
            controllerParams[route.method];

          router[route.requestMethod](
            '/' + route.path,
            async (req: Request, res: Response) => {
              const paramsMapping = params.map((key) => {
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

              const result = await instance[route.method](...paramsMapping);
              res.send(result);
            },
          );
        });

        this.app.use(bodyParser.json());
        this.app.use('/' + prefix, router);
      });
  }
}
