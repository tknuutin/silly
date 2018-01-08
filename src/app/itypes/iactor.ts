
import { Actor } from '../types/actor';


export interface InternalActor extends Actor {
	_type: 'actor',
    aid: string;
    lastAttack?: number;
    lastGrunt?: number;
    isAngry?: boolean;
    isFriendly?: boolean;
}
