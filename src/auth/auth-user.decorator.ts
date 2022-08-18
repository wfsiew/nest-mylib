import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthUser } from "./models";

export const AuthenticatedUser = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthUser => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});