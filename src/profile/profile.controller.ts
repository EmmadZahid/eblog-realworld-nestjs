import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { GetUser } from 'src/user/decorator/user.decorator';
import { ProfileRO } from './profile.interface';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfileController {
    constructor(private profileService: ProfileService) {}

    @Get(':username')
    getProfile(
        @GetUser('id', ParseIntPipe) followerId: number,
        @Param('username') username: string,
    ): Promise<ProfileRO> {
        return this.profileService.getProfile(followerId, username);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':username/follow')
    followProfile(
        @GetUser('id', ParseIntPipe) followerId: number,
        @Param('username') username: string,
    ): Promise<ProfileRO> {
        return this.profileService.followProfile(followerId, username);
    }

    @Delete(':username/follow')
    unfollowProfile(
        @GetUser('id', ParseIntPipe) followerId: number,
        @Param('username') username: string,
    ): Promise<ProfileRO> {
        return this.profileService.unfollowProfile(followerId, username);
    }
}
