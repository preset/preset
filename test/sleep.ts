export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * This is an artificial slow, needed because tests can fail because of filesystem
 * operations that conflict. I'm not sure why that happens. This is basically a delay
 * before each test.
 * I know, I know. I accept PR if you know how to better do this...
 */
export const delay = 1500;
