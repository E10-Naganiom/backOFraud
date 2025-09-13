import { Controller, Post } from "@nestjs/common";
import { Body, Get, Param, Put } from "@nestjs/common/decorators";
import { UsersService } from "./users.service";
import { ApiOperation } from "@nestjs/swagger";

export type CreateUserDto = {
    email:string;
    name:string;
    password:string;
}

export type UpdateUserDto = {
    email?:string;
    name?:string;
    password?:string;
}

@Controller('users')
export class UsersController{
    constructor(private readonly usersService:UsersService){}

    @Post()
    async createUser(@Body() creayeUserDto:CreateUserDto){
        return this.usersService.createUser(creayeUserDto.email, creayeUserDto.name, creayeUserDto.password);
    }

    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto:UpdateUserDto){
        return this.usersService.updateUser(Number(id), updateUserDto);
    }
}