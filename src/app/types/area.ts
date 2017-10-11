
import { Description, VariableRef, ContentId } from './common';
import { Command } from './command';

type Asd = number | boolean;

interface ItemRef {
    ref: ContentId;
    asd?: Asd
}

export interface Area {
    // References to other content that this area might deal with. Must be
    // an exhaustive list, since these are loaded from the server on area load.
    // If not exhaustive, the game will throw an error for a missing resource.
    refs: Array<ContentId>;

    // Id of the area.
    id: ContentId;

    // Tags for what kind of an area this is. Like, room, yard, outside, etc.
    tags?: Array<string>;

    // Name of the area.
    name: string;

    // Normal description of the area.
    desc: Description;

    // First time description of the area.
    firstDesc?: Description;

    // Commands available in the area.
    commands: Array<Command>;

    // Items lying around in the area.
    items?: Array<ItemRef>;

    // NPCs present in the area.
    actors?: Array<ItemRef>;
}

