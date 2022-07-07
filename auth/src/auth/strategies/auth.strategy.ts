import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-oauth2';
import { stringify } from 'querystring';
import { ConfigService } from '@nestjs/config';

import { AuthDto } from '../dto';
import { User } from 'src/users/entities/user.entity';

// maybe use STATE in request cos of attacks?

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'login') // change login to auth?
{
	constructor(
		config: ConfigService,
		private authService: AuthService,
		private http: HttpService,
	) {
		super({
			authorizationURL: `https://api.intra.42.fr/oauth/authorize?${stringify({
				client_id: config.get('CLIENT_ID'),
				redirect_uri: config.get('CALLBACK_URL'),
				response_type: 'code',
			})}`,
			tokenURL: 'https://api.intra.42.fr/oauth/token',
			grant_type: 'authorization_code',
			clientID : config.get('CLIENT_ID'),
			clientSecret: config.get('CLIENT_SECRET'),
			callbackURL: config.get('CALLBACK_URL'),
		});
	}

	async validate(
		accessToken: string,
	): Promise<User> {
		const { data } = await this.http.get('https://api.intra.42.fr/v2/me', {
			headers: { Authorization: `Bearer ${accessToken}` },
		}).toPromise();

		const user_dto: AuthDto = {
			fortytwo_id: data.id,
			pseudo: data.login,
			email: data.email,
			//password: "changeMePlz", //change later // not needed
			avatar: data.image_url,
		};

		const user: User = await this.authService.login(user_dto);

		if (user)
			return (user);

		return this.authService.signup(user_dto);
	}
}