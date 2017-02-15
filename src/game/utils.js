

export function isArray(val) {
    return typeof val === 'object' && val.length;
}

export function ensureArray(val) {
	return isArray(val) ? val : [val];
}
