import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { sha256 } from '../util/hash/hash.util';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}
    
    async createUser(email: string, name: string, apellido: string, password: string, is_admin?: boolean, is_active?: boolean) {
        try {
            console.log("Aqui cifraremos la contraseña. Tambien, el salt.");
            const hashed_password= sha256(password);
            return this.usersRepository.createUser(email, name, apellido, hashed_password, is_admin?? false, is_active?? true);
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
        console.log("Password Hash : " + user.contrasena);
        console.log("Hashed Password : " + sha256(password));
        const isValid = user.contrasena === sha256(password);
        return isValid ? user : null;
    }

    async updateUser(id:number, data: { email?: string; name?: string; apellido?: string; password?: string; is_admin?: boolean; is_active?: boolean }) {
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
            apellido: data.apellido,
            password_hash: hashedPassword,
            is_admin: data.is_admin,
            is_active: data.is_active
        });
    }

    async getAllUsers() {
        return this.usersRepository.findAllUsers();
    }

}