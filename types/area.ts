
import { Description, VariableRef, ContentId } from './common';
import { Command } from './command';

export interface Area {
    refs: Array<ContentId>;
    id: ContentId;
    tags?: Array<string>;
    name: string;
    desc: Description;
    firstDesc?: Description;
    commands: Array<Command>;
    items?: Array<ContentId>
}

