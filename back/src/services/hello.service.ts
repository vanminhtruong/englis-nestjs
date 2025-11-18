import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getHelloWorld(): object {
    return {
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
      status: 'success',
    };
  }
}
