/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { hashPassword, comparePassword, generateSalt, sha256WithSalt } from '../util/hash/hash.util';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}
    
    async createUser(email: string, name: string, apellido: string, password: string, is_admin?: boolean, is_active?: boolean) {
        try {
            console.log("Cifrando contraseña con bcrypt...");
            const hashed_password = await hashPassword(password);
            console.log("Contraseña hasheada exitosamente");
            
            // Usar string vacío en lugar de null si la DB no permite NULL
            return this.usersRepository.createUser(email, name, apellido, hashed_password, '', is_admin ?? false, is_active ?? true);
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

        // Migración: Si el usuario tiene salt (no vacío), está usando el sistema viejo
        let isValid = false;
        if (user.salt && user.salt.length > 0) {
            // Sistema viejo (SHA-256)
            console.log(`Usuario ${email} usando sistema de hash antiguo, verificando...`);
            isValid = user.contrasena === sha256WithSalt(password, user.salt);
            
            if (isValid) {
                // Migrar a bcrypt automáticamente
                console.log(`Migrando usuario ${email} a bcrypt...`);
                const newHash = await hashPassword(password);
                await this.usersRepository.updateUser(user.id, { 
                    password_hash: newHash, 
                    salt: '' // String vacío en lugar de null
                });
                console.log(`Usuario ${email} migrado exitosamente`);
            }
        } else {
            // Sistema nuevo (bcrypt)
            isValid = await comparePassword(password, user.contrasena);
        }

        return isValid ? user : null;
    }

    async updateUser(id:number, data: { email?: string; name?: string; apellido?: string; password?: string; is_admin?: boolean; is_active?: boolean }) {
        if (!data) {
            throw new Error('Update data is required');
        }
        
        let hashedPassword: string | undefined;
        if(data.password){
            hashedPassword = await hashPassword(data.password);
        }
        
        return this.usersRepository.updateUser(id, {
            email: data.email,
            name: data.name,
            apellido: data.apellido,
            password_hash: hashedPassword,
            salt: hashedPassword ? '' : undefined, // String vacío en lugar de null
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

    async changePassword(id: number, newPassword: string) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
          throw new NotFoundException('Usuario no encontrado');
        }
      
        const newHashedPassword = await hashPassword(newPassword);
        await this.usersRepository.updateUser(id, { 
            password_hash: newHashedPassword, 
            salt: '' // String vacío en lugar de null
        });
      
        return { success: true };
    }
      
}