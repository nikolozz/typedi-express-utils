# typedi-express-utils

typedi-express-utils library provides utilities to work with express and typedi.

## Installation

You can install typedi-express-utils using npm:

```bash
npm install typedi typedi-express-utils reflect-metadata --save
```

## Usage

```typescript
import Container, { Inject, Service } from 'typedi';
import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  TypediExpressServer,
} from 'typedi-express-utils';
import { Request, Response } from 'express';

@Service()
@Controller('ip')
export class IP {
  constructor(@Inject('API_VERSION') private version: string) {}

  @Get(':name')
  all(@Param('name') name: string, @Req() req: Request, @Res() res: Response) {
    const ip = req.headers['x-forwarded-for'];
    res.setHeader('API-VERSION', this.version);

    return `Hello: ${name}. Your IP is ${ip}`;
  }
}

Container.set('API_VERSION', '1.1');

const server = new TypediExpressServer(Container);

const PORT = 3000;
server.build().listen(PORT, () => console.log(`App listens on ${PORT} port.`));
```

## Contributing

The library is under development, pull requests are welcome. For changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
