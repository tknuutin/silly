
import $ from 'jquery';
import * as Bacon from 'baconjs';
import * as BJQ from 'bacon.jquery';

$.fn.asEventStream = Bacon.$.asEventStream;

export default $;