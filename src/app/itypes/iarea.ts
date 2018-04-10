

import { Description, VariableRef, ContentId } from '../types/common';
import { ItemRef } from '../types/item';
import { ActorRef } from '../itypes/iactor';
import { Command } from '../types/command';
import { ActorData } from './iactor';


export interface InternalArea {
    refs: Array<ContentId>;
    id: ContentId;
    tags?: Array<string>;
    name: string;
    desc: Description;
    firstDesc?: Description;
    commands: Array<Command>;
    items?: Array<ItemRef>;
    actors?: Array<ActorRef>;
}





