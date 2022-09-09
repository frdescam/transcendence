import { Module } from '@nestjs/common';
import {  TypeOrmModule } from '@nestjs/typeorm';

import { Message } from '../orm/message.entity';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}
