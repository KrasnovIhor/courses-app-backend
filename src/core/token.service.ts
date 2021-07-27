import { Inject, Injectable } from '@nestjs/common';

import * as crypto from 'crypto';

import { CoreModuleConfig, TOKEN_CONFIG } from './core-module.config';
import { TokenVerificationResult } from './token.models';

interface Token {
  stringifiedData: string;
  publicKey: string;
  privateKey: string;
  creationDate: number;
}

@Injectable()
export class TokenService {
  private tokens = new Map<string, Token>();
  private padding = crypto.constants.RSA_PKCS1_PSS_PADDING;
  private tokenTimeLiving: number;

  constructor(@Inject(TOKEN_CONFIG) private tokenConfig: CoreModuleConfig) {
    this.tokenTimeLiving = this.tokenConfig.timeLiving ?? 60;
  }

  sign(data: { [key: string]: any }): string {
    const stringifiedData = JSON.stringify(data);
    const base64Data = Buffer.from(stringifiedData);
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    let signature: Buffer;

    /**
     * That function is supported by Node.js <= 12.0.0
     */
    if (crypto.sign) {
      signature = crypto.sign(this.tokenConfig.algorithm, base64Data, {
        key: privateKey,
        padding: this.padding,
      });
    } else {
      const signer = crypto.createSign(this.tokenConfig.algorithm);

      signer.update(base64Data);
      signer.end();

      signature = signer.sign(privateKey);
    }

    const base64Signature = signature.toString('base64');

    this.tokens.set(base64Signature, {
      stringifiedData,
      publicKey,
      privateKey,
      creationDate: Date.now(),
    });

    return base64Signature;
  }

  verify<T>(
    base64Signature: string,
    cb: (result: TokenVerificationResult<T>) => void,
  ): void {
    const result = {
      error: null,
      user: null,
    } as TokenVerificationResult<T>;

    if (!this.tokens.has(base64Signature)) {
      result.error = {
        message: 'Invalid token.',
      };

      cb(result);

      return;
    }
    const signature = Buffer.from(base64Signature, 'base64');
    const { publicKey, stringifiedData, creationDate } = this.tokens.get(
      base64Signature,
    );
    const timePassed = Date.now() - creationDate;

    if (timePassed >= this.tokenTimeLiving) {
      this.destroy(base64Signature);

      result.error = {
        message: 'Token expired.',
      };

      cb(result);

      return;
    }

    let isVerified: boolean;

    /**
     * That function is supported by Node.js <= 12.0.0
     */
    if (crypto.verify) {
      isVerified = crypto.verify(
        this.tokenConfig.algorithm,
        Buffer.from(stringifiedData),
        {
          key: publicKey,
          padding: this.padding,
        },
        signature,
      );
    } else {
      const verifier = crypto.createVerify(this.tokenConfig.algorithm);

      verifier.update(Buffer.from(stringifiedData));
      verifier.end();

      isVerified = verifier.verify(publicKey, signature);
    }

    if (isVerified) {
      result.user = JSON.parse(stringifiedData);
    } else {
      result.error = {
        message: 'Invalid token.',
      };
    }

    cb(result);
  }

  destroy(base64Signature: string): void {
    this.tokens.delete(base64Signature);
  }
}
