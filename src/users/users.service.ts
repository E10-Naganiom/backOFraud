import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { sha256 } from '../util/hash/hash.util';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}
    
    async createUser(email: string, name: string, password: string){
        try {
            console.log("Aqui cifraremos la contraseña");
            const hashed_password= sha256(password);
            return this.usersRepository.createUser(email, name, hashed_password);
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                // Lanzamos un error más entendible
                throw new ConflictException('Ya existe una cuenta con este correo.');
              }
              console.error('Error inesperado en createUser:', error);
              throw new InternalServerErrorException('Ocurrió un error inesperado al crear el usuario.');
        }
    }

    async findById(id: number){
        return this.usersRepository.findById(id);
    }

    async validateUser(email: string, password: string){
        const user = await this.usersRepository.findByEmail(email);
        if(!user) return null;
        console.log(user);
        console.log("Password : " + password);
        console.log("Password Hash : " + user.password_hash);
        console.log("Hashed Password : " + sha256(password));
        const isValid = user.password_hash === sha256(password);
        return isValid ? user : null;
    }

    async updateUser(id:number, data: { email?: string; name?: string; password?: string }){
        if (!data) {
            throw new Error('Update data is required');
        }
        let hashedPassword: string | undefined;
        if(data.password){
            hashedPassword = sha256(data.password);
        }
        return this.usersRepository.updateUser(id, {
            email: data.email,
            name: data.name,
            password_hash: hashedPassword
        });
    }

    async getAllUsers() {
        return this.usersRepository.findAllUsers();
    }

}