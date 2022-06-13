import { ChannelService } from './channel.service';
import { ChannelDTO } from '../orm/channel.dto';
import { Controller } from '@nestjs/common';

@Controller('chat/channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}
}
