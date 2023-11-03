import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { UserEntity } from './user.entity';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ user: UserEntity }> {
    return next.handle().pipe(
      map((data: UserEntity) => {
        delete data.password;
        return {
          user: data,
        };
      }),
    );
  }
}
