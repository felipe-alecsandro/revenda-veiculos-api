import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CognitoAuthGuard } from './cognito-auth.guard';

@Module({
  providers: [AuthService, CognitoAuthGuard],
  exports: [AuthService, CognitoAuthGuard],
})
export class AuthModule {}
