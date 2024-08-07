/**
 * Deep copy the given object.
 */
export function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const copy: any = Array.isArray(obj) ? [] : {};

  Object.keys(obj).forEach((key) => {
    copy[key] = deepCopy((obj as any)[key]);
  });

  return copy;
}

/**
 * If the given value is not an array, wrap it in one.
 */
export function arrayWrap<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Determine if the given data has files.
 */
export function hasFiles(data: File | Blob | FileList | Record<string, any>): boolean {
  return (
    data instanceof File ||
    data instanceof Blob ||
    (typeof FileList !== 'undefined' && data instanceof FileList) ||
    (typeof data === 'object' &&
      data !== null &&
      Object.values(data).find((value) => hasFiles(value)) !== undefined)
  );
}

/**
 * Deeply compare two objects or arrays.
 */
export function deepCompare(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object'
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepCompare(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
