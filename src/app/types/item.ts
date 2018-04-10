
import { Description, ContentId } from './common';
import { Command } from './command';

export interface Item {
    id: ContentId;

    name: string;

    // Default description.
    desc: Description;

    // Set to true to allow carrying. Can also specify an object for
    // detailed config.
    carry?: boolean | {
        // The description when picked up. If this does not exist,
        // will show a generic description on pickup.
        onPickupDesc: Description;

        // The description to show when carrying this item.
        // If this does not exist, will use default desc.
        carryDesc: Description;

        // The description to show when the item has been dropped
        // once.
        droppedDesc: Description;
    }
    
    commands?: Array<Command>;
}

// No item data yet yet
// export interface RawItemData {
//     lastAttack?: number;
//     lastGrunt?: number;
//     isAngry?: boolean;
// }

export interface ItemRef {
    ref: ContentId;
    data?: Object
}
