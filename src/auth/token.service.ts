import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

export type UserProfile = {
    id: number;
    email: string;
    name: string;
};

export type AccessPayload = {
    sub: string;
    type: 'access';
    profile: UserProfile
};

export type RefreshPayload = {
    sub: string;
    type: 'refresh';
};

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    async generateAccessToken(profile: UserProfile): Promise<string> {
        console.log("Secret key: " + "supersecret");
        return this.jwtService.signAsync({
            sub: profile.id.toString(),
            type: 'access',
            profile
        } satisfies AccessPayload, 
        {
            secret: "supersecret",    //process.env.JWT_SECRET,     //"supersecret"
            expiresIn: "1m"      //process.env.JWT_ACCESS_EXPIRES_IN         //"1m"
        });
    }

    async generateRefreshToken(profile:UserProfile): Promise<string> {
        return this.jwtService.signAsync({
            sub: profile.id.toString(),
            type: 'refresh'
        } satisfies RefreshPayload,
        {
            secret: "supersecret",     //process.env.JWT_SECRET,          //"supersecret"
            expiresIn: "7d"         //process.env.JWT_REFRESH_EXPIRES_IN        //"7d"
        });
    }

    async verifyAccessToken(token: string): Promise<AccessPayload> {
        const payload = await this.jwtService.verifyAsync<AccessPayload>(token, {
            secret: "supersecret"      //process.env.JWT_SECRET       //"supersecret"
        });
        if (payload.type !== 'access') {
            throw new Error('Invalid token type');
        }
        return payload;
    }

    async verifyRefreshToken(token: string): Promise<RefreshPayload> {
        const payload = await this.jwtService.verifyAsync<RefreshPayload>(token, {
            secret: "supersecret"      //process.env.JWT_SECRET      //"supersecret"
        });
        if (payload.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return payload;
    }

}