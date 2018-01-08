

import { Description, VariableRef, ContentId } from '../types/common';
import { ItemRef, ActorRef } from '../types/area';
import { Command } from '../types/command';
import { InternalActor } from './iactor';


export interface InternalArea {
    refs: Array<ContentId>;
    id: ContentId;
    tags?: Array<string>;
    name: string;
    desc: Description;
    firstDesc?: Description;
    commands: Array<Command>;
    items?: Array<ItemRef>;
    actors?: Array<InternalActor>;
}





