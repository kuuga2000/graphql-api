import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.type';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  create(input: CreateUserInput): User {
    const user: User = {
      id: (this.users.length + 1).toString(),
      name: input.name,
      email: input.email,
    };

    this.users.push(user);
    return user;
  }
}
