import { UsersService } from "src/users/users.service";
import { TokenService } from "./token.service";
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request";


@Controller('auth')
export class AuthController {
    constructor(
        private readonly tokenService: TokenService,
        private readonly userService: UsersService
    ) {}

    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }) {
        const user = await this.userService.validateUser(loginDto.email, loginDto.password);
        if (user) {
            const token = await this.tokenService.generateAccessToken(user);
            const refreshToken = await this.tokenService.generateRefreshToken(user);
            return { access_token: token, refresh_token: refreshToken };
        }
        return { error: 'Invalid credentials' };
    }

    @Post('refresh')
    async refresh(@Body() refreshDto: { token: string }) {
        const payload = await this.tokenService.verifyRefreshToken(refreshDto.token);
        if (payload) {
            const user = await this.userService.findById(Number(payload.sub));
            if (user) {
                const newAccessToken = await this.tokenService.generateAccessToken(user);
                return { access_token: newAccessToken };
            }
        }
        return { error: 'Invalid refresh token' };
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: AuthenticatedRequest) {
        return {profile: req.user.profile};
    }

}