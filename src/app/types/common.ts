
// A reference to content in the game.
// In the form: namespace:type:name, like core:area:bedroom.
export type ContentId = string;

// Template for text that will be displayed. Can contain 0 or more
// number of template text blocks, like {{player.health}}.
export type TemplateText = string;

// A reference to a variable in the game.
// In the form: namespace:name, like global:has_opened_bedroom_door.
export type VariableRef = string;

// 'area', 'player', 'area:<monster or item id>'
export type TargetRef = string;

export type TemplateTextArray = Array<TemplateText>

export interface DescriptionObject {
    text: TemplateTextArray;

    // Normally in events, we might for example have a description text
    // for an area and then after that automatically print the list of
    // items in the area. You can all the game entities like items or
    // monsters you don't want to be listed, maybe to list them more
    // descriptively in the text property.
    noSeparateDesc?: Array<ContentId>;
}

export type Description = TemplateText | TemplateTextArray | DescriptionObject;
