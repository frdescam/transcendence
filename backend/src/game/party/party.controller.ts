import { Body, Request, Controller, Get, Param, Post, Put, UsePipes, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { PartyService } from './party.service';
import { UserService } from 'src/users/user/user.service';
import { IgnoreService } from 'src/users/ignored/ignore.service';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { controllerValidationPipe } from 'src/validation';
import { partyGiveupDto, partyGetDto, createPartyDto } from '../orm/controllerParty.dto';
import { getPartyDto } from 'src/common/game/orm/getParty.dto';
import type { UserDTO } from 'src/users/orm/user.dto';
import type { userId } from 'src/common/game/types';

@Controller('party')
@UsePipes(controllerValidationPipe)
export class PartyController
{
	constructor (
		private partyService: PartyService,
		private userService: UserService,
		private readonly ignoreService: IgnoreService
	)
	{}
	
	@Get()
	findAll(): getPartyDto[]
	{
		return (this.partyService.getAllAsJSON());
	}

	@UseGuards(JwtAuthGuard)
	@Get('mine')
	findMine(
		@Request() req,
	): string | null
	{
		const user: UserDTO = req.user;
		this.partyService.checkUserObject(user);
		const himself: userId = user.id;
		const party = this.partyService.findPartyWithUser(himself);

		return (party ? party.room : null);        
	}

	@UseGuards(JwtAuthGuard)
	@Put('giveup')
	giveup(
		@Request() req,
		@Param() { room }: partyGiveupDto
	)
	{
		const user: UserDTO = req.user;
		this.partyService.checkUserObject(user);
		const himself: userId = user.id;
		const party = this.partyService.findPartyWithUser(himself);
		if (!party)
			return ({left: false});
		const slot = this.partyService.getSlotFromUser(party, himself);
		if (slot === -1)
			throw 'Unexpected state';
		if (typeof room === 'string')
			if (room !== party.room)
				return ({left: false});

		if (this.partyService.admitDefeat(party, slot))
			return ({left: true});
		else
			return ({left: false});
	}

	@Get(':room')
	findOne(
		@Param() { room }: partyGetDto
	): getPartyDto | null
	{
		const partyArr = this.partyService.getAll().filter(({room: partyRoom}) => (partyRoom === room));

		return (partyArr.length ? this.partyService.partyToPublicJson(partyArr[0]) : null);
	}
	
	@UseGuards(JwtAuthGuard)
	@Post()
	async create(
		@Body() { room = null, map = 'classic', adversary = null }: createPartyDto,
		@Request() req
	): Promise<string>
	{
		const user: UserDTO = req.user;
		this.partyService.checkUserObject(user);
		const himself: userId = user.id;

		if (typeof adversary === 'number')
			if (!(await this.userService.getOne(adversary)))
				throw new HttpException('Adversary not found', HttpStatus.NOT_FOUND);

		if (typeof himself === 'number' && typeof adversary === 'number')
		{
			if (himself === adversary)
				throw new HttpException('You cannot start a game against yourself', HttpStatus.I_AM_A_TEAPOT);
			if (!(await this.ignoreService.compatible(himself, adversary)))
				throw new HttpException('You cannot start a game with ignored user', HttpStatus.I_AM_A_TEAPOT);
		}

		const party = this.partyService.createParty(
			room,
			map,
			[himself, adversary]
		);
		return (party.room);
	}
}
