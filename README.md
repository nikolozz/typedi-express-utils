```ts
import Container, { Inject, Service } from 'typedi';
import { Controller, Get, Param, Req } from './decorators';
import { TypediExpressServer } from './server';

@Service()
@Controller()
export class Test {
  constructor(@Inject('VERSION') private version: string) {}

  @Get(':id')
  all(@Param('id') a: any, @Req() req: Request) {
    console.log(a, req);
    console.log('Version: ', this.version);
    return this.version;
  }
}

Container.set('VERSION', '1.1');

const server = new TypediExpressServer(Container);

server.build().listen(3000, () => console.log('App listens on 3000'));

```
