
import { Command } from '../types/command';
import { Area } from '../types/area';

export interface PlayerItemRef {
    ref: string;
    equipped: boolean;
}

export interface Player {
    name: string;
    health: number;
    items: Array<PlayerItemRef>;
    vars: any[];
    stats: {
        brawn: number;
        gait: number;
        allure: number;
        mind: number;
        grit: number;
        luck: number;
    };
}

export interface State {
    game: {
        askedName: boolean;
        initialized: boolean;
    };
    player: Player;
    lastArea: any;
    currentArea: Area;
    areas: any;
    vars: any;
    id: number;
    lastInput: string;
    time: number;
    cmds: number;
    suggestions: {
        areaCmds: Command[];
        builtins: Command[];
    };
    output: string[];
}

