export function isValidIdentifier(identifier: string): boolean {
	const validIdentifier = /^[a-zA-Z0-9_]+$/;
	return validIdentifier.test(identifier);
}
