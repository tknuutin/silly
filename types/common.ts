
// A reference to content in the game.
// In the form: namespace:type:name, like core:area:bedroom.
export type ContentId = string;

// Template for text that will be displayed. Can contain 0 or more
// number of template text blocks, like {{player.health}}.
export type TemplateText = string;

// A reference to a variable in the game.
// In the form: namespace:name, like global:has_opened_bedroom_door.
export type VariableRef = string;

export type DescriptionTemplateTextArray = Array<TemplateText>

export interface DescriptionObject {
    text: DescriptionTemplateTextArray;
    noSeparateDesc: Array<ContentId>;
}

export type Description = TemplateText | DescriptionTemplateTextArray | DescriptionObject;
