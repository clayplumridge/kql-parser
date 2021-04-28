export function replaceAll(
    baseString: string,
    replace: string,
    replacement: string
) {
    return baseString.split(replace).join(replacement);
}

export function isDefined<T>(test: T | undefined): test is T {
    return test !== undefined;
}

export function trim(base: string, substring: string): string {
    while (base.charAt(0) == substring) {
        base = base.substring(1);
    }

    while (base.charAt(base.length - 1) == substring) {
        base = base.substring(0, base.length - 1);
    }

    return base;
}
