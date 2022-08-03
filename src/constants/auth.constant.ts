import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';
export const SkipAuth = () => SetMetadata(IS_PUBLIC, true);
export const TOKEN_NAME = 'token';
