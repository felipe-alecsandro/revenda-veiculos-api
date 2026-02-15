import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { JwtHeader, JwtPayload } from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

interface CognitoConfig {
  issuer: string;
  audience: string;
  jwksUri: string;
}

@Injectable()
export class AuthService {
  private jwksUriCache: string | null = null;
  private jwksClientCache: JwksClient | null = null;

  async getIdentityFromAuthorizationHeader(
    authorizationHeader: string | undefined,
  ): Promise<AuthenticatedUser> {
    if (
      process.env.NODE_ENV === 'test' &&
      authorizationHeader === 'Bearer test-token'
    ) {
      return { userId: 'test-user', email: 'test-user@email.com' };
    }

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token.');
    }

    const token = authorizationHeader.replace('Bearer ', '');
    const config = this.getCognitoConfig();

    try {
      const payload = await this.verifyToken(token, config);

      const userId = typeof payload.sub === 'string' ? payload.sub : null;
      const email = typeof payload.email === 'string' ? payload.email : null;
      if (!userId || !email) {
        throw new UnauthorizedException('Token missing required claims.');
      }

      return { userId, email };
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  private getCognitoConfig(): CognitoConfig {
    const region = process.env.COGNITO_REGION;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const clientId = process.env.COGNITO_CLIENT_ID;

    if (!region || !userPoolId || !clientId) {
      throw new UnauthorizedException(
        'Authentication provider is not configured.',
      );
    }

    const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
    return {
      issuer,
      audience: clientId,
      jwksUri: `${issuer}/.well-known/jwks.json`,
    };
  }

  private getJwks(jwksUri: string): JwksClient {
    if (!this.jwksClientCache || this.jwksUriCache !== jwksUri) {
      this.jwksUriCache = jwksUri;
      this.jwksClientCache = jwksClient({
        jwksUri,
        cache: true,
        cacheMaxEntries: 5,
        cacheMaxAge: 10 * 60 * 1000,
      });
    }
    return this.jwksClientCache;
  }

  private async verifyToken(
    token: string,
    config: CognitoConfig,
  ): Promise<JwtPayload> {
    const client = this.getJwks(config.jwksUri);

    return new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(
        token,
        (header: JwtHeader, callback) => {
          if (!header.kid) {
            callback(new Error('Missing key id in token header.'));
            return;
          }

          void client
            .getSigningKey(header.kid)
            .then((key) => callback(null, key.getPublicKey()))
            .catch((error: unknown) => callback(error as Error));
        },
        {
          issuer: config.issuer,
          audience: config.audience,
          algorithms: ['RS256'],
        },
        (error, decoded) => {
          if (error) {
            reject(error);
            return;
          }
          if (!decoded || typeof decoded === 'string') {
            reject(new Error('Invalid token payload.'));
            return;
          }
          resolve(decoded);
        },
      );
    });
  }
}
