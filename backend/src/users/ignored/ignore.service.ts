import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { Ignore } from '../orm/ignored.entity';
import { User } from '../orm/user.entity';

@Injectable({})
export class IgnoreService {
    constructor(
        @InjectRepository(Ignore)
        private readonly ignoreRepository: Repository<Ignore>,

    ) {}

    async sanitizeIgnore(ignore: Ignore): Promise<Ignore>
	{
        if (ignore) {
            if (ignore.user) {
                const user: User = ignore.user;
                delete user.fortytwo_id;
                delete user.refresh_token;
                delete user.secretOf2FA;
            }
            if (ignore.target) {
                const user: User = ignore.target;
                delete user.fortytwo_id;
                delete user.refresh_token;
                delete user.secretOf2FA;
            }
        }
		return ignore;
	}

	async create(user: User, target: User): Promise<Ignore> {
		const ignored: Ignore = this.ignoreRepository.create();
		ignored.user = user;
		ignored.target = target;
        this.sanitizeIgnore(ignored);
		return this.ignoreRepository.save(ignored);
	}

    async alreadyIgnored(user: User, target: User): Promise<boolean>
    {
        const ignore: Ignore[] = await this.ignoreRepository.find({
			where: [
				{ user: user, target: target },
			],
		});
        if (ignore.length > 0)
            return true;
        return false;
    }

	async findAll(user: User): Promise<Ignore[]> {
        const ignore: Ignore[] = await this.ignoreRepository.find({
			where: { user: user },
		});
        ignore.forEach(elem => this.sanitizeIgnore(elem));
        return ignore;
	}

	async remove(user: User, target: User): Promise<boolean> {
		const result: DeleteResult = await this.ignoreRepository.delete({
			user: user,
			target: target,
		});

        if (result.affected != 0)
            return true;
        else
            return false;
	}
}