import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

export class JwtGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['jwt']; // Read the JWT token from the cookie

    // Set the token in the request headers
    request.headers.authorization = `Bearer ${token}`;

    return super.canActivate(context);
  }
}
