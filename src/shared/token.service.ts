import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line
const jwt = require('jsonwebtoken');

@Injectable()
export class TokenService {
    constructor(private configService: ConfigService) {}

    public generateJWT(data: any): string {
        return jwt.sign(
            {
                ...data,
                exp: new Date().getTime() + 60 * 60 * 1000, //on hour
            },
            this.configService.get('SECRET'),
        );
    }
}
