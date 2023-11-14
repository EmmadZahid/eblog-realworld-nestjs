declare global {
    namespace jest {
        interface Matchers<R> {
            toThrowErrorObject(a): R;
        }
    }
}

export {};
