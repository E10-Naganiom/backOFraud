/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { generateSalt, sha256WithSalt } from '../util/hash/hash.util';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}
    
    async createUser(email: string, name: string, apellido: string, password: string, is_admin?: boolean, is_active?: boolean) {
        try {
            console.log("Aqui cifraremos la contraseña. Tambien, el salt. Ya");
            const salt = generateSalt();
            console.log("Salt generado: " + salt);
            const hashed_password= sha256WithSalt(password, salt);
            return this.usersRepository.createUser(email, name, apellido, hashed_password, salt, is_admin?? false, is_active?? true);
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
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

        if (!user.is_active) {
            return null; // No permitir login de usuarios inactivos
        }

        console.log(user);
        console.log("Password : " + password);
        console.log("Password Hash : " + user.contrasena);
        console.log("Hashed Password : " + sha256WithSalt(password, user.salt));
        
        const isValid = user.contrasena === sha256WithSalt(password, user.salt);
        return isValid ? user : null;
    }

    async updateUser(id:number, data: { email?: string; name?: string; apellido?: string; password?: string; is_admin?: boolean; is_active?: boolean }) {
        if (!data) {
            throw new Error('Update data is required');
        }
        let hashedPassword: string | undefined;
        if(data.password){
            hashedPassword = sha256WithSalt(data.password, generateSalt());
        }
        return this.usersRepository.updateUser(id, {
            email: data.email,
            name: data.name,
            apellido: data.apellido,
            password_hash: hashedPassword,
            is_admin: data.is_admin,
            is_active: data.is_active
        });
    }

    async getAllUsers() {
        return this.usersRepository.findAllUsers();
    }

    async inactivateUser(id: number) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return this.usersRepository.updateUser(id, { is_active: false });
    }

}